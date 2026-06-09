import { formatBudgetRange } from '@shared/hooks/useSearchFilters'
import type { PricingPlan } from '@shared/types/user'

export function PricingPlans({ plans }: { plans: PricingPlan[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {plans.map((plan) => (
        <div key={plan.id}
          className={`rounded-2xl border p-5 ${plan.popular ? 'border-indigo-300 bg-indigo-50/50 shadow-md' : 'border-slate-200 bg-white'}`}>
          {plan.popular && (
            <span className="mb-2 inline-block rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white">Popular</span>
          )}
          <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
          <p className="mt-1 text-sm font-semibold text-teal-700">
            {formatBudgetRange(plan.priceFrom, plan.priceTo)} AED
          </p>
          <ul className="mt-4 space-y-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
