import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminProtectedRoute } from './components/AdminProtectedRoute'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { AdminLayout } from './layouts/AdminLayout'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { ApprovalsPage } from './pages/ApprovalsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ChatDetailPage } from './pages/ChatDetailPage'
import { ChatsPage } from './pages/ChatsPage'
import { CmsPage } from './pages/CmsPage'
import { DashboardPage } from './pages/DashboardPage'
import { EmailTemplatesPage } from './pages/EmailTemplatesPage'
import { FeesCommissionsPage } from './pages/FeesCommissionsPage'
import { FeesLeadsPage } from './pages/FeesLeadsPage'
import { FeesListingPage } from './pages/FeesListingPage'
import { ListingsPage } from './pages/ListingsPage'
import { MediaOwnerDetailPage } from './pages/MediaOwnerDetailPage'
import { MediaOwnersPage } from './pages/MediaOwnersPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { PermitAssistancePage } from './pages/PermitAssistancePage'
import { QuotesPage } from './pages/QuotesPage'
import { ReportsPage } from './pages/ReportsPage'
import { RfqPage } from './pages/RfqPage'
import { SettingsPage } from './pages/SettingsPage'
import { SubscriptionsPage } from './pages/SubscriptionsPage'
import { UserDetailPage } from './pages/UserDetailPage'
import { UsersPage } from './pages/UsersPage'

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="media-owners" element={<MediaOwnersPage />} />
          <Route path="media-owners/:agencyId" element={<MediaOwnerDetailPage />} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="rfq" element={<RfqPage />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="chats/:threadId" element={<ChatDetailPage />} />
          <Route path="quotes" element={<QuotesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="fees/listing" element={<FeesListingPage />} />
          <Route path="fees/leads" element={<FeesLeadsPage />} />
          <Route path="fees/commissions" element={<FeesCommissionsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="cms" element={<CmsPage />} />
          <Route path="email-templates" element={<EmailTemplatesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="permit-assistance" element={<PermitAssistancePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}
