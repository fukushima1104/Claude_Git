import { useApp } from '@/store/AppStore';
import { Card, CardLink } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { NaviBubble } from '@/components/navi/NaviBubble';
import { RecordRow } from '@/components/ui/RecordRow';
import { ActionStack } from '@/components/viz/ActionStack';
import { SectionTitle, EmptyState } from '@/components/ui/PageHeader';
import { Tag } from '@/components/ui/Tag';
import { WEEKLY_NOTE } from '@/data/mock';
import { KIND_LABEL, KIND_STYLE, GOAL_STATUS_STYLE, GOAL_STATUS_LABEL } from '@/lib/labels';
import { formatDate, relativeToToday, todayISO, daysBetween } from '@/lib/format';

/**
 * 1. ホーム。
 * 最優先は「振り返り待ち」。ただし急かす色や言い回しは使わない。
 */
export function HomePage() {
  const { user, awaitingRecords, doneRecords, goals } = useApp();
  const recent = doneRecords.slice(0, 3);
  const activeGoals = goals
    .filter((g) => g.status === 'inProgress' || g.status === 'notStarted')
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    .slice(0, 4);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-base text-ink-600">{formatDate(todayISO(), { weekday: true })}</p>
        <h1 className="mt-1 text-2xl">{user.name} さんの成長ログ</h1>
      </header>

      {/* 振り返り待ち。最優先で目に入る位置に置く。 */}
      <section aria-labelledby="awaiting">
        <SectionTitle>
          <span id="awaiting">振り返りませんか</span>
        </SectionTitle>
        {awaitingRecords.length === 0 ? (
          <EmptyState>
            いまは待っている振り返りはありません。学びを登録すると、ここに出てきます。
          </EmptyState>
        ) : (
          <ul className="space-y-4">
            {awaitingRecords.map((r) => (
              <Card key={r.id} tone="attention" as="li" className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag size="sm" className={KIND_STYLE[r.kind]}>
                    {KIND_LABEL[r.kind]}
                  </Tag>
                  <span className="num text-sm text-amber-700">
                    {formatDate(r.date)}・{relativeToToday(r.date)}
                  </span>
                </div>
                <h3 className="mt-2 text-xl">{r.title}</h3>
                <p className="mt-2 text-base text-ink-700">
                  {r.status === 'draft'
                    ? '前回は途中まででした。続きからどうぞ。'
                    : '3つの質問に答えるだけです。5分ほどで終わります。'}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink
                    to={`/session/${r.id}`}
                    variant="primary"
                    size="lg"
                    className="sm:w-auto"
                  >
                    {r.status === 'draft' ? '続きから振り返る' : '振り返りを始める'}
                  </ButtonLink>
                  <ButtonLink to={`/records/${r.id}`} variant="ghost" size="lg">
                    内容を見る
                  </ButtonLink>
                </div>
              </Card>
            ))}
          </ul>
        )}
      </section>

      {/* ナビからの今週のひとこと */}
      <section aria-labelledby="weekly">
        <SectionTitle>
          <span id="weekly">今週のひとこと</span>
        </SectionTitle>
        <Card tone="navi" className="p-6">
          <NaviBubble>{WEEKLY_NOTE}</NaviBubble>
          <div className="mt-4 pl-10">
            <ButtonLink to="/advice" variant="ghost" size="sm">
              アドバイスを詳しく見る
            </ButtonLink>
          </div>
        </Card>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* 直近の記録 */}
        <section aria-labelledby="recent">
          <SectionTitle
            action={
              <ButtonLink to="/timeline" variant="ghost" size="sm">
                すべて見る
              </ButtonLink>
            }
          >
            <span id="recent">直近の記録</span>
          </SectionTitle>
          <ul className="space-y-3">
            {recent.map((r) => (
              <RecordRow key={r.id} record={r} />
            ))}
          </ul>
        </section>

        {/* 行動目標の進捗 */}
        <section aria-labelledby="goals">
          <SectionTitle
            action={
              <ButtonLink to="/goals" variant="ghost" size="sm">
                すべて見る
              </ButtonLink>
            }
          >
            <span id="goals">行動目標の積み重ね</span>
          </SectionTitle>
          <Card className="p-6">
            <ActionStack goals={goals} />
          </Card>
          <ul className="mt-4 space-y-3">
            {activeGoals.map((g) => {
              const left = daysBetween(todayISO(), g.dueDate);
              return (
                <CardLink key={g.id} to="/goals" as="li" className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag size="sm" className={GOAL_STATUS_STYLE[g.status]}>
                      {GOAL_STATUS_LABEL[g.status]}
                    </Tag>
                    <span className="num text-sm text-ink-600">
                      {formatDate(g.dueDate)}まで
                    </span>
                    {left < 0 ? (
                      <span className="text-sm text-amber-700">期限を過ぎています</span>
                    ) : (
                      left <= 14 && (
                        <span className="text-sm text-amber-700">
                          {relativeToToday(g.dueDate)}
                        </span>
                      )
                    )}
                  </div>
                  <p className="mt-2 text-base text-ink-900">{g.title}</p>
                </CardLink>
              );
            })}
          </ul>
        </section>
      </div>

      <section>
        <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg">研修や勉強会に参加しましたか</h2>
            <p className="mt-1 text-base text-ink-600">
              登録すると、振り返りの準備ができます。
            </p>
          </div>
          <ButtonLink to="/register" variant="secondary" size="lg">
            学びを登録する
          </ButtonLink>
        </Card>
      </section>
    </div>
  );
}
