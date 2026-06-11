import {
  BarChart3, Bell, Building2, FileText, LayoutDashboard, List, LogOut,
  Mail, MessageSquare, Package, Percent, Receipt, Settings, Shield, Tags, Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/approvals', icon: Shield, label: 'Pending Approvals' },
  { to: '/users', icon: Users, label: 'Advertisers' },
  { to: '/media-owners', icon: Building2, label: 'Publishers' },
  { to: '/listings', icon: List, label: 'Listings' },
  { to: '/rfq', icon: Receipt, label: 'RFQ / Leads' },
  { to: '/chats', icon: MessageSquare, label: 'Chats' },
  { to: '/quotes', icon: FileText, label: 'Quotes' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/subscriptions', icon: Package, label: 'Subscription Packages' },
  { to: '/fees/listing', icon: Receipt, label: 'Listing Fees' },
  { to: '/fees/leads', icon: Receipt, label: 'Lead Gen Fees' },
  { to: '/fees/commissions', icon: Percent, label: 'Commissions' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/cms', icon: FileText, label: 'CMS' },
  { to: '/email-templates', icon: Mail, label: 'Email Templates' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/permit-assistance', icon: Shield, label: 'Permit Assistance' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function AdminLayout() {
  const { session, logout } = useAdminAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex shrink-0 flex-col border-r border-slate-800 bg-slate-900 transition-all`}>
        <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-4">
          <Shield className="h-6 w-6 shrink-0 text-amber-400" />
          {sidebarOpen && <span className="text-sm font-bold">MediaConnect Admin</span>}
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {nav.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
            return (
              <Link key={to} to={to}
                className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}>
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-slate-800 p-3">
          {sidebarOpen && <p className="truncate text-xs text-slate-500">{session?.email}</p>}
          <button type="button" onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
            <LogOut className="h-4 w-4" /> {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6">
          <button type="button" onClick={() => setSidebarOpen((o) => !o)} className="text-sm text-slate-400 hover:text-white">
            {sidebarOpen ? 'Collapse' : 'Expand'} menu
          </button>
          <span className="text-xs text-slate-500">Super Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
