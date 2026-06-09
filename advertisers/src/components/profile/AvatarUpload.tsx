import { Camera } from 'lucide-react'
import { useRef } from 'react'

interface AvatarUploadProps {
  avatarUrl: string | null
  name: string
  onChange: (dataUrl: string) => void
}

export function AvatarUpload({ avatarUrl, name, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <button type="button" onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700">
          <Camera className="h-4 w-4" />
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      <div>
        <p className="font-semibold text-slate-900">Profile photo</p>
        <p className="text-sm text-slate-500">JPG or PNG, stored locally for now</p>
      </div>
    </div>
  )
}
