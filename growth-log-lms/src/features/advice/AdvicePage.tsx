import { Link } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { NaviBubble } from '@/components/navi/NaviBubble';
import { ADVICE_CATEGORY_LABEL, KIND_LABEL } from '@/lib/labels';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { AdviceFeedback } from '@/data/types';

const CATEGORY_TONE = {
  strength: 'border-grow-100 bg-grow-50 text-grow-700',
  potential: 'border-amber-100 bg-amber-50 text-amber-700',
  next: 'border-navi-100 bg-navi-50 text-navi-700',
} as const;

/**
 * 9. AIアドバイス。
 * 助言には必ず、根拠となった記録へのリンクを添える。
 * 「どの記録を見てそう言ったのか」を本人が確かめられることを、この画面の前提にする。
 */
export function AdvicePage() {
  const { advice, adviceFeedback, getRecord, goals, dispatch } = useApp();

  return (
    <div className="space-y-8">
      <PageHeader
        title="ナビからのアドバイス"
        lead="これまでの記録を読んで気づいたことをお伝えします。根拠にした記録も一緒に出しますので、違うと思ったら教えてください。"
      />

      <Card tone="navi" className="p-6">
        <NaviBubble>
          わたしが見ているのは、あなたが残した記録だけです。評価ではありません。
          合わないと感じたものは「違うと思う」を押してください。次から出し方を変えます。
        </NaviBubble>
      </Card>

      <div className="space-y-6">
        {advice.map((a) => {
          const feedback = adviceFeedback[a.id] ?? null;
          const evidenceRecords = a.evidenceRecordIds
            .map((id) => getRecord(id))
            .filter((r): r is NonNullable<typeof r> => Boolean(r))
            // 古い順に並べると、同じ気づきが繰り返されていることが見て取れる
            .sort((x, y) => (x.date < y.date ? -1 : 1));
          const evidenceGoals = goals.filter((g) => a.evidenceGoalIds?.includes(g.id));

          return (
            <Card key={a.id} className="p-6">
              <Tag size="sm" className={CATEGORY_TONE[a.category]}>
                {ADVICE_CATEGORY_LABEL[a.category]}
              </Tag>
              <h2 className="mt-3 text-xl">{a.headline}</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-700">{a.body}</p>

              {/* 根拠。必ず出す。 */}
              <section className="mt-6 rounded-lg border border-line bg-sunken p-5">
                <h3 className="text-sm font-medium text-ink-700">
                  この見立ての根拠にした記録
                </h3>
                <ul className="mt-3 space-y-2">
                  {evidenceRecords.map((r) => (
                    <li key={r.id}>
                      <Link
                        to={`/records/${r.id}`}
                        className="group flex flex-wrap items-baseline gap-2 rounded-md px-2 py-1.5 hover:bg-surface"
                      >
                        <span className="num text-sm text-ink-600">
                          {formatDate(r.date)}
                        </span>
                        <span className="text-sm text-ink-600">{KIND_LABEL[r.kind]}</span>
                        <span className="text-base text-primary-700 underline-offset-4 group-hover:underline">
                          {r.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {evidenceGoals.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-medium text-ink-700">
                      あわせて見た行動目標
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {evidenceGoals.map((g) => (
                        <li key={g.id} className="px-2 text-base text-ink-700">
                          ・{g.title}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-sm text-ink-600">この見立ては</span>
                <FeedbackButton
                  active={feedback === 'helpful'}
                  onClick={() =>
                    dispatch({
                      type: 'setAdviceFeedback',
                      id: a.id,
                      feedback: feedback === 'helpful' ? null : 'helpful',
                    })
                  }
                >
                  役に立った
                </FeedbackButton>
                <FeedbackButton
                  active={feedback === 'off'}
                  onClick={() =>
                    dispatch({
                      type: 'setAdviceFeedback',
                      id: a.id,
                      feedback: feedback === 'off' ? null : 'off',
                    })
                  }
                >
                  違うと思う
                </FeedbackButton>
                {feedback && <FeedbackReply feedback={feedback} />}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg">自分でも振り返ってみますか</h2>
          <p className="mt-1 text-base text-ink-600">
            期間を決めて見返すと、ナビの見立てが合っているかを確かめられます。
          </p>
        </div>
        <ButtonLink to="/review" variant="secondary" size="lg">
          成長レビューへ
        </ButtonLink>
      </Card>
    </div>
  );
}

function FeedbackButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? 'primary' : 'secondary'}
      size="sm"
      aria-pressed={active}
      onClick={onClick}
      className={cn(active && 'shadow-none')}
    >
      {children}
    </Button>
  );
}

function FeedbackReply({ feedback }: { feedback: Exclude<AdviceFeedback, null> }) {
  return (
    <p role="status" className="text-sm text-ink-600">
      {feedback === 'helpful'
        ? 'ありがとうございます。この見方を続けます。'
        : 'ありがとうございます。次からは別の角度で見てみます。'}
    </p>
  );
}
