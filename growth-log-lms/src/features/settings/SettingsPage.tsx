import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { PageHeader, SectionTitle } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox, ChoiceGroup } from '@/components/ui/Field';
import { Dialog } from '@/components/ui/Dialog';
import { NaviBubble } from '@/components/navi/NaviBubble';
import { Tag } from '@/components/ui/Tag';
import { VISIBILITY_DESCRIPTION, VISIBILITY_LABEL } from '@/lib/labels';
import { formatDate } from '@/lib/format';
import type { Visibility } from '@/data/types';

const RETENTIONS = [
  { value: 1, label: '1年' },
  { value: 3, label: '3年' },
  { value: 5, label: '5年' },
  { value: 0, label: '期限なし' },
];

/**
 * 10. プライバシー・データ設定。
 * 「いま誰が見られるのか」を、設定項目より先に言葉で示す。
 */
export function SettingsPage() {
  const { privacy, dispatch, records, user, setVisibility } = useApp();
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [exported, setExported] = useState(false);

  const shared = records.filter((r) => r.visibility !== 'self');

  return (
    <div className="space-y-8">
      <PageHeader
        title="プライバシーとデータ"
        lead="記録はあなたのものです。誰に見せるか、いつまで残すかは、いつでも変えられます。"
      />

      <Card tone="navi" className="p-6">
        <NaviBubble>
          いまは{shared.length === 0 ? 'すべての記録が、あなただけに見えています。' : `${shared.length}件の記録を、あなた以外の人にも共有しています。`}
        </NaviBubble>
      </Card>

      <section aria-labelledby="visibility">
        <SectionTitle>
          <span id="visibility">はじめの公開範囲</span>
        </SectionTitle>
        <Card className="p-6">
          <ChoiceGroup
            legend="新しく残す記録を、誰が見られるようにしますか"
            value={privacy.defaultVisibility}
            onChange={(v) => dispatch({ type: 'setPrivacy', patch: { defaultVisibility: v } })}
            options={(['self', 'manager', 'team'] as Visibility[]).map((v) => ({
              value: v,
              label: VISIBILITY_LABEL[v],
              hint: VISIBILITY_DESCRIPTION[v],
            }))}
          />
          <p className="mt-4 text-sm text-ink-600">
            上長として登録されているのは {user.managerName} さんです。
            記録ごとの公開範囲は、あとから1件ずつ変えられます。
          </p>
        </Card>
      </section>

      {shared.length > 0 && (
        <section aria-labelledby="shared">
          <SectionTitle>
            <span id="shared">いま共有している記録</span>
          </SectionTitle>
          <ul className="space-y-3">
            {shared.map((r) => (
              <Card key={r.id} as="li" className="flex flex-wrap items-center gap-3 p-5">
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/records/${r.id}`}
                    className="text-base text-ink-900 underline-offset-4 hover:underline"
                  >
                    {r.title}
                  </Link>
                  <p className="num mt-1 text-sm text-ink-600">{formatDate(r.date)}</p>
                </div>
                <Tag size="sm" className="border-amber-100 bg-amber-50 text-amber-700">
                  {VISIBILITY_LABEL[r.visibility]}
                </Tag>
                <Button variant="secondary" size="sm" onClick={() => setVisibility(r.id, 'self')}>
                  自分のみに戻す
                </Button>
              </Card>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="retention">
        <SectionTitle>
          <span id="retention">映像の保存期間</span>
        </SectionTitle>
        <Card className="p-6">
          <ChoiceGroup
            legend="どのくらい残しますか"
            columns={4}
            value={String(privacy.retentionYears)}
            onChange={(v) =>
              dispatch({ type: 'setPrivacy', patch: { retentionYears: Number(v) } })
            }
            options={RETENTIONS.map((r) => ({ value: String(r.value), label: r.label }))}
          />
          <p className="mt-4 text-sm text-ink-600">
            期間を過ぎると映像だけが消え、文字起こしと3つの答えは残ります。
            数年後に見返すことを考えると、3年ほどを選ぶ方が多いようです。
          </p>
          <div className="mt-5 border-t border-line pt-5">
            <Checkbox
              checked={privacy.transcriptOnly}
              onChange={(v) => dispatch({ type: 'setPrivacy', patch: { transcriptOnly: v } })}
              label="映像は残さず、文字起こしだけを保存する"
              description="カメラの前で話すことに抵抗があるときは、こちらでも構いません。"
            />
          </div>
        </Card>
      </section>

      <section aria-labelledby="reminders">
        <SectionTitle>
          <span id="reminders">ナビからの声かけ</span>
        </SectionTitle>
        <Card className="space-y-4 p-6">
          <Checkbox
            checked={privacy.remindReflection}
            onChange={(v) => dispatch({ type: 'setPrivacy', patch: { remindReflection: v } })}
            label="研修のあと、振り返りのお知らせを受け取る"
          />
          <Checkbox
            checked={privacy.remindGoals}
            onChange={(v) => dispatch({ type: 'setPrivacy', patch: { remindGoals: v } })}
            label="行動目標の期限が近いときに知らせを受け取る"
          />
          <p className="text-sm text-ink-600">
            知らせは週に1回までです。催促にならないようにしています。
          </p>
        </Card>
      </section>

      <section aria-labelledby="data">
        <SectionTitle>
          <span id="data">記録の持ち出しと削除</span>
        </SectionTitle>
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="secondary" onClick={() => setExported(true)}>
              すべての記録を書き出す
            </Button>
            {exported && (
              <p role="status" className="text-base text-grow-700">
                {records.length}件分の書き出しを準備しました(プロトタイプのため、実際のファイルは出力されません)。
              </p>
            )}
          </div>
          <p className="mt-3 text-sm text-ink-600">
            映像・文字起こし・3つの答え・行動目標を、まとめて持ち出せます。
            退職するときも、自分の記録を手元に残せます。
          </p>

          <div className="mt-6 border-t border-line pt-6">
            <Button variant="quiet" onClick={() => setConfirmDeleteAll(true)}>
              すべての記録を削除する
            </Button>
            <p className="mt-2 text-sm text-ink-600">
              削除すると元には戻せません。先に書き出しておくことをおすすめします。
            </p>
          </div>
        </Card>
      </section>

      <Dialog
        open={confirmDeleteAll}
        title="すべての記録を削除しますか"
        description={
          <>
            <p>
              {records.length}件の記録と、そこから立てた行動目標がすべて消えます。
              元には戻せません。
            </p>
            <p className="mt-3">
              このプロトタイプでは、確認のみで実際の削除は行いません。
            </p>
          </>
        }
        onClose={() => setConfirmDeleteAll(false)}
      >
        <Button variant="secondary" onClick={() => setConfirmDeleteAll(false)}>
          やめておく
        </Button>
        <Button variant="primary" onClick={() => setConfirmDeleteAll(false)}>
          内容を確認した
        </Button>
      </Dialog>
    </div>
  );
}
