import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AccountSettings } from '../components/profile/AccountSettings'
import { AvatarUpload } from '../components/profile/AvatarUpload'
import { ChangePasswordForm } from '../components/profile/ChangePasswordForm'
import { useAuth } from '../context/AuthContext'

type OutletCtx = { showToast: (msg: string) => void }

export function ProfilePage() {
  const { user, updateProfile, changePassword, logout, deleteAccount } = useAuth()
  const { showToast } = useOutletContext<OutletCtx>()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!user) return null

  const handleSave = () => {
    showToast('Profile saved')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your account and preferences</p>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <AvatarUpload
          avatarUrl={user.avatarUrl}
          name={user.fullName}
          onChange={(url) => updateProfile({ avatarUrl: url })}
        />
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Account</h2>
        <AccountSettings user={user} onChange={updateProfile} />
        <button type="button" onClick={handleSave}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          Save changes
        </button>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Security</h2>
        <ChangePasswordForm onSubmit={changePassword} />
      </section>

      <section className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="text-lg font-bold text-red-900">Danger zone</h2>
        <p className="mt-1 text-sm text-red-700">Irreversible actions for your local account</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={logout}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">
            Log out
          </button>
          {!confirmDelete ? (
            <button type="button" onClick={() => setConfirmDelete(true)}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
              Delete account
            </button>
          ) : (
            <button type="button" onClick={() => { deleteAccount(); showToast('Account deleted') }}
              className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800">
              Confirm delete — clears all local data
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
