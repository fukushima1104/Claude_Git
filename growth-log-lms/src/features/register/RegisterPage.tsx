import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextInput, TextArea, ChoiceGroup } from '@/components/ui/Field';
import { NaviBubble } from '@/components/navi/NaviBubble';
import { KIND_LABEL } from '@/lib/labels';
import { todayISO } from '@/lib/format';
import type { LearningKind } from '@/data/types';

/**
 * 2. 研修・学びの登録。
 * 入力は最小限。詳しいことは振り返りで話せばよい、という立て付けにする。
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const { dispatch, privacy } = useApp();

  const [kind, setKind] = useState<LearningKind>('external');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [organizer, setOrganizer] = useState('');
  const [memo, setMemo] = useState('');

  function save(thenReflect: boolean) {
    const id = `r-${Date.now()}`;
    dispatch({
      type: 'addRecord',
      record: {
        id,
        kind,
        title: title.trim(),
        date,
        organizer: organizer.trim() || '—',
        memo: memo.trim(),
        status: 'awaiting',
        tags: [],
        visibility: privacy.defaultVisibility,
        laterNotes: [],
      },
    });
    navigate(thenReflect ? `/session/${id}` : '/');
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="学びを登録する"
        lead="まずは名前と日付だけで大丈夫です。中身は、このあとの振り返りで話しましょう。"
      />

      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(true);
          }}
          className="space-y-6"
        >
          <ChoiceGroup
            legend="種類"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'external', label: KIND_LABEL.external, hint: '社外の研修・セミナー' },
              { value: 'internal', label: KIND_LABEL.internal, hint: '会社が実施するもの' },
              { value: 'study', label: KIND_LABEL.study, hint: '有志の勉強会・読書会' },
            ]}
          />

          <TextInput
            label="名称"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例:データドリブン営業 実践講座"
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextInput
              label="受講した日"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="num"
            />
            <TextInput
              label="主催"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="例:人事部 / 社外の研修会社"
            />
          </div>

          <TextArea
            label="かんたんなメモ"
            hint="あとで思い出す手がかりになります。書かなくても構いません。"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="どんな内容だったか、ひとことだけでも。"
          />

          <div className="border-t border-line pt-6">
            <NaviBubble>
              登録したあと、そのまま振り返ることもできます。記憶が新しいうちのほうが、
              言葉にしやすいかもしれません。
            </NaviBubble>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={!title.trim()}
              onClick={() => save(false)}
            >
              登録だけする
            </Button>
            <Button type="submit" variant="primary" size="lg" disabled={!title.trim()}>
              登録して、振り返る
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
