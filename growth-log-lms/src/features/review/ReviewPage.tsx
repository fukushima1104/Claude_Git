import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { PageHeader, SectionTitle, EmptyState } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ToggleTag, Tag } from '@/components/ui/Tag';
import { NaviBubble } from '@/components/navi/NaviBubble';
import { ThemeSpread } from '@/components/viz/ThemeSpread';
import { ActionStack } from '@/components/viz/ActionStack';
import { ATTAINMENT, ATTAINMENT_LABEL, KIND_LABEL } from '@/lib/labels';
import { formatDate, monthsAgo, todayISO, relativeToToday } from '@/lib/format';
import type { AttainmentLevel, LearningRecord } from '@/data/types';
import { cn } from '@/lib/cn';

const PERIODS = [
  { label: '半年', months: 6 },
  { label: '1年', months: 12 },
  { label: '2年', months: 24 },
];

/**
 * 8. 成長レビュー(自己評価)。
 * 「1年前の自分」と「今の自分」を、同じテーマで縦に並べて比べる。
 * 点数はつけず、実感の言葉で段階を選ぶ。
 */
export function ReviewPage() {
  const { records, goals, reviews, dispatch } = useApp();
  const [months, setMonths] = useState(12);
  const [attainment, setAttainment] = useState<AttainmentLevel>('starting');
  const [grew, setGrew] = useState('');
  const [next, setNext] = useState('');
  const [saved, setSaved] = useState(false);

  const from = monthsAgo(months);
  const inPeriod = useMemo(
    () => records.filter((r) => r.status === 'done' && r.date >= from),
    [records, from],
  );
  const periodGoals = useMemo(() => {
    const ids = new Set(inPeriod.map((r) => r.id));
    return goals.filter((g) => ids.has(g.recordId));
  }, [goals, inPeriod]);

  /** 同じテーマで、期間のはじめと終わりの記録を対にする。 */
  const comparisons = useMemo(() => buildComparisons(records, from), [records, from]);

  function save() {
    dispatch({
      type: 'addReview',
      review: {
        id: `sr-${Date.now()}`,
        from,
        to: todayISO(),
        label: `${PERIODS.find((p) => p.months === months)?.label}の振り返り`,
        attainment,
        grew,
        next,
        createdOn: todayISO(),
      },
    });
    setSaved(true);
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="成長レビュー"
        lead="期間を選んで、過去の自分と今の自分を並べて見ます。点数はつけません。言葉で残してください。"
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-600">振り返る期間</span>
        {PERIODS.map((p) => (
          <ToggleTag
            key={p.label}
            active={months === p.months}
            onClick={() => {
              setMonths(p.months);
              setSaved(false);
            }}
          >
            {p.label}
          </ToggleTag>
        ))}
        <span className="num text-sm text-ink-600">
          {formatDate(from)} 〜 {formatDate(todayISO())}
        </span>
      </div>

      <section aria-labelledby="overview">
        <SectionTitle>
          <span id="overview">この期間に積み上がったもの</span>
        </SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-ink-600">学びの記録</p>
            <p className="num mt-1 text-2xl">{inPeriod.length}</p>
            <p className="mt-2 text-sm text-ink-600">
              {(['external', 'internal', 'study'] as const)
                .map((k) => `${KIND_LABEL[k]} ${inPeriod.filter((r) => r.kind === k).length}`)
                .join(' / ')}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-ink-600">触れたテーマ</p>
            <p className="num mt-1 text-2xl">
              {new Set(inPeriod.flatMap((r) => r.tags)).size}
            </p>
            <p className="mt-2 text-sm text-ink-600">種類の数であって、優劣ではありません</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-ink-600">立てた行動目標</p>
            <p className="num mt-1 text-2xl">{periodGoals.length}</p>
            <p className="mt-2 text-sm text-ink-600">
              うち達成 {periodGoals.filter((g) => g.status === 'achieved').length}
            </p>
          </Card>
        </div>
        <Card className="mt-4 p-6">
          <ActionStack goals={periodGoals} />
        </Card>
        <Card className="mt-4 p-6">
          <h3 className="text-base font-medium text-ink-700">テーマの広がり</h3>
          <div className="mt-4">
            <ThemeSpread records={inPeriod} months={months} />
          </div>
        </Card>
      </section>

      {/* 過去と今の比較 */}
      <section aria-labelledby="compare">
        <SectionTitle>
          <span id="compare">
            {months === 6 ? '半年前' : months === 12 ? '1年前' : '2年前'}の自分と、今の自分
          </span>
        </SectionTitle>
        {comparisons.length === 0 ? (
          <EmptyState>
            同じテーマで比べられる記録が、まだそろっていません。
          </EmptyState>
        ) : (
          <div className="space-y-6">
            {comparisons.map(({ tag, past, now }) => (
              <Card key={tag} className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="border-primary-100 bg-primary-50 text-primary-900">
                    {tag}
                  </Tag>
                  <span className="text-sm text-ink-600">同じテーマで並べています</span>
                </div>
                <div className="mt-5 space-y-4">
                  <ComparePanel label="そのころ" record={past} tone="past" />
                  <div className="flex items-center gap-3 pl-1">
                    <span className="h-8 w-px bg-line-strong" aria-hidden="true" />
                    <span className="text-sm text-ink-600">
                      {monthsLabel(past.date, now.date)}
                    </span>
                  </div>
                  <ComparePanel label="いま" record={now} tone="now" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 自己評価の入力 */}
      <section aria-labelledby="self">
        <SectionTitle>
          <span id="self">自分で、いまの手応えを選ぶ</span>
        </SectionTitle>
        <Card className="p-6">
          <NaviBubble>
            数字ではなく、いちばん近いと感じる言葉を選んでください。あとから変えられます。
          </NaviBubble>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ATTAINMENT.map((a) => (
              <button
                key={a.value}
                type="button"
                aria-pressed={attainment === a.value}
                onClick={() => setAttainment(a.value)}
                className={cn(
                  'rounded-md border px-4 py-3 text-left transition-colors',
                  attainment === a.value
                    ? 'border-primary-700 bg-primary-50'
                    : 'border-line bg-surface hover:bg-sunken',
                )}
              >
                <span className="block text-base font-medium text-ink-900">{a.label}</span>
                <span className="mt-1 block text-sm text-ink-600">{a.hint}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="grew" className="block text-sm font-medium text-ink-700">
                この期間で、成長したと思うこと
              </label>
              <textarea
                id="grew"
                value={grew}
                onChange={(e) => setGrew(e.target.value)}
                placeholder="小さな変化でかまいません。"
                className="mt-2 min-h-[140px] w-full resize-y rounded-md border border-line-strong bg-surface px-3 py-2.5 text-base"
              />
            </div>
            <div>
              <label htmlFor="next" className="block text-sm font-medium text-ink-700">
                次の課題だと思うこと
              </label>
              <textarea
                id="next"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="いま引っかかっていることを、そのまま書いてください。"
                className="mt-2 min-h-[140px] w-full resize-y rounded-md border border-line-strong bg-surface px-3 py-2.5 text-base"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Button variant="primary" size="lg" onClick={save} disabled={!grew.trim()}>
              この振り返りを残す
            </Button>
            {saved && (
              <p role="status" className="text-base text-grow-700">
                残しました。次に見返すときの手がかりになります。
              </p>
            )}
          </div>
        </Card>
      </section>

      {/* これまでの自己評価 */}
      <section aria-labelledby="past-reviews">
        <SectionTitle>
          <span id="past-reviews">これまでの自己評価</span>
        </SectionTitle>
        {reviews.length === 0 ? (
          <EmptyState>まだ自己評価はありません。</EmptyState>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <Card key={r.id} as="li" className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg">{r.label}</h3>
                  <span className="num text-sm text-ink-600">
                    {formatDate(r.from)} 〜 {formatDate(r.to)}
                  </span>
                  <Tag size="sm" className="border-grow-100 bg-grow-50 text-grow-700">
                    {ATTAINMENT_LABEL[r.attainment]}
                  </Tag>
                </div>
                <dl className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-ink-700">成長したと思うこと</dt>
                    <dd className="mt-1 text-base leading-relaxed">{r.grew}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-ink-700">次の課題</dt>
                    <dd className="mt-1 text-base leading-relaxed">{r.next}</dd>
                  </div>
                </dl>
                <p className="num mt-3 text-sm text-ink-600">
                  書いた日:{formatDate(r.createdOn)}・{relativeToToday(r.createdOn)}
                </p>
              </Card>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ComparePanel({
  label,
  record,
  tone,
}: {
  label: string;
  record: LearningRecord;
  tone: 'past' | 'now';
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-5',
        tone === 'past' ? 'border-line bg-sunken' : 'border-primary-100 bg-primary-50',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            tone === 'past' ? 'bg-surface text-ink-600' : 'bg-primary-700 text-white',
          )}
        >
          {label}
        </span>
        <span className="num text-sm text-ink-600">{formatDate(record.date)}</span>
      </div>
      <Link
        to={`/records/${record.id}`}
        className="mt-2 block text-base font-medium text-ink-900 underline-offset-4 hover:underline"
      >
        {record.title}
      </Link>
      <p className="mt-2 text-base leading-relaxed text-ink-700">
        {record.answers?.learning}
      </p>
      <p className="mt-3 text-sm text-ink-600">
        そのとき決めた行動:{record.answers?.action}
      </p>
    </div>
  );
}

/** 同じテーマを持つ記録のうち、期間内で最も古いものと最も新しいものを対にする。 */
function buildComparisons(records: LearningRecord[], from: string) {
  const done = records
    .filter((r) => r.status === 'done' && r.answers)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const byTag = new Map<string, LearningRecord[]>();
  done.forEach((r) => r.tags.forEach((t) => byTag.set(t, [...(byTag.get(t) ?? []), r])));

  const seenPast = new Set<string>();
  return Array.from(byTag)
    .map(([tag, list]) => {
      const now = list[list.length - 1];
      const past = list.find((r) => r.date < now.date && r.date <= from) ?? list[0];
      return { tag, past, now };
    })
    .filter(({ past, now }) => past.id !== now.id)
    .sort((a, b) => (a.past.date < b.past.date ? -1 : 1))
    // 同じ記録が何度も「そのころ」として出ると、比べた実感が薄れる
    .filter(({ past }) => {
      if (seenPast.has(past.id)) return false;
      seenPast.add(past.id);
      return true;
    })
    .slice(0, 3);
}

function monthsLabel(from: string, to: string) {
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${to}T00:00:00`);
  const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  return months >= 12
    ? `この間に ${Math.floor(months / 12)}年${months % 12 > 0 ? `${months % 12}か月` : ''}`
    : `この間に ${months}か月`;
}
