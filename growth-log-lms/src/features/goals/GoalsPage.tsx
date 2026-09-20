import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { PageHeader, SectionTitle, EmptyState } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag, ToggleTag } from '@/components/ui/Tag';
import { NaviBubble } from '@/components/navi/NaviBubble';
import { ActionStack } from '@/components/viz/ActionStack';
import { GOAL_STATUS_LABEL, GOAL_STATUS_STYLE } from '@/lib/labels';
import { daysBetween, formatDate, relativeToToday, todayISO } from '@/lib/format';
import type { Goal, GoalStatus } from '@/data/types';
import { cn } from '@/lib/cn';

const STATUSES: GoalStatus[] = ['notStarted', 'inProgress', 'achieved', 'revising'];

/**
 * 7. 行動目標トラッカー。
 * 達成率は出さない。期限が近いものを上に出し、「いま書ける進捗」を受け取ることに絞る。
 */
export function GoalsPage() {
  const { goals, getRecord, dispatch } = useApp();
  const [filter, setFilter] = useState<GoalStatus[]>([]);

  const visible = useMemo(() => {
    const list = filter.length === 0 ? goals : goals.filter((g) => filter.includes(g.status));
    return [...list].sort((a, b) => {
      const openA = a.status === 'inProgress' || a.status === 'notStarted';
      const openB = b.status === 'inProgress' || b.status === 'notStarted';
      if (openA !== openB) return openA ? -1 : 1;
      return a.dueDate < b.dueDate ? -1 : 1;
    });
  }, [goals, filter]);

  /** ナビが声をかける対象:期限が2週間以内で、まだ動いていないもの。 */
  const nudge = goals.find(
    (g) =>
      (g.status === 'inProgress' || g.status === 'notStarted') &&
      daysBetween(todayISO(), g.dueDate) >= 0 &&
      daysBetween(todayISO(), g.dueDate) <= 14,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="行動目標"
        lead="振り返りのたびに決めた「やってみること」が並びます。できなかったものも、見直せば前に進みます。"
      />

      <Card className="p-6">
        <ActionStack goals={goals} />
      </Card>

      {nudge && (
        <Card tone="navi" className="p-6">
          <NaviBubble>
            「{nudge.title}」の期限が{relativeToToday(nudge.dueDate)}です。
            進み具合はいかがですか。うまくいっていなければ、見直しても構いません。
          </NaviBubble>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-600">状態</span>
        {STATUSES.map((s) => (
          <ToggleTag
            key={s}
            active={filter.includes(s)}
            onClick={() =>
              setFilter(filter.includes(s) ? filter.filter((x) => x !== s) : [...filter, s])
            }
          >
            {GOAL_STATUS_LABEL[s]}
          </ToggleTag>
        ))}
        {filter.length > 0 && (
          <Button variant="quiet" size="sm" onClick={() => setFilter([])}>
            絞り込みを外す
          </Button>
        )}
      </div>

      <section aria-label="行動目標の一覧">
        <SectionTitle>
          <span className="num">{visible.length}</span>
          <span className="ml-1">件</span>
        </SectionTitle>
        {visible.length === 0 ? (
          <EmptyState>この状態の行動目標はありません。</EmptyState>
        ) : (
          <ul className="space-y-4">
            {visible.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                recordTitle={getRecord(g.recordId)?.title}
                onStatus={(status) => dispatch({ type: 'setGoalStatus', id: g.id, status })}
                onNote={(note) =>
                  dispatch({ type: 'addGoalUpdate', id: g.id, note, date: todayISO() })
                }
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function GoalCard({
  goal,
  recordTitle,
  onStatus,
  onNote,
}: {
  goal: Goal;
  recordTitle?: string;
  onStatus: (s: GoalStatus) => void;
  onNote: (note: string) => void;
}) {
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const left = daysBetween(todayISO(), goal.dueDate);
  const overdue = left < 0 && goal.status !== 'achieved';

  return (
    <Card as="li" className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Tag size="sm" className={GOAL_STATUS_STYLE[goal.status]}>
          {GOAL_STATUS_LABEL[goal.status]}
        </Tag>
        <span className="num text-sm text-ink-600">{formatDate(goal.dueDate)}まで</span>
        <span className={cn('text-sm', overdue ? 'text-amber-700' : 'text-ink-600')}>
          {overdue ? '期限を過ぎています' : relativeToToday(goal.dueDate)}
        </span>
      </div>

      <p className="mt-2 text-base leading-relaxed text-ink-900">{goal.title}</p>

      {recordTitle && (
        <Link
          to={`/records/${goal.recordId}`}
          className="mt-2 inline-block text-sm text-primary-700 underline underline-offset-4"
        >
          もとの記録:{recordTitle}
        </Link>
      )}

      {goal.updates.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-l-2 border-line pl-4">
          {goal.updates.map((u, i) => (
            <li key={i} className="text-sm text-ink-600">
              <span className="num">{formatDate(u.date)}</span>:{u.note}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-600">状態を変える</span>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={goal.status === s}
            onClick={() => onStatus(s)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm transition-colors',
              goal.status === s
                ? 'border-primary-700 bg-primary-50 text-primary-900'
                : 'border-line bg-surface text-ink-700 hover:bg-sunken',
            )}
          >
            {GOAL_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {open ? (
          <div>
            <label
              htmlFor={`note-${goal.id}`}
              className="block text-sm font-medium text-ink-700"
            >
              いまの進み具合
            </label>
            <textarea
              id={`note-${goal.id}`}
              value={note}
              autoFocus
              onChange={(e) => setNote(e.target.value)}
              placeholder="やってみて気づいたことを、ひとことで。"
              className="mt-2 min-h-[80px] w-full resize-y rounded-md border border-line-strong bg-surface px-3 py-2.5 text-base"
            />
            <div className="mt-3 flex gap-3">
              <Button
                variant="primary"
                size="sm"
                disabled={!note.trim()}
                onClick={() => {
                  onNote(note.trim());
                  setNote('');
                  setOpen(false);
                }}
              >
                書き足す
              </Button>
              <Button variant="quiet" size="sm" onClick={() => setOpen(false)}>
                やめる
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
            進み具合を書く
          </Button>
        )}
      </div>
    </Card>
  );
}
