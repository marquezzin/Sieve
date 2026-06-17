import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/domains/auth';
import { FullPageLoader } from '@/components/atoms/FullPageLoader';

const LoginPage = lazy(() =>
  import('@/domains/auth/pages/LoginPage/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ChatPage = lazy(() =>
  import('@/domains/chat').then((m) => ({ default: m.ChatPage })),
);
const ProfilePage = lazy(() =>
  import('@/domains/profile').then((m) => ({ default: m.ProfilePage })),
);
const ResumeListPage = lazy(() =>
  import('@/domains/resume').then((m) => ({ default: m.ResumeListPage })),
);
const ResumeDetailPage = lazy(() =>
  import('@/domains/resume').then((m) => ({ default: m.ResumeDetailPage })),
);
const VersionDiffPage = lazy(() =>
  import('@/domains/resume').then((m) => ({ default: m.VersionDiffPage })),
);
const JobAnalysisPage = lazy(() =>
  import('@/domains/matching').then((m) => ({ default: m.JobAnalysisPage })),
);
const JobDetailPage = lazy(() =>
  import('@/domains/matching').then((m) => ({ default: m.JobDetailPage })),
);

const withSuspense = (node: ReactNode) => (
  <Suspense fallback={<FullPageLoader />}>{node}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: withSuspense(<DashboardPage />),
      },
      {
        path: 'chat',
        element: withSuspense(<ChatPage />),
      },
      {
        path: 'profile',
        element: withSuspense(<ProfilePage />),
      },
      {
        path: 'resumes',
        element: withSuspense(<ResumeListPage />),
      },
      {
        path: 'resumes/:id',
        element: withSuspense(<ResumeDetailPage />),
      },
      {
        path: 'resumes/:id/diff/:from/:to',
        element: withSuspense(<VersionDiffPage />),
      },
      {
        path: 'matching',
        element: withSuspense(<JobAnalysisPage />),
      },
      {
        path: 'matching/jobs/:id',
        element: withSuspense(<JobDetailPage />),
      },
    ],
  },
]);
