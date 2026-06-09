import type { DocumentType, UploadedDocument } from '@shared/types/owner'

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Failed to read file'))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function createUploadedDocument(
  file: File,
  type: DocumentType,
  label: string,
): Promise<UploadedDocument> {
  return readFileAsDataUrl(file).then((data) => ({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    label,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    data,
    uploadedAt: new Date().toISOString(),
  }))
}

export function isImageDocument(doc: UploadedDocument) {
  return doc.mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.fileName)
}

export function findDocument(docs: UploadedDocument[], type: DocumentType) {
  return docs.find((d) => d.type === type)
}

export function upsertDocument(docs: UploadedDocument[], doc: UploadedDocument) {
  const without = docs.filter((d) => d.type !== doc.type)
  return [...without, doc]
}

export function removeDocument(docs: UploadedDocument[], id: string) {
  return docs.filter((d) => d.id !== id)
}
