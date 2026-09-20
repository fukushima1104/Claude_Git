import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { Card } from '@/components/ui/Card';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Dialog } from '@/components/ui/Dialog';
import { NaviBubble } from '@/components/navi/NaviBubble';
import { QUESTION_LABEL } from '@/data/questions';
import {
  GOAL_STATUS_LABEL,
  GOAL_STATUS_STYLE,
  KIND_LABEL,
  KIND_STYLE,
  VISIBILITY_DESCRIPTION,
  VISIBILITY_LABEL,
} from '@/lib/labels';
import {
  formatClock,
  formatDate,
  formatDuration,
  relativeToToday,
  todayISO,
} from '@/lib/format';
import type { QuestionId, Visibility } from '@/data/types';
import { cn } from '@/lib/cn';

/**
 * 6. 記録詳細。
 * 映像・文字起こし・3項目の回答・行動目標を、同じ画面で行き来できるようにする。
 * 文字起こしの行を押すと、その時刻から再生する。
 */
export function RecordDetailPage() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { getRecord, goalsOfRecord, dispatch, setVisibility } = useApp();
  const record = getRecord(recordId);

  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [note, setNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const transcriptRef = useRef<HTMLOListElement>(null);

  const duration = record?.durationSec ?? 0;

  // 再生のふり。実際の映像は持たないため、時間だけを進める。
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPosition((p) => {
        if (p + 1 >= duration) {
          setPlaying(false);
          return duration;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, duration]);

  const activeLineIndex = useMemo(() => {
    if (!record?.transcript) return -1;
    let idx = -1;
    record.transcript.forEach((l, i) => {
      if (l.at <= position) idx = i;
    });
    return idx;
  }, [record, position]);

  if (!record) {
    return (
      <div className="py-12">
        <p className="text-base">この記録は見つかりませんでした。</p>
        <ButtonLink to="/timeline" variant="ghost" className="mt-4">
          タイムラインに戻る
        </ButtonLink>
      </div>
    );
  }

  const goals = goalsOfRecord(record.id);
  const answered = record.status === 'done' && record.answers;

  return (
    <div className="space-y-8">
      <div>
        <Link to="/timeline" className="text-sm text-primary-700 underline underline-offset-4">
          ← 成長タイムライン
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Tag size="sm" className={KIND_STYLE[record.kind]}>
            {KIND_LABEL[record.kind]}
          </Tag>
          <span className="num text-sm text-ink-600">
            {formatDate(record.date, { weekday: true })}・{relativeToToday(record.date)}
          </span>
          <span className="text-sm text-ink-600">主催:{record.organizer}</span>
        </div>
        <h1 className="mt-2 text-2xl">{record.title}</h1>
        {record.memo && <p className="mt-2 text-base text-ink-600">{record.memo}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {record.tags.map((t) => (
            <Tag key={t} size="sm">
              {t}
            </Tag>
          ))}
        </div>
      </div>

      {record.status !== 'done' && (
        <Card tone="attention" className="p-6">
          <p className="text-base text-ink-900">
            {record.status === 'draft'
              ? 'この記録は、まだ途中までです。'
              : 'この学びは、まだ振り返っていません。'}
          </p>
          <ButtonLink to={`/session/${record.id}`} variant="primary" className="mt-4">
            {record.status === 'draft' ? '続きから振り返る' : '振り返りを始める'}
          </ButtonLink>
        </Card>
      )}

      {record.transcript && record.transcript.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
          {/* 映像(プロトタイプでは再生位置のみ動かす) */}
          <div className="space-y-3 lg:sticky lg:top-6 lg:self-start">
            <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-ink-900">
              <div className="absolute inset-0 grid place-content-center gap-2 px-6 text-center">
                <p className="text-base text-white/85">
                  {playing ? '再生中' : '映像はここに再生されます'}
                </p>
                <p className="text-sm text-white/60">
                  プロトタイプのため、実際の映像は保存していません。
                </p>
              </div>
              {activeLineIndex >= 0 && (
                <p className="absolute inset-x-3 bottom-3 rounded-md bg-ink-900/85 px-3 py-2 text-base text-white">
                  {record.transcript[activeLineIndex].text}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setPlaying((p) => !p)}>
                {playing ? '一時停止' : '再生'}
              </Button>
              <input
                type="range"
                min={0}
                max={duration}
                value={position}
                aria-label="再生位置"
                onChange={(e) => setPosition(Number(e.target.value))}
                className="flex-1 accent-[#15625E]"
              />
              <span className="num text-sm text-ink-600">
                {formatClock(position)} / {formatClock(duration)}
              </span>
            </div>
            <p className="text-sm text-ink-600">
              録画の長さ {formatDuration(duration)}・振り返った日{' '}
              {record.reflectedOn ? formatDate(record.reflectedOn) : '—'}
            </p>
          </div>

          {/* 文字起こし */}
          <section aria-labelledby="transcript">
            <h2 id="transcript" className="mb-3 text-lg">
              文字起こし
            </h2>
            <p className="mb-3 text-sm text-ink-600">
              行を押すと、その場面から再生します。
            </p>
            <ol ref={transcriptRef} className="space-y-2">
              {record.transcript.map((line, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setPosition(line.at)}
                    className={cn(
                      'flex w-full gap-3 rounded-md border px-3 py-2.5 text-left transition-colors',
                      i === activeLineIndex
                        ? 'border-primary-100 bg-primary-50'
                        : 'border-transparent hover:bg-sunken',
                    )}
                  >
                    <span className="num shrink-0 pt-0.5 text-sm text-ink-600">
                      {formatClock(line.at)}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          'block text-sm',
                          line.speaker === 'navi' ? 'text-navi-700' : 'text-ink-600',
                        )}
                      >
                        {line.speaker === 'navi' ? 'ナビ' : 'あなた'}
                        {line.isFollowUp && '(深掘り)'}
                        ・{QUESTION_LABEL[line.question as QuestionId]}
                      </span>
                      <span className="mt-0.5 block text-base text-ink-900">{line.text}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}

      {answered && record.answers && (
        <section aria-labelledby="answers">
          <h2 id="answers" className="mb-4 text-lg">
            3つの答え
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {(['learning', 'apply', 'action'] as const).map((k) => (
              <Card key={k} className="p-6">
                <h3 className="text-base font-medium text-ink-700">{QUESTION_LABEL[k]}</h3>
                <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed">
                  {record.answers![k]}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {goals.length > 0 && (
        <section aria-labelledby="goals">
          <h2 id="goals" className="mb-4 text-lg">
            この記録から立てた行動目標
          </h2>
          <ul className="space-y-3">
            {goals.map((g) => (
              <Card key={g.id} as="li" className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag size="sm" className={GOAL_STATUS_STYLE[g.status]}>
                    {GOAL_STATUS_LABEL[g.status]}
                  </Tag>
                  <span className="num text-sm text-ink-600">
                    {formatDate(g.dueDate)}まで
                  </span>
                </div>
                <p className="mt-2 text-base">{g.title}</p>
                {g.updates.length > 0 && (
                  <ul className="mt-3 space-y-1 border-l-2 border-line pl-4">
                    {g.updates.map((u, i) => (
                      <li key={i} className="text-sm text-ink-600">
                        <span className="num">{formatDate(u.date)}</span>:{u.note}
                      </li>
                    ))}
                  </ul>
                )}
                <ButtonLink to="/goals" variant="ghost" size="sm" className="mt-3">
                  行動目標トラッカーで見る
                </ButtonLink>
              </Card>
            ))}
          </ul>
        </section>
      )}

      {/* あとからのメモ */}
      <section aria-labelledby="notes">
        <h2 id="notes" className="mb-4 text-lg">
          あとから書き足したこと
        </h2>
        <Card className="p-6">
          {record.laterNotes.length === 0 ? (
            <p className="text-base text-ink-600">まだ書き足しはありません。</p>
          ) : (
            <ul className="space-y-4">
              {record.laterNotes.map((n, i) => (
                <li key={i} className="border-l-2 border-primary-100 pl-4">
                  <p className="num text-sm text-ink-600">
                    {formatDate(n.date)}・{relativeToToday(n.date)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-base">{n.text}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 border-t border-line pt-6">
            <label htmlFor="note" className="block text-sm font-medium text-ink-700">
              いま思っていることを書き足す
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="あのときの判断は、いま振り返るとどうでしたか。"
              className="mt-2 min-h-[100px] w-full resize-y rounded-md border border-line-strong bg-surface px-3 py-2.5 text-base"
            />
            <Button
              variant="primary"
              className="mt-3"
              disabled={!note.trim()}
              onClick={() => {
                dispatch({
                  type: 'addLaterNote',
                  id: record.id,
                  text: note.trim(),
                  date: todayISO(),
                });
                setNote('');
              }}
            >
              書き足す
            </Button>
          </div>
        </Card>
      </section>

      {/* 公開範囲 */}
      <section aria-labelledby="visibility">
        <h2 id="visibility" className="mb-4 text-lg">
          この記録を見られる人
        </h2>
        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            {(['self', 'manager', 'team'] as Visibility[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={record.visibility === v}
                onClick={() => setVisibility(record.id, v)}
                className={cn(
                  'rounded-md border px-4 py-2.5 text-base transition-colors',
                  record.visibility === v
                    ? 'border-primary-700 bg-primary-50 text-primary-900'
                    : 'border-line bg-surface text-ink-700 hover:bg-sunken',
                )}
              >
                {VISIBILITY_LABEL[v]}
              </button>
            ))}
          </div>
          <p className="mt-3 text-base text-ink-600">
            {VISIBILITY_DESCRIPTION[record.visibility]}
          </p>
          <div className="mt-6 border-t border-line pt-5">
            <NaviBubble>
              共有をやめたくなったら、いつでも「自分のみ」に戻せます。戻したあとは、
              ほかの人には見えなくなります。
            </NaviBubble>
          </div>
        </Card>
      </section>

      <section>
        <Button variant="quiet" onClick={() => setConfirmDelete(true)}>
          この記録を削除する
        </Button>
      </section>

      <Dialog
        open={confirmDelete}
        title="この記録を削除しますか"
        description="映像・文字起こし・この記録から立てた行動目標も、あわせて消えます。元には戻せません。"
        onClose={() => setConfirmDelete(false)}
      >
        <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
          やめる
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            dispatch({ type: 'deleteRecord', id: record.id });
            navigate('/timeline');
          }}
        >
          削除する
        </Button>
      </Dialog>
    </div>
  );
}
