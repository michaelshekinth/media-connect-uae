import { useEffect, useState } from 'react'
import type { AdminSettings } from '@shared/types/admin'
import { getAdminConfig, saveAdminConfig } from '../services/adminService'
import { Card, PageHeader, Toggle } from '../components/ui'

export function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null)

  useEffect(() => {
    getAdminConfig().then((c) => setSettings(c.settings))
  }, [])

  const save = async (next: AdminSettings) => {
    const config = await getAdminConfig()
    config.settings = next
    await saveAdminConfig(config)
    setSettings(next)
  }

  if (!settings) return null

  return (
    <div>
      <PageHeader title="Settings" subtitle="Global platform configuration" />
      <Card className="max-w-lg">
        {(['platformName', 'supportEmail', 'defaultCity'] as const).map((f) => (
          <div key={f} className="mb-4">
            <label className="text-sm text-slate-400 capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
            <input value={settings[f]} onChange={(e) => save({ ...settings, [f]: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Toggle active={settings.maintenanceMode} onChange={(v) => save({ ...settings, maintenanceMode: v })} />
          <span className="text-sm text-slate-300">Maintenance mode</span>
        </div>
      </Card>
    </div>
  )
}
