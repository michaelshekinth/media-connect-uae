import { DocumentUpload } from '../ui/DocumentUpload'
import type { OwnerCompanyProfile, UploadedDocument } from '@shared/types/owner'
import { findDocument, upsertDocument } from '@shared/utils/fileUpload'

interface CompanyDocumentsSectionProps {
  profile: OwnerCompanyProfile
  onChange: (profile: OwnerCompanyProfile) => void
}

export function CompanyDocumentsSection({ profile, onChange }: CompanyDocumentsSectionProps) {
  const setDoc = (type: UploadedDocument['type'], label: string, doc: UploadedDocument | null) => {
    let documents = profile.documents ?? []
    if (doc) documents = upsertDocument(documents, { ...doc, type, label })
    else documents = documents.filter((d) => d.type !== type)
    onChange({ ...profile, documents })
  }

  const docs = profile.documents ?? []

  return (
    <div className="space-y-3 border-t border-slate-200 pt-4">
      <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
      <DocumentUpload
        label="Trade license"
        accept=".pdf,image/*"
        required
        documentType="trade_license"
        value={findDocument(docs, 'trade_license') ?? null}
        onChange={(doc) => setDoc('trade_license', 'Trade license', doc)}
        variant="compact"
      />
      <DocumentUpload
        label="VAT certificate"
        accept=".pdf,image/*"
        documentType="vat_certificate"
        value={findDocument(docs, 'vat_certificate') ?? null}
        onChange={(doc) => setDoc('vat_certificate', 'VAT certificate', doc)}
        variant="compact"
      />
      <DocumentUpload
        label="Authorized signatory ID"
        accept=".pdf,image/*"
        documentType="signatory_id"
        value={findDocument(docs, 'signatory_id') ?? null}
        onChange={(doc) => setDoc('signatory_id', 'Authorized signatory ID', doc)}
        variant="compact"
      />
      <DocumentUpload
        label="Company logo"
        accept="image/*"
        documentType="company_logo"
        value={findDocument(docs, 'company_logo') ?? null}
        onChange={(doc) => setDoc('company_logo', 'Company logo', doc)}
        variant="compact"
      />
    </div>
  )
}
