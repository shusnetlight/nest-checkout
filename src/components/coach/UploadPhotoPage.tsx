import { useRef, useState } from 'react'
import { Info, ImageUp, Trash2, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import NestBackground from '../NestBackground'

interface Props {
  sessionId: string
  nestName: string
  nestEmoji: string
  onDone: (photoUrl: string | null) => void
  onNavigate: (step: number) => void
}

export default function UploadPhotoPage({ sessionId, nestName, nestEmoji, onDone, onNavigate }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    setError(null)
    setPreview(URL.createObjectURL(f))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f?.type.startsWith('image/')) handleFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${sessionId}/checkin.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('session-photo')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('session-photo').getPublicUrl(path)
      await supabase.from('sessions').update({ photo_url: publicUrl }).eq('id', sessionId)
      onDone(publicUrl)
    } catch {
      setError('Upload failed — please try again.')
      setUploading(false)
    }
  }

  return (
    <div className="relative z-10 min-h-screen bg-nl-beige flex flex-col items-center justify-center px-8">
      <NestBackground emojis={[nestEmoji]} />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-12">
        {['Select Nest', 'Add Photo', 'Share & Start'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            {i === 0 ? (
              <button
                onClick={() => onNavigate(0)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-nl-purple/20 text-nl-purple-dark hover:bg-nl-purple/30 transition-colors cursor-pointer"
              >
                <Check size={11} />
                <span className="leading-none">{label}</span>
              </button>
            ) : (
              <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                ${i === 1 ? 'bg-nl-purple-dark text-nl-white' : 'bg-nl-black/10 text-nl-black/30'}`}
              >
                <span className="leading-none">{label}</span>
              </div>
            )}
            {i < 2 && <span className="text-nl-black/20 text-xs">→</span>}
          </div>
        ))}
      </div>

      <p className="font-normal uppercase text-xl text-nl-purple-dark mb-4">
        {nestEmoji.startsWith('/') ? <img src={nestEmoji} className="inline-block w-5 h-5 object-contain align-middle mr-1" /> : nestEmoji} {nestName}
      </p>

      <h1 className="font-black text-6xl text-nl-black text-center leading-tight mb-4">
        Check-in Snapshot
      </h1>

      <p className="font-normal text-lg text-nl-black/70 text-center max-w-xl mb-10">
        Got a photo of what your Nest planned during the week's check-in?<br />
        Your team will get a moment to reflect on it during the checkout.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="w-full max-w-md h-52 border-2 border-dashed border-nl-black/20 bg-nl-white rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-nl-purple hover:scale-[1.03] hover:shadow-lg transform-gpu transition-all duration-200"
        >
          <span className="text-5xl">📷</span>
          <p className="font-semibold text-sm text-nl-black/40">Click to select or drag & drop a photo</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          {/* Image with hover overlay */}
          <div className="relative group w-fit mx-auto">
            <img src={preview} className="max-h-96 w-auto mx-auto rounded-2xl shadow-md block" />
            <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/55 transition-all duration-200 flex items-center justify-center gap-4">
              <button
                onClick={() => inputRef.current?.click()}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-1.5 text-white cursor-pointer"
                title="Upload different photo"
              >
                <div className="bg-white/20 hover:bg-white/30 hover:scale-110 backdrop-blur-sm rounded-xl p-3 transition-all">
                  <ImageUp size={22} className="text-white" />
                </div>
                <span className="text-xs font-semibold">Replace</span>
              </button>
              <button
                onClick={() => { setPreview(null); setFile(null) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-1.5 text-white cursor-pointer"
                title="Remove photo"
              >
                <div className="bg-white/20 hover:bg-white/30 hover:scale-110 backdrop-blur-sm rounded-xl p-3 transition-all">
                  <Trash2 size={22} className="text-white" />
                </div>
                <span className="text-xs font-semibold">Remove</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-nl-black/40 text-center flex items-center gap-1.5 justify-center">
            <Info size={13} /> Picture is zoomable during the checkout.
          </p>
          {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
        </div>
      )}

      <button
        onClick={preview ? handleUpload : () => onDone(null)}
        disabled={uploading}
        className="relative z-10 mt-12 font-bold text-base px-10 py-4 rounded-xl bg-nl-purple-dark text-nl-white hover:bg-nl-purple hover:text-nl-black transition-colors cursor-pointer disabled:opacity-100 disabled:cursor-wait"
      >
        {uploading ? 'Uploading…' : preview ? 'Use this photo →' : 'Skip for now →'}
      </button>
    </div>
  )
}
