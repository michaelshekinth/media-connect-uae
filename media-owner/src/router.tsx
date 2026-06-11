import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { OwnerProtectedRoute } from './components/OwnerProtectedRoute'
import { OwnerAuthProvider } from './context/OwnerAuthContext'
import { OwnerLayout } from './layouts/OwnerLayout'
import { CreateListingPage } from './pages/owner/CreateListingPage'
import { EditListingPage } from './pages/owner/EditListingPage'
import { ListingDetailPage } from './pages/owner/ListingDetailPage'
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage'
import { OwnerLoginPage } from './pages/owner/OwnerLoginPage'
import { OwnerOnboardingPage } from './pages/owner/OwnerOnboardingPage'
import { OwnerPurchasesPage } from './pages/owner/OwnerPurchasesPage'
import { NotFoundPage } from './pages/NotFoundPage'

function Root() {
  return (
    <OwnerAuthProvider>
      <Outlet />
    </OwnerAuthProvider>
  )
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: 'login', element: <OwnerLoginPage /> },
      { path: 'signup', element: <OwnerLoginPage /> },
      {
        element: (
          <OwnerProtectedRoute>
            <OwnerLayout />
          </OwnerProtectedRoute>
        ),
        children: [
          { path: 'onboarding', element: <OwnerOnboardingPage /> },
          { path: 'dashboard', element: <Navigate to="/dashboard/chats" replace /> },
          { path: 'dashboard/:tab', element: <OwnerDashboardPage /> },
          { path: 'purchases', element: <OwnerPurchasesPage /> },
          { path: 'listings/new', element: <CreateListingPage /> },
          { path: 'listings/:id/edit', element: <EditListingPage /> },
          { path: 'listings/:id', element: <ListingDetailPage /> },
        ],
      },
      { index: true, element: <OwnerLoginPage /> },
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
