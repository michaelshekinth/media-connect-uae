import { CITIES } from '@shared/constants'
import type { User } from '@shared/types/user'

interface AccountSettingsProps {
  user: User
  onChange: (updates: Partial<User>) => void
}

export function AccountSettings({ user, onChange }: AccountSettingsProps) {
  const cityOptions = CITIES.filter((c) => c !== 'All UAE')

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
          <input value={user.fullName} onChange={(e) => onChange({ fullName: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input value={user.email} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
          <input value={user.phone} onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+971 50 000 0000"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Company</label>
          <input value={user.companyName} onChange={(e) => onChange({ companyName: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Job title</label>
          <input value={user.jobTitle} onChange={(e) => onChange({ jobTitle: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Default city</label>
          <select value={user.defaultCity} onChange={(e) => onChange({ defaultCity: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
            {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Preferences</p>
        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={user.emailNotifications}
            onChange={(e) => onChange({ emailNotifications: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
          Email notifications
        </label>
        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={user.quoteAlerts}
            onChange={(e) => onChange({ quoteAlerts: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
          Quote response alerts
        </label>
      </div>
    </div>
  )
}
