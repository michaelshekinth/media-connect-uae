import type { ReactNode } from 'react'

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    approved: 'bg-emerald-500/20 text-emerald-300',
    submitted: 'bg-amber-500/20 text-amber-300',
    pending_approval: 'bg-amber-500/20 text-amber-300',
    pending_edit_approval: 'bg-orange-500/20 text-orange-300',
    pending: 'bg-amber-500/20 text-amber-300',
    rejected: 'bg-red-500/20 text-red-300',
    draft: 'bg-slate-500/20 text-slate-300',
    connected: 'bg-blue-500/20 text-blue-300',
    quoted: 'bg-indigo-500/20 text-indigo-300',
    converted: 'bg-emerald-500/20 text-emerald-300',
    lost: 'bg-red-500/20 text-red-300',
    responded: 'bg-blue-500/20 text-blue-300',
    collected: 'bg-emerald-500/20 text-emerald-300',
    sent: 'bg-blue-500/20 text-blue-300',
    accepted: 'bg-emerald-500/20 text-emerald-300',
    declined: 'bg-red-500/20 text-red-300',
    active: 'bg-emerald-500/20 text-emerald-300',
    inactive: 'bg-slate-500/20 text-slate-400',
  }
  const cls = colors[status] ?? 'bg-slate-600/30 text-slate-300'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-600 py-16 text-center text-slate-400">
      {message}
    </div>
  )
}

export function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-700 bg-slate-800/80">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/80">
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-slate-500">No records</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-800/40">{row.map((cell, j) => <td key={j} className="px-4 py-3 text-slate-200">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RejectModal({ open, onClose, onConfirm, title }: {
  open: boolean; onClose: () => void; onConfirm: (reason: string) => void; title: string
}) {
  if (!open) return null
  let reason = 'Does not meet platform guidelines'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-600 bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <textarea
          className="mt-4 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
          rows={3}
          defaultValue={reason}
          onChange={(e) => { reason = e.target.value }}
          placeholder="Rejection reason"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300">Cancel</button>
          <button type="button" onClick={() => onConfirm(reason)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Reject</button>
        </div>
      </div>
    </div>
  )
}

export function Toggle({ active, onChange, label }: { active: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!active)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${active ? 'bg-emerald-600' : 'bg-slate-600'}`}
      title={label}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-700 bg-slate-800/50 p-5 ${className}`}>{children}</div>
}
