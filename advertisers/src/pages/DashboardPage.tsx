import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ActivityFeed } from '../components/dashboard/ActivityFeed'
import { ChatsPanel } from '../components/dashboard/ChatsPanel'
import { Favourites } from '../components/dashboard/Favourites'
import { QuoteHistory } from '../components/dashboard/QuoteHistory'
import { SearchHistory } from '../components/dashboard/SearchHistory'
import {
  getFavoriteCount,
  getPendingQuoteCount,
  getUnreadChatCount,
} from '../services/userStore'
import type { DashboardTab } from '@shared/types/user'

const tabs: { id: DashboardTab; label: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'search-history', label: 'Search history' },
  { id: 'chats', label: 'Chats' },
  { id: 'quotes', label: 'Quote history' },
  { id: 'favourites', label: 'Favourites' },
]

export function DashboardPage() {
  const { tab } = useParams<{ tab?: string }>()
  const navigate = useNavigate()
  const activeTab = (tabs.find((t) => t.id === tab)?.id ?? 'activity') as DashboardTab
  const [stats, setStats] = useState({ quotes: 0, favorites: 0, chats: 0 })

  useEffect(() => {
    Promise.all([getPendingQuoteCount(), getFavoriteCount(), getUnreadChatCount()]).then(
      ([quotes, favorites, chats]) => setStats({ quotes, favorites, chats }),
    )
  }, [activeTab])

  const setTab = (id: DashboardTab) => {
    navigate(id === 'activity' ? '/dashboard' : `/dashboard/${id}`)
  }

  const statCards = [
    { label: 'Active quotes', value: stats.quotes },
    { label: 'Saved items', value: stats.favorites },
    { label: 'Unread chats', value: stats.chats },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Your campaigns, searches, and conversations</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-px">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === t.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'activity' && <ActivityFeed />}
        {activeTab === 'search-history' && <SearchHistory />}
        {activeTab === 'chats' && <ChatsPanel />}
        {activeTab === 'quotes' && <QuoteHistory />}
        {activeTab === 'favourites' && <Favourites />}
      </div>
    </div>
  )
}
