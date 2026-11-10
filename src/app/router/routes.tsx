import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout/AuthLayout'
import { RootLayout } from '@/components/layout/RootLayout/RootLayout'
import { AdminRoute, GuestRoute, ProtectedRoute } from './guards'

// Route-level code splitting
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const TestsPage = lazy(() => import('@/pages/tests/TestsPage'))
const TestSessionPage = lazy(() => import('@/pages/tests/TestSessionPage'))
const TestResultPage = lazy(() => import('@/pages/tests/TestResultPage'))
const HistoryPage = lazy(() => import('@/pages/history/HistoryPage'))
const LeaderboardPage = lazy(() => import('@/pages/leaderboard/LeaderboardPage'))
const AchievementsPage = lazy(() => import('@/pages/achievements/AchievementsPage'))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))

const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'))
const AdminStudentsPage = lazy(() => import('@/pages/admin/AdminStudentsPage'))
const AdminStudentDetailPage = lazy(() => import('@/pages/admin/AdminStudentDetailPage'))
const AdminQuestionsPage = lazy(() => import('@/pages/admin/AdminQuestionsPage'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'))
const AdminHistoryPage = lazy(() => import('@/pages/admin/AdminHistoryPage'))
const AdminAchievementsPage = lazy(() => import('@/pages/admin/AdminAchievementsPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))

const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'))

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: 'login', element: <LoginPage /> },
              { path: 'register', element: <RegisterPage /> },
              { path: 'forgot-password', element: <ForgotPasswordPage /> },
            ],
          },
        ],
      },
      {
        // Reachable both as guest and with a recovery session
        element: <AuthLayout />,
        children: [{ path: 'reset-password', element: <ResetPasswordPage /> }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          // Focus mode: no sidebar while taking a test
          { path: 'tests/session/:sessionId', element: <TestSessionPage /> },
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'tests', element: <TestsPage /> },
              { path: 'tests/result/:sessionId', element: <TestResultPage /> },
              { path: 'history', element: <HistoryPage /> },
              { path: 'leaderboard', element: <LeaderboardPage /> },
              { path: 'achievements', element: <AchievementsPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'settings', element: <SettingsPage /> },
              {
                path: 'admin',
                element: <AdminRoute />,
                children: [
                  { index: true, element: <AdminOverviewPage /> },
                  { path: 'students', element: <AdminStudentsPage /> },
                  { path: 'students/:userId', element: <AdminStudentDetailPage /> },
                  { path: 'questions', element: <AdminQuestionsPage /> },
                  { path: 'categories', element: <AdminCategoriesPage /> },
                  { path: 'history', element: <AdminHistoryPage /> },
                  { path: 'achievements', element: <AdminAchievementsPage /> },
                  { path: 'settings', element: <AdminSettingsPage /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
