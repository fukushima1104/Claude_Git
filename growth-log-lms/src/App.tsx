import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/features/home/HomePage';
import { RegisterPage } from '@/features/register/RegisterPage';
import { SessionPrePage } from '@/features/session/SessionPrePage';
import { SessionPage } from '@/features/session/SessionPage';
import { SummaryPage } from '@/features/session/SummaryPage';
import { TimelinePage } from '@/features/timeline/TimelinePage';
import { RecordDetailPage } from '@/features/record/RecordDetailPage';
import { GoalsPage } from '@/features/goals/GoalsPage';
import { ReviewPage } from '@/features/review/ReviewPage';
import { AdvicePage } from '@/features/advice/AdvicePage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export function App() {
  return (
    <Routes>
      {/* 集中モード:サイドナビを出さない画面 */}
      <Route path="/session/:recordId" element={<SessionPrePage />} />
      <Route path="/session/:recordId/run" element={<SessionPage />} />
      <Route path="/session/:recordId/summary" element={<SummaryPage />} />

      {/* 通常画面 */}
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/records/:recordId" element={<RecordDetailPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/advice" element={<AdvicePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
