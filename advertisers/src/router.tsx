import { createBrowserRouter, Outlet } from 'react-router-dom'
import { AdvertiserProtectedRoute } from './components/auth/AdvertiserProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { AppLayout } from './layouts/AppLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { AgencyDetailPage } from './pages/AgencyDetailPage'
import { BrowsePage } from './pages/BrowsePage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdvertiserLoginPage } from './pages/AdvertiserLoginPage'
import { LandingPage } from './pages/LandingPage'
import { ListMediaPage } from './pages/ListMediaPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { SubscriptionPage } from './pages/SubscriptionPage'

function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'list-media', element: <ListMediaPage /> },
          { path: 'login', element: <AdvertiserLoginPage /> },
          { path: 'signup', element: <AdvertiserLoginPage /> },
          { path: 'listing/:id', element: <ListingDetailPage /> },
          { path: 'agency/:id', element: <AgencyDetailPage /> },
        ],
      },
      {
        element: (
          <AdvertiserProtectedRoute>
            <AppLayout />
          </AdvertiserProtectedRoute>
        ),
        children: [
          { path: 'browse', element: <BrowsePage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'dashboard/:tab', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'subscription', element: <SubscriptionPage /> },
        ],
      },
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
