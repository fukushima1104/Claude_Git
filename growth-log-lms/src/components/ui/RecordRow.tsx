import { CardLink } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { KIND_LABEL, KIND_STYLE } from '@/lib/labels';
import { formatDate, formatDuration, relativeToToday } from '@/lib/format';
import type { LearningRecord } from '@/data/types';

/** 一覧に並べる1件分。タイムラインとホームで共通して使う。 */
export function RecordRow({ record }: { record: LearningRecord }) {
  return (
    <CardLink to={`/records/${record.id}`} className="p-5" as="li">
      <div className="flex flex-wrap items-center gap-2">
        <Tag size="sm" className={KIND_STYLE[record.kind]}>
          {KIND_LABEL[record.kind]}
        </Tag>
        <span className="num text-sm text-ink-600">{formatDate(record.date)}</span>
        <span className="text-sm text-ink-600">・{relativeToToday(record.date)}</span>
        {record.status === 'draft' && (
          <Tag size="sm" className="border-amber-100 bg-amber-50 text-amber-700">
            途中まで
          </Tag>
        )}
      </div>
      <h3 className="mt-2 text-lg">{record.title}</h3>
      {record.answers?.learning && (
        <p className="mt-2 line-clamp-2 text-base text-ink-600">
          {record.answers.learning}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {record.tags.map((t) => (
          <Tag key={t} size="sm">
            {t}
          </Tag>
        ))}
        {record.durationSec !== undefined && record.status === 'done' && (
          <span className="num text-sm text-ink-600">
            映像 {formatDuration(record.durationSec)}
          </span>
        )}
      </div>
    </CardLink>
  );
}
