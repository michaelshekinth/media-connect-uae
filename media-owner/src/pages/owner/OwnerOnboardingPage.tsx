import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UnderReviewModal } from '../../components/owner/UnderReviewModal'
import { DocumentUpload } from '../../components/ui/DocumentUpload'
import { MEDIA_CATEGORIES, MEDIA_CATEGORY_LABELS, UAE_CITIES } from '@shared/constants'
import { useOwnerAuth } from '../../context/OwnerAuthContext'
import { submitCompanyProfile } from '../../services/ownerStore'
import type { OwnerCompanyProfile, UploadedDocument } from '@shared/types/owner'
import type { MediaCategory } from '@shared/types/categories'
import { hasRequiredCompanyDocuments, syncLicenseFromDocuments } from '../../utils/ownerDocuments'
import { findDocument, upsertDocument } from '@shared/utils/fileUpload'

const TOTAL_STEPS = 3

function validateStep1(profile: OwnerCompanyProfile): string | null {
  if (!profile.companyLegalName?.trim()) return 'Company legal name is required'
  if (!profile.authorizedPerson?.trim()) return 'Authorized person is required'
  if (!profile.phone?.trim()) return 'Phone number is required'
  return null
}

function validateStep2(profile: OwnerCompanyProfile): string | null {
  if (!profile.licenseNumber?.trim()) return 'Trade license number is required'
  if (!profile.licenseExpiry?.trim()) return 'License expiry date is required'
  if (!hasRequiredCompanyDocuments(profile.documents)) return 'Please upload your trade license document'
  if (profile.mediaCategories.length === 0) return 'Select at least one media category'
  return null
}

const emptyProfile = (businessEmail: string): OwnerCompanyProfile => ({
  companyLegalName: '',
  authorizedPerson: '',
  jobTitle: '',
  businessEmail,
  phone: '',
  city: 'Dubai',
  address: '',
  website: '',
  licenseNumber: '',
  licenseExpiry: '',
  licenseDocument: null,
  licenseDocumentName: '',
  vatTrn: '',
  mediaCategories: [],
  companyDescription: '',
  logoUrl: null,
  documents: [],
})

export function OwnerOnboardingPage() {
  const { user, updateProfile, refreshUser } = useOwnerAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<OwnerCompanyProfile>(() => emptyProfile(user?.email ?? ''))
  const [error, setError] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)

  if (!user?.agencyId) return null

  const update = (partial: Partial<OwnerCompanyProfile>) => setProfile((p) => ({ ...p, ...partial }))

  const setDoc = (type: UploadedDocument['type'], label: string, doc: UploadedDocument | null) => {
    setProfile((p) => {
      let documents = p.documents
      if (doc) documents = upsertDocument(documents, { ...doc, type, label })
      else documents = documents.filter((d) => d.type !== type)
      return { ...p, documents }
    })
  }

  const toggleCategory = (cat: MediaCategory) => {
    setProfile((p) => ({
      ...p,
      mediaCategories: p.mediaCategories.includes(cat)
        ? p.mediaCategories.filter((c) => c !== cat)
        : [...p.mediaCategories, cat],
    }))
  }

  const continueToNextStep = () => {
    const stepError = step === 1 ? validateStep1(profile) : validateStep2(profile)
    if (stepError) {
      setError(stepError)
      return
    }
    setError('')
    setStep(step + 1)
  }

  const submit = async () => {
    const step1Error = validateStep1(profile)
    const step2Error = validateStep2(profile)
    const submitError = step1Error ?? step2Error
    if (submitError) {
      setError(submitError)
      if (step1Error) setStep(1)
      else if (step2Error) setStep(2)
      return
    }

    const synced = syncLicenseFromDocuments(profile)
    await submitCompanyProfile(synced)
    updateProfile({
      companyName: synced.companyLegalName,
      fullName: synced.authorizedPerson,
      phone: synced.phone,
      jobTitle: synced.jobTitle,
      defaultCity: synced.city,
      ownerProfileComplete: true,
      ownerApprovalStatus: 'submitted',
    })
    refreshUser()
    setShowReviewModal(true)
  }

  const goToDashboard = () => {
    setShowReviewModal(false)
    navigate('/dashboard/chats')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Complete your company profile</h1>
      <p className="mt-1 text-sm text-slate-500">Step {step} of {TOTAL_STEPS} — required before accessing the publisher dashboard</p>

      <div className="mt-6 flex gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-slate-900' : 'bg-slate-200'}`} />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900">Company details</h2>
            <input value={profile.companyLegalName} onChange={(e) => update({ companyLegalName: e.target.value })} placeholder="Company legal name *"
              className="w-full rounded-xl border px-4 py-2.5 text-sm" />
            <input value={profile.authorizedPerson} onChange={(e) => update({ authorizedPerson: e.target.value })} placeholder="Authorized person *"
              className="w-full rounded-xl border px-4 py-2.5 text-sm" />
            <input value={profile.jobTitle} onChange={(e) => update({ jobTitle: e.target.value })} placeholder="Job title"
              className="w-full rounded-xl border px-4 py-2.5 text-sm" />
            <input value={profile.businessEmail} onChange={(e) => update({ businessEmail: e.target.value })} placeholder="Business email *"
              className="w-full rounded-xl border px-4 py-2.5 text-sm" />
            <input value={profile.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="Phone *"
              className="w-full rounded-xl border px-4 py-2.5 text-sm" />
            <select value={profile.city} onChange={(e) => update({ city: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm">
              {UAE_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={profile.address} onChange={(e) => update({ address: e.target.value })} placeholder="Business address"
              className="w-full rounded-xl border px-4 py-2.5 text-sm" />
            <input value={profile.website} onChange={(e) => update({ website: e.target.value })} placeholder="Website (optional)"
              className="w-full rounded-xl border px-4 py-2.5 text-sm" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900">License & documents</h2>
            <input value={profile.licenseNumber} onChange={(e) => update({ licenseNumber: e.target.value })} placeholder="Trade license number *"
              className="w-full rounded-xl border px-4 py-2.5 text-sm" />
            <div>
              <label htmlFor="license-expiry" className="mb-1 block text-sm font-medium text-slate-700">License expiry date *</label>
              <input id="license-expiry" type="date" required value={profile.licenseExpiry} onChange={(e) => update({ licenseExpiry: e.target.value })}
                className="w-full rounded-xl border px-4 py-2.5 text-sm" />
            </div>
            <input value={profile.vatTrn} onChange={(e) => update({ vatTrn: e.target.value })} placeholder="VAT TRN (optional)"
              className="w-full rounded-xl border px-4 py-2.5 text-sm" />

            <DocumentUpload
              label="Trade license"
              hint="PDF or image of your UAE trade license"
              accept=".pdf,image/*"
              required
              documentType="trade_license"
              value={findDocument(profile.documents, 'trade_license') ?? null}
              onChange={(doc) => setDoc('trade_license', 'Trade license', doc)}
            />
            <DocumentUpload
              label="VAT certificate"
              hint="Optional — upload if registered for VAT"
              accept=".pdf,image/*"
              documentType="vat_certificate"
              value={findDocument(profile.documents, 'vat_certificate') ?? null}
              onChange={(doc) => setDoc('vat_certificate', 'VAT certificate', doc)}
            />
            <DocumentUpload
              label="Authorized signatory ID"
              hint="Emirates ID or passport of authorized person"
              accept=".pdf,image/*"
              documentType="signatory_id"
              value={findDocument(profile.documents, 'signatory_id') ?? null}
              onChange={(doc) => setDoc('signatory_id', 'Authorized signatory ID', doc)}
            />
            <DocumentUpload
              label="Company logo"
              hint="PNG or JPG for your public profile"
              accept="image/*"
              documentType="company_logo"
              value={findDocument(profile.documents, 'company_logo') ?? null}
              onChange={(doc) => setDoc('company_logo', 'Company logo', doc)}
            />
            <DocumentUpload
              label="Insurance certificate"
              hint="Public liability or media placement insurance (recommended)"
              accept=".pdf,image/*"
              documentType="insurance"
              value={findDocument(profile.documents, 'insurance') ?? null}
              onChange={(doc) => setDoc('insurance', 'Insurance certificate', doc)}
            />
            <DocumentUpload
              label="Media kit"
              hint="Optional — company overview and inventory summary"
              accept=".pdf,image/*"
              documentType="media_kit"
              value={findDocument(profile.documents, 'media_kit') ?? null}
              onChange={(doc) => setDoc('media_kit', 'Media kit', doc)}
            />
            <DocumentUpload
              label="Rate card"
              hint="Optional — standard rate sheet for your inventory"
              accept=".pdf,image/*"
              documentType="rate_card"
              value={findDocument(profile.documents, 'rate_card') ?? null}
              onChange={(doc) => setDoc('rate_card', 'Rate card', doc)}
            />

            <div>
              <p className="mb-2 text-sm font-medium">Media categories operated *</p>
              <div className="flex flex-wrap gap-2">
                {MEDIA_CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium ${profile.mediaCategories.includes(cat) ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'}`}>
                    {MEDIA_CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={profile.companyDescription} onChange={(e) => update({ companyDescription: e.target.value })}
              placeholder="Company description" rows={3} className="w-full rounded-xl border px-4 py-2.5 text-sm" />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <h2 className="font-semibold text-slate-900">Review & submit</h2>
            <p><strong>Company:</strong> {profile.companyLegalName}</p>
            <p><strong>Authorized:</strong> {profile.authorizedPerson}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>License:</strong> {profile.licenseNumber}</p>
            <p><strong>License expiry:</strong> {profile.licenseExpiry || '—'}</p>
            <p><strong>Categories:</strong> {profile.mediaCategories.map((c) => MEDIA_CATEGORY_LABELS[c]).join(', ')}</p>
            <p><strong>Documents:</strong> {profile.documents.map((d) => d.label).join(', ') || 'None'}</p>
            <p className="text-slate-500">After submission, an admin will review your profile before you can publish listings.</p>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="rounded-xl border px-4 py-2 text-sm font-medium">Back</button>
          ) : <span />}
          {step < TOTAL_STEPS ? (
            <button type="button" onClick={continueToNextStep}
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white">Continue</button>
          ) : (
            <button type="button" onClick={submit}
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white">Submit for approval</button>
          )}
        </div>
      </div>

      <UnderReviewModal
        open={showReviewModal}
        title="Under review"
        message="Your company profile has been submitted and is under admin review. You can access your dashboard now, but listing creation will unlock after approval."
        onContinue={goToDashboard}
      />
    </div>
  )
}
