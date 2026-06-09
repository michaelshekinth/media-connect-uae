import { useEffect, useState } from 'react'
import { getAllCustomQuotes } from '../services/adminService'
import { DataTable, PageHeader, StatusBadge } from '../components/ui'

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Awaited<ReturnType<typeof getAllCustomQuotes>>>([])
  useEffect(() => { getAllCustomQuotes().then(setQuotes) }, [])

  return (
    <div>
      <PageHeader title="Custom Quotes" subtitle="Quotes sent by media owners to advertisers" />
      <DataTable
        headers={['Amount', 'Advertiser', 'Media Owner', 'Description', 'Status', 'Date']}
        rows={quotes.map((q) => [
          `${q.amountAed.toLocaleString()} AED`,
          q.advertiserName,
          q.ownerName,
          <span key="d" className="line-clamp-2 max-w-xs">{q.description}</span>,
          <StatusBadge key="s" status={q.status} />,
          new Date(q.createdAt).toLocaleDateString(),
        ])}
      />
    </div>
  )
}
