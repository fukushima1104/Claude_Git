import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { QUESTIONS } from '@/data/questions';
import { summarizeAnswers, defaultDueDate, suggestTags } from '@/lib/navi';
import { NaviBubble } from '@/components/navi/NaviBubble';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { todayISO, formatDate } from '@/lib/format';
import type { ReflectionAnswers } from '@/data/types';

/**
 * 4. セッション完了・サマリー確認。
 * ナビが整えた文面は「下書き」として出し、本人が直せることを前面に出す。
 */
export function SummaryPage() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { getRecord, dispatch, saveReflection } = useApp();
  const record = getRecord(recordId);

  const draft = useMemo<ReflectionAnswers>(
    () =>
      record?.answers
        ? summarizeAnswers(record.answers)
        : { learning: '', apply: '', action: '' },
    [record],
  );

  const [answers, setAnswers] = useState<ReflectionAnswers>(draft);
  const [editing, setEditing] = useState<keyof ReflectionAnswers | null>(null);
  const [goalTitle, setGoalTitle] = useState(draft.action);
  const [dueDate, setDueDate] = useState(defaultDueDate(todayISO()));

  if (!record) return <p className="p-8">記録が見つかりませんでした。</p>;

  const tags = Array.from(new Set([...record.tags, ...suggestTags(answers)]));

  function confirm() {
    if (!record) return;
    saveReflection(record.id, {
      answers,
      tags,
      durationSec: record.durationSec ?? 0,
      done: true,
      transcript: record.transcript,
      reflectedOn: todayISO(),
    });
    if (goalTitle.trim()) {
      dispatch({
        type: 'addGoal',
        goal: {
          id: `g-${Date.now()}`,
          recordId: record.id,
          title: goalTitle.trim(),
          dueDate,
          status: 'notStarted',
          updates: [],
        },
      });
    }
    navigate(`/records/${record.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <NaviBubble size="lg">
        おつかれさまでした。伺ったことを、3つにまとめました。
        違うところがあれば、遠慮なく直してください。
      </NaviBubble>

      <div className="mt-8 space-y-4">
        {QUESTIONS.map((q) => {
          const key = q.id as keyof ReflectionAnswers;
          const isEditing = editing === key;
          return (
            <Card key={q.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-base font-medium text-ink-700">{q.step}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(isEditing ? null : key)}
                >
                  {isEditing ? '直し終えた' : '自分の言葉に直す'}
                </Button>
              </div>
              {isEditing ? (
                <textarea
                  value={answers[key]}
                  autoFocus
                  onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))}
                  className="mt-3 min-h-[120px] w-full resize-y rounded-md border border-line-strong bg-surface px-3 py-2.5 text-base leading-relaxed"
                />
              ) : (
                <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-ink-900">
                  {answers[key] || (
                    <span className="text-ink-600">まだ書かれていません</span>
                  )}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-lg">行動目標を決める</h2>
        <p className="mt-1 text-sm text-ink-600">
          小さくて構いません。期限があると、あとで振り返りやすくなります。
        </p>
        <label htmlFor="goal" className="mt-4 block text-sm font-medium text-ink-700">
          やってみること
        </label>
        <textarea
          id="goal"
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
          className="mt-2 min-h-[80px] w-full resize-y rounded-md border border-line-strong bg-surface px-3 py-2.5 text-base"
        />
        <label htmlFor="due" className="mt-4 block text-sm font-medium text-ink-700">
          いつまでに
        </label>
        <input
          id="due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="num mt-2 rounded-md border border-line-strong bg-surface px-3 py-2.5 text-base"
        />
        <p className="mt-2 text-sm text-ink-600">{formatDate(dueDate, { weekday: true })}</p>
      </Card>

      <div className="mt-6">
        <p className="text-sm text-ink-600">ナビが付けたテーマ</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Tag key={t} className="border-primary-100 bg-primary-50 text-primary-900">
              {t}
            </Tag>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="lg" onClick={() => navigate('/')}>
          下書きのままにする
        </Button>
        <Button variant="primary" size="lg" onClick={confirm}>
          この内容で残す
        </Button>
      </div>
    </div>
  );
}
