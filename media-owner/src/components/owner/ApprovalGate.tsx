import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { useOwnerAuth } from '../../context/OwnerAuthContext'

interface ApprovalGateProps {
  children: ReactNode
  message?: string
}

export function ApprovalGate({ children, message }: ApprovalGateProps) {
  const { user } = useOwnerAuth()
  const approved = user?.ownerApprovalStatus === 'approved'

  if (approved) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
        <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg">
          <Lock className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 font-semibold text-slate-900">Awaiting admin approval</p>
          <p className="mt-1 text-sm text-slate-500">
            {message ?? 'Your company profile must be approved before you can use this feature.'}
          </p>
        </div>
      </div>
    </div>
  )
}
