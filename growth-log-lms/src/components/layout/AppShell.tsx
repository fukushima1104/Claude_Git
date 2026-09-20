import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { NaviMark } from '@/components/navi/NaviMark';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/', label: 'ホーム', exact: true },
  { to: '/timeline', label: '成長タイムライン' },
  { to: '/goals', label: '行動目標' },
  { to: '/review', label: '成長レビュー' },
  { to: '/advice', label: 'ナビのアドバイス' },
  { to: '/settings', label: 'プライバシー設定' },
];

/**
 * 通常画面の枠。
 * 振り返りセッション(/session/*)はこの枠を使わず、集中モードで表示する。
 */
export function AppShell() {
  const { user, awaitingRecords } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only-focusable absolute left-4 top-4 z-50 rounded-md bg-primary-700 px-4 py-2 text-white"
      >
        本文へ移動
      </a>

      <div className="mx-auto flex w-full max-w-[1320px] gap-8 px-4 sm:px-6">
        {/* PC:左のサイドナビ */}
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col py-6 lg:flex">
          <Brand />
          <nav aria-label="メインメニュー" className="mt-8 flex-1">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between rounded-md px-3 py-2.5 text-base transition-colors',
                        isActive
                          ? 'bg-primary-50 font-medium text-primary-900'
                          : 'text-ink-700 hover:bg-sunken',
                      )
                    }
                  >
                    {item.label}
                    {item.to === '/' && awaitingRecords.length > 0 && (
                      <span className="num rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        {awaitingRecords.length}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-line pt-4">
            <p className="text-base text-ink-900">{user.name}</p>
            <p className="text-sm text-ink-600">
              {user.department}・{new Date().getFullYear() - user.joinedYear}年目
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* スマホ:上部のヘッダー */}
          <header className="flex items-center justify-between py-4 lg:hidden">
            <Brand />
            <span className="text-sm text-ink-600">{user.name}</span>
          </header>

          <main id="main" className="py-4 pb-28 lg:py-10">
            <Outlet key={location.pathname} />
          </main>
        </div>
      </div>

      {/* スマホ:下部のナビ。親指が届く位置に置く。 */}
      <nav
        aria-label="メインメニュー"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-content">
          {NAV.slice(0, 5).map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 px-1 py-2.5 text-xs',
                    isActive ? 'font-medium text-primary-900' : 'text-ink-600',
                  )
                }
              >
                <span className="truncate">{shortLabel(item.label)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function shortLabel(label: string) {
  return label
    .replace('成長タイムライン', 'タイムライン')
    .replace('ナビのアドバイス', 'アドバイス')
    .replace('プライバシー設定', '設定')
    .replace('成長レビュー', 'レビュー');
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <NaviMark size={28} />
      <span className="text-lg font-semibold tracking-ja">成長ログ</span>
    </div>
  );
}
