import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { useCamera } from '@/lib/useCamera';
import { QUESTIONS } from '@/data/questions';
import type { QuestionId, ReflectionAnswers, TranscriptLine } from '@/data/types';
import { needsFollowUp, naviClosingLine, suggestTags } from '@/lib/navi';
import { CameraStage, CaptionOverlay, MicLevel } from '@/components/ui/CameraStage';
import { NaviBubble, MyBubble } from '@/components/navi/NaviBubble';
import { StepBar } from '@/components/ui/StepBar';
import { RecordingDot } from '@/components/ui/RecordingDot';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SAMPLE_SPEECH } from './sampleSpeech';
import { todayISO } from '@/lib/format';
import { cn } from '@/lib/cn';

type ChatEntry =
  | { kind: 'navi'; text: string; followUp?: boolean }
  | { kind: 'me'; text: string };

const EMPTY: ReflectionAnswers = { learning: '', apply: '', action: '' };

/**
 * 3b. AI振り返りセッション本編。
 *
 * 設計の要点:
 * - 進み具合は3点だけ。残り時間やパーセンテージは出さない。
 * - 深掘りは1問につき1回まで。2回目は促さず、先に進める言葉を返す。
 * - 「やり直す」はいまの質問の回答だけを消す。前の質問には触れない。
 * - 「あとで続ける」は破棄ではなく保存。ホームに「続きから」として戻る。
 */
export function SessionPage() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const textOnly = params.get('mode') === 'text';

  const { getRecord, saveReflection } = useApp();
  const record = getRecord(recordId);

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<ReflectionAnswers>(EMPTY);
  const [chat, setChat] = useState<Record<QuestionId, ChatEntry[]>>({
    learning: [],
    apply: [],
    action: [],
  });
  /** 深掘りを出したかどうか。1問につき1回まで。 */
  const [followedUp, setFollowedUp] = useState<Record<QuestionId, boolean>>({
    learning: false,
    apply: false,
    action: false,
  });
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [captionSize, setCaptionSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [speaking, setSpeaking] = useState(false);
  const [confirmRedo, setConfirmRedo] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const question = QUESTIONS[stepIndex];
  const answer = answers[question.id];
  const { videoRef, state, level } = useCamera(!textOnly);
  const logRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<TranscriptLine[]>([]);

  // 経過時間。一時停止中は止まる。
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [paused]);

  // 最初の質問をログに入れる
  useEffect(() => {
    setChat((c) =>
      c.learning.length === 0
        ? { ...c, learning: [{ kind: 'navi', text: QUESTIONS[0].prompt }] }
        : c,
    );
  }, []);

  // 新しい発話が増えたら、ログの末尾へ
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat, stepIndex]);

  const appendTranscript = useCallback(
    (line: Omit<TranscriptLine, 'at'>) => {
      transcriptRef.current = [...transcriptRef.current, { at: seconds, ...line }];
    },
    [seconds],
  );

  /** 「話して答える」。音声認識の代わりに、下書きを少しずつ流し込む。 */
  const speak = useCallback(() => {
    if (speaking || paused) return;
    setSpeaking(true);
    const chunks = SAMPLE_SPEECH[question.id] ?? [];
    let i = 0;
    const timer = setInterval(() => {
      if (i >= chunks.length) {
        clearInterval(timer);
        setSpeaking(false);
        return;
      }
      const chunk = chunks[i++];
      setAnswers((a) => ({ ...a, [question.id]: a[question.id] + chunk }));
    }, 900);
  }, [question.id, speaking, paused]);

  const redo = useCallback(() => {
    setAnswers((a) => ({ ...a, [question.id]: '' }));
    setChat((c) => ({
      ...c,
      [question.id]: [{ kind: 'navi', text: question.prompt }],
    }));
    setFollowedUp((f) => ({ ...f, [question.id]: false }));
    setConfirmRedo(false);
  }, [question]);

  const buildTranscript = useCallback((): TranscriptLine[] => {
    // 実物では音声認識の結果を使う。ここでは確定した回答から組み立てる。
    const lines: TranscriptLine[] = [];
    let at = 4;
    (Object.keys(chat) as QuestionId[]).forEach((q) => {
      chat[q].forEach((entry) => {
        lines.push({
          at,
          speaker: entry.kind === 'navi' ? 'navi' : 'me',
          text: entry.text,
          question: q,
          isFollowUp: entry.kind === 'navi' ? entry.followUp : undefined,
        });
        at += Math.max(8, Math.round(entry.text.length / 2.6));
      });
    });
    return lines;
  }, [chat]);

  const goNext = useCallback(() => {
    const trimmed = answer.trim();
    if (!trimmed) return;

    setChat((c) => ({ ...c, [question.id]: [...c[question.id], { kind: 'me', text: trimmed }] }));
    appendTranscript({ speaker: 'me', text: trimmed, question: question.id });

    // 回答が短ければ、1度だけ深掘りする
    if (needsFollowUp(trimmed) && !followedUp[question.id]) {
      setFollowedUp((f) => ({ ...f, [question.id]: true }));
      setChat((c) => ({
        ...c,
        [question.id]: [
          ...c[question.id],
          { kind: 'navi', text: question.followUp, followUp: true },
        ],
      }));
      appendTranscript({
        speaker: 'navi',
        text: question.followUp,
        question: question.id,
        isFollowUp: true,
      });
      setAnswers((a) => ({ ...a, [question.id]: '' }));
      return;
    }

    // 2回目は促さず、先へ
    setChat((c) => ({
      ...c,
      [question.id]: [...c[question.id], { kind: 'navi', text: naviClosingLine(trimmed.length) }],
    }));

    if (stepIndex === QUESTIONS.length - 1) {
      const merged = mergeAnswers(chat, answers, question.id, trimmed);
      saveReflection(record!.id, {
        answers: merged,
        tags: Array.from(new Set([...(record!.tags ?? []), ...suggestTags(merged)])),
        durationSec: seconds,
        done: false,
        transcript: buildTranscript(),
        reflectedOn: todayISO(),
      });
      navigate(`/session/${record!.id}/summary`);
      return;
    }

    const nextQ = QUESTIONS[stepIndex + 1];
    setChat((c) => ({ ...c, [nextQ.id]: [{ kind: 'navi', text: nextQ.prompt }] }));
    appendTranscript({ speaker: 'navi', text: nextQ.prompt, question: nextQ.id });
    setStepIndex(stepIndex + 1);
  }, [
    answer,
    answers,
    appendTranscript,
    buildTranscript,
    chat,
    followedUp,
    navigate,
    question,
    record,
    saveReflection,
    seconds,
    stepIndex,
  ]);

  const saveAndLeave = useCallback(() => {
    if (!record) return;
    const merged = mergeAnswers(chat, answers, question.id, answer.trim());
    saveReflection(record.id, {
      answers: merged,
      tags: record.tags,
      durationSec: seconds,
      done: false,
      transcript: buildTranscript(),
      reflectedOn: todayISO(),
    });
    navigate('/');
  }, [
    answer,
    answers,
    buildTranscript,
    chat,
    navigate,
    question.id,
    record,
    saveReflection,
    seconds,
  ]);

  // キーボード操作。入力欄にいるときは邪魔しない。
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing =
        e.target instanceof HTMLElement &&
        ['TEXTAREA', 'INPUT'].includes(e.target.tagName);
      if (e.key === 'Escape') {
        setConfirmLeave(true);
        return;
      }
      if (typing) return;
      if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext]);

  const caption = useMemo(() => answer.slice(-60), [answer]);

  if (!record) return <p className="p-8">記録が見つかりませんでした。</p>;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 上部:状態と進み具合。いつでも中断できることを常に見せる。 */}
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1320px] px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              {!textOnly && (
                <RecordingDot state={paused ? 'paused' : 'recording'} seconds={seconds} />
              )}
              <p className="hidden truncate text-sm text-ink-600 sm:block">
                {record.title} の振り返り
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!textOnly && (
                <Button variant="quiet" size="sm" onClick={() => setPaused((p) => !p)}>
                  {paused ? '再開する' : '一時停止'}
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setConfirmLeave(true)}>
                中断する
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <StepBar steps={QUESTIONS.map((q) => q.step)} current={stepIndex} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* 左(スマホでは上):自分の映像 */}
        <div className="sticky top-[86px] z-10 space-y-3 self-start bg-canvas pb-3 sm:top-[92px] lg:top-36 lg:space-y-4 lg:pb-0">
          {!textOnly ? (
            <>
              <CameraStage
                videoRef={videoRef}
                state={state}
                paused={paused}
                className="mx-auto max-h-[22vh] sm:max-h-[30vh] lg:max-h-none"
              >
                <CaptionOverlay text={paused ? '' : caption} size={captionSize} />
              </CameraStage>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <MicLevel level={paused ? 0 : level} />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink-600">字幕</span>
                  {(['sm', 'md', 'lg'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={captionSize === s}
                      onClick={() => setCaptionSize(s)}
                      className={cn(
                        'rounded-md border px-2 py-1 text-sm',
                        captionSize === s
                          ? 'border-primary-700 bg-primary-50 text-primary-900'
                          : 'border-line text-ink-600',
                      )}
                    >
                      {s === 'sm' ? '小' : s === 'md' ? '中' : '大'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-line bg-surface p-6">
              <p className="text-base text-ink-700">
                文章だけのモードです。カメラは使っていません。
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirmRedo(true)}>
              この質問をやり直す
            </Button>
            {!textOnly && (
              <Button variant="ghost" size="sm" onClick={speak} disabled={speaking || paused}>
                {speaking ? '聞き取っています…' : '話して答える'}
              </Button>
            )}
          </div>
        </div>

        {/* 右(スマホでは下):ナビとのやりとり */}
        <div className="flex min-h-0 flex-col">
          <div
            ref={logRef}
            className="max-h-[34vh] space-y-5 overflow-y-auto pr-1 sm:max-h-[46vh] lg:max-h-[52vh]"
          >
            {QUESTIONS.slice(0, stepIndex + 1).map((q) => (
              <section key={q.id} aria-label={q.step} className="space-y-4">
                {stepIndex > 0 && (
                  <p className="text-xs font-medium uppercase tracking-widest text-ink-600">
                    {q.step}
                  </p>
                )}
                {chat[q.id].map((entry, i) =>
                  entry.kind === 'navi' ? (
                    <NaviBubble
                      key={i}
                      size={q.id === question.id && i === chat[q.id].length - 1 ? 'lg' : 'md'}
                      live={q.id === question.id && i === chat[q.id].length - 1}
                      followUp={entry.followUp}
                      listening={!paused}
                    >
                      {entry.text}
                    </NaviBubble>
                  ) : (
                    <MyBubble key={i}>{entry.text}</MyBubble>
                  ),
                )}
              </section>
            ))}
          </div>

          <div className="mt-5 border-t border-line pt-5">
            <label htmlFor="answer" className="mb-2 block text-sm font-medium text-ink-700">
              {textOnly ? 'あなたの答え' : 'あなたの答え(話した内容はここに入ります)'}
            </label>
            <textarea
              id="answer"
              value={answer}
              disabled={paused}
              onChange={(e) => setAnswers((a) => ({ ...a, [question.id]: e.target.value }))}
              placeholder={question.placeholder}
              className="min-h-[120px] w-full resize-y rounded-md border border-line-strong bg-surface px-3 py-2.5 text-base leading-relaxed placeholder:text-ink-400 disabled:bg-sunken"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setConfirmLeave(true)}
                className="text-sm text-ink-600 underline underline-offset-4"
              >
                あとで続ける(ここまで保存します)
              </button>
              <Button
                variant="primary"
                size="lg"
                onClick={goNext}
                disabled={!answer.trim() || paused}
                className="sm:w-auto"
                block
              >
                {stepIndex === QUESTIONS.length - 1
                  ? '答え終えました'
                  : '答え終えました:次の質問へ'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {paused && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center px-4">
          <p className="rounded-full bg-navi-50 px-5 py-2.5 text-base text-navi-700 shadow-raised">
            ゆっくりどうぞ。戻れるようになったら「再開する」を押してください。
          </p>
        </div>
      )}

      <Dialog
        open={confirmRedo}
        title="この質問をやり直しますか"
        description="いまの質問の答えだけを消します。前の質問の答えはそのまま残ります。"
        onClose={() => setConfirmRedo(false)}
      >
        <Button variant="secondary" onClick={() => setConfirmRedo(false)}>
          やめる
        </Button>
        <Button variant="primary" onClick={redo}>
          やり直す
        </Button>
      </Dialog>

      <Dialog
        open={confirmLeave}
        title="ここで中断しますか"
        description="ここまでの内容は保存されます。ホームから「続きから」で再開できます。"
        onClose={() => setConfirmLeave(false)}
      >
        <Button variant="secondary" onClick={() => setConfirmLeave(false)}>
          続ける
        </Button>
        <Button variant="primary" onClick={saveAndLeave}>
          保存して中断する
        </Button>
      </Dialog>
    </div>
  );
}

/** ログと、いま入力中の答えから、3項目の回答をまとめる。 */
function mergeAnswers(
  chat: Record<QuestionId, ChatEntry[]>,
  answers: ReflectionAnswers,
  currentId: QuestionId,
  currentText: string,
): ReflectionAnswers {
  const fromChat = (q: QuestionId) =>
    chat[q]
      .filter((e) => e.kind === 'me')
      .map((e) => e.text)
      .join(' ');
  const result = { ...answers };
  (['learning', 'apply', 'action'] as QuestionId[]).forEach((q) => {
    const said = fromChat(q);
    result[q] = q === currentId ? [said, currentText].filter(Boolean).join(' ') : said;
  });
  return result;
}
