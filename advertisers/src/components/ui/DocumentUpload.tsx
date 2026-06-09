import { FileText, ImageIcon, Paperclip, Upload, X } from 'lucide-react'
import { useRef } from 'react'
import type { DocumentType, UploadedDocument } from '@shared/types/owner'
import { createUploadedDocument, isImageDocument } from '@shared/utils/fileUpload'

interface DocumentUploadProps {
  label: string
  hint?: string
  accept?: string
  required?: boolean
  documentType: DocumentType
  value?: UploadedDocument | null
  onChange: (doc: UploadedDocument | null) => void
  variant?: 'default' | 'compact'
}

export function DocumentUpload({
  label,
  hint,
  accept = '.pdf,image/*',
  required,
  documentType,
  value,
  onChange,
  variant = 'default',
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const doc = await createUploadedDocument(file, documentType, label)
    onChange(doc)
    e.target.value = ''
  }

  const compact = variant === 'compact'

  return (
    <div className={compact ? '' : 'rounded-xl border border-slate-200 bg-slate-50/50 p-4'}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-800">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </p>
          {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
        </div>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-red-500" aria-label="Remove file">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {value ? (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
          {isImageDocument(value) ? (
            <img src={value.data} alt="" className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
              <FileText className="h-5 w-5 text-slate-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">{value.fileName}</p>
            <p className="text-xs text-emerald-600">Uploaded</p>
          </div>
          <button type="button" onClick={() => inputRef.current?.click()}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900">Replace</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 ${compact ? 'py-3' : 'py-5'}`}
        >
          <Upload className="h-4 w-4" />
          Choose file
        </button>
      )}

      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
    </div>
  )
}

interface MultiDocumentUploadProps {
  label: string
  hint?: string
  accept?: string
  documentType: DocumentType
  values: UploadedDocument[]
  onChange: (docs: UploadedDocument[]) => void
  maxFiles?: number
}

export function MultiDocumentUpload({
  label,
  hint,
  accept = '.pdf,image/*',
  documentType,
  values,
  onChange,
  maxFiles = 5,
}: MultiDocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = maxFiles - values.length
    const toAdd = files.slice(0, remaining)
    const docs = await Promise.all(
      toAdd.map((file) => createUploadedDocument(file, documentType, label)),
    )
    onChange([...values, ...docs])
    e.target.value = ''
  }

  const remove = (id: string) => onChange(values.filter((d) => d.id !== id))

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}

      {values.length > 0 && (
        <ul className="mt-3 space-y-2">
          {values.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5">
              {isImageDocument(doc) ? (
                <ImageIcon className="h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <Paperclip className="h-4 w-4 shrink-0 text-slate-400" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{doc.fileName}</span>
              <button type="button" onClick={() => remove(doc.id)} className="text-slate-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {values.length < maxFiles && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white py-4 text-sm font-medium text-slate-600 hover:border-slate-400"
        >
          <Upload className="h-4 w-4" />
          Add file ({values.length}/{maxFiles})
        </button>
      )}

      <input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={handleFiles} />
    </div>
  )
}
