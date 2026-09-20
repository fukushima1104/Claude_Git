import { useMemo, useState } from 'react';
import { useApp } from '@/store/AppStore';
import { PageHeader, EmptyState } from '@/components/ui/PageHeader';
import { RecordRow } from '@/components/ui/RecordRow';
import { Card } from '@/components/ui/Card';
import { ToggleTag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { ThemeSpread } from '@/components/viz/ThemeSpread';
import { KIND_LABEL } from '@/lib/labels';
import { ALL_TAGS } from '@/data/mock';
import { formatMonth, monthOf, monthsAgo, todayISO } from '@/lib/format';
import type { LearningKind } from '@/data/types';

const PERIODS = [
  { label: '半年', months: 6 },
  { label: '1年', months: 12 },
  { label: '2年', months: 24 },
  { label: 'すべて', months: 0 },
];

/**
 * 5. 成長タイムライン。
 * 月ごとに区切って、記録を時系列で並べる。上にテーマの広がりを置き、
 * 「どこに関心が伸びてきたか」を先に見てから個別の記録に降りられるようにする。
 */
export function TimelinePage() {
  const { records } = useApp();
  const [kinds, setKinds] = useState<LearningKind[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [months, setMonths] = useState(12);
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const since = months === 0 ? '0000-00-00' : monthsAgo(months);
    const kw = keyword.trim();
    return records.filter((r) => {
      if (r.date < since) return false;
      if (kinds.length > 0 && !kinds.includes(r.kind)) return false;
      if (tags.length > 0 && !tags.some((t) => r.tags.includes(t))) return false;
      if (kw) {
        const hay = [
          r.title,
          r.organizer,
          r.memo,
          r.tags.join(' '),
          r.answers?.learning ?? '',
          r.answers?.apply ?? '',
          r.answers?.action ?? '',
        ].join(' ');
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [records, kinds, tags, months, keyword]);

  const byMonth = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((r) => {
      const m = monthOf(r.date);
      map.set(m, [...(map.get(m) ?? []), r]);
    });
    return Array.from(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const hasFilter = kinds.length > 0 || tags.length > 0 || keyword.trim() !== '';

  return (
    <div>
      <PageHeader
        title="成長タイムライン"
        lead="これまでの学びを、時間の流れとして並べています。件数を競うものではありません。"
      />

      <Card className="mb-8 p-6">
        <h2 className="text-lg">テーマの広がり</h2>
        <p className="mt-1 text-sm text-ink-600">
          テーマ名を押すと、その学びだけに絞り込めます。
        </p>
        <div className="mt-4">
          <ThemeSpread
            records={records}
            months={months === 0 ? 24 : months}
            selectedTheme={tags[0]}
            onSelectTheme={(t) => setTags(tags[0] === t ? [] : [t])}
          />
        </div>
      </Card>

      <section aria-label="絞り込み" className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-600">期間</span>
          {PERIODS.map((p) => (
            <ToggleTag
              key={p.label}
              active={months === p.months}
              onClick={() => setMonths(p.months)}
            >
              {p.label}
            </ToggleTag>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-600">種類</span>
          {(Object.keys(KIND_LABEL) as LearningKind[]).map((k) => (
            <ToggleTag
              key={k}
              active={kinds.includes(k)}
              onClick={() =>
                setKinds(kinds.includes(k) ? kinds.filter((x) => x !== k) : [...kinds, k])
              }
            >
              {KIND_LABEL[k]}
            </ToggleTag>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-600">テーマ</span>
          {ALL_TAGS.map((t) => (
            <ToggleTag
              key={t}
              active={tags.includes(t)}
              onClick={() =>
                setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])
              }
            >
              {t}
            </ToggleTag>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="kw" className="text-sm text-ink-600">
            ことばで探す
          </label>
          <input
            id="kw"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="例:課題設定"
            className="w-56 rounded-md border border-line-strong bg-surface px-3 py-2 text-base"
          />
          {hasFilter && (
            <Button
              variant="quiet"
              size="sm"
              onClick={() => {
                setKinds([]);
                setTags([]);
                setKeyword('');
              }}
            >
              絞り込みを外す
            </Button>
          )}
          <span className="num text-sm text-ink-600">{filtered.length}件</span>
        </div>
      </section>

      {byMonth.length === 0 ? (
        <EmptyState>この条件に合う記録はありませんでした。</EmptyState>
      ) : (
        <div className="space-y-10">
          {byMonth.map(([month, items]) => (
            <section key={month} aria-label={formatMonth(month)}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="num text-lg">{formatMonth(month)}</h2>
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
                <span className="num text-sm text-ink-600">{items.length}件</span>
              </div>
              <ul className="space-y-3">
                {items.map((r) => (
                  <RecordRow key={r.id} record={r} />
                ))}
              </ul>
            </section>
          ))}
          <p className="text-center text-sm text-ink-600">
            ここが、いまの記録のはじまりです({formatMonth(monthOf(monthsAgo(12, todayISO())))}
            より前の記録は、まだありません)
          </p>
        </div>
      )}
    </div>
  );
}
