import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { useCamera } from '@/lib/useCamera';
import { CameraStage, MicLevel } from '@/components/ui/CameraStage';
import { NaviBubble } from '@/components/navi/NaviBubble';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Field';
import { Card } from '@/components/ui/Card';
import { KIND_LABEL } from '@/lib/labels';
import { formatDate } from '@/lib/format';

/**
 * 3a. セッション開始前。
 * ここでの役割は機器の確認よりも、「これから話しても大丈夫だ」と思ってもらうこと。
 */
export function SessionPrePage() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { getRecord, privacy } = useApp();
  const record = getRecord(recordId);

  const [consented, setConsented] = useState(false);
  const [breathing, setBreathing] = useState<number | null>(null);
  const { videoRef, state, level } = useCamera(true);

  // 「はじめる」のあと、すぐ録画に入らずに3つ数える間を置く
  useEffect(() => {
    if (breathing === null) return;
    if (breathing === 0) {
      navigate(`/session/${recordId}/run`, { replace: true });
      return;
    }
    const t = setTimeout(() => setBreathing(breathing - 1), 1100);
    return () => clearTimeout(t);
  }, [breathing, navigate, recordId]);

  if (!record) {
    return <p className="p-8">記録が見つかりませんでした。</p>;
  }

  if (breathing !== null) {
    return (
      <div className="grid min-h-dvh place-content-center gap-6 px-6 text-center">
        <NaviBubble size="lg" live listening>
          ゆっくり息を吸って、吐いてみてください。
        </NaviBubble>
        <p className="num text-3xl text-primary-700" aria-hidden="true">
          {breathing}
        </p>
        <button
          type="button"
          onClick={() => setBreathing(0)}
          className="text-sm text-ink-600 underline underline-offset-4"
        >
          すぐに始める
        </button>
      </div>
    );
  }

  const retention =
    privacy.retentionYears === 0 ? '期限なし' : `${privacy.retentionYears}年`;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-content px-4 py-6 sm:px-6">
      <div className="flex justify-end">
        <Button variant="quiet" onClick={() => navigate('/')}>
          閉じる
        </Button>
      </div>

      <div className="mt-2">
        <p className="text-sm text-ink-600">
          {KIND_LABEL[record.kind]}・{formatDate(record.date)}
        </p>
        <h1 className="mt-1 text-xl">{record.title}</h1>
      </div>

      <div className="mt-6">
        <NaviBubble size="lg" live>
          {record.title}、おつかれさまでした。3つだけ、ゆっくり伺わせてください。
        </NaviBubble>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <CameraStage videoRef={videoRef} state={state} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MicLevel level={level} />
            <p className="text-sm text-ink-600">
              {state === 'ready'
                ? '映っています。声も届いています。'
                : state === 'denied'
                  ? 'カメラを使わずに進められます。'
                  : '確認中です。'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg">記録について</h2>
            <ul className="mt-3 space-y-2 text-base text-ink-700">
              <li>・映像を見られるのは、いまのところ<strong>あなただけ</strong>です。</li>
              <li>・上長への共有は、あとから自分で選べます。</li>
              <li>・保存期間は{retention}です。設定でいつでも変えられます。</li>
              <li>・途中でやめても、そこまでの内容は残ります。</li>
            </ul>
            <div className="mt-5 border-t border-line pt-5">
              <Checkbox
                checked={consented}
                onChange={setConsented}
                label="映像と音声を保存することに同意します"
                description="同意しない場合も、文字だけで振り返れます。"
              />
            </div>
          </Card>

          <Card tone="navi" className="p-5">
            <p className="text-base text-ink-700">
              うまく話せなくて大丈夫です。言い直しも、黙ってしまう時間も、
              そのまま残ります。あとから文章で直せます。
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate(`/session/${record.id}/run?mode=text`)}
        >
          文章だけで答える
        </Button>
        <Button
          variant="primary"
          size="lg"
          disabled={!consented}
          onClick={() => setBreathing(3)}
        >
          はじめる
        </Button>
      </div>
      {!consented && (
        <p className="mt-2 text-right text-sm text-ink-600">
          録画して始めるには、同意の確認をお願いします。
        </p>
      )}
    </div>
  );
}
