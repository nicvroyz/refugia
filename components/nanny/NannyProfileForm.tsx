'use client'

import { useState, useTransition } from 'react'
import { updateNannyProfile } from '@/actions/nanny'

interface ProfileFormProps {
  profile: {
    bio?: string | null
    experienceYears: number
    hourlyRate: any
    commune?: string | null
    certifications?: string | null
    languages?: string | null
    photoUrl?: string | null
    isAvailable: boolean
  }
}

const COMMUNES = [
  'Providencia', 'Las Condes', 'Ñuñoa', 'Santiago', 'Vitacura',
  'La Florida', 'Miraflores', 'Recoleta', 'Independencia', 'Macul',
  'San Miguel', 'Puente Alto', 'Maipú', 'Peñalolén', 'La Reina',
]

export function NannyProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setResult(null)

    startTransition(async () => {
      const bio = fd.get('bio') as string | null
      const commune = fd.get('commune') as string | null
      const expYears = fd.get('experienceYears')
      const rate = fd.get('hourlyRate')
      // Checkbox: if 'true' value exists it was checked
      const availableValues = fd.getAll('isAvailable')
      const isAvailable = availableValues.includes('true')

      const res = await updateNannyProfile({
        bio: bio || undefined,
        commune: commune || undefined,
        experienceYears: expYears ? Number(expYears) : undefined,
        hourlyRate: rate ? Number(rate) : undefined,
        isAvailable,
      })
      setResult(res)
      if (res.success) {
        setTimeout(() => setResult(null), 3000)
      }
    })
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-stone-800 mb-5">Información profesional</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {result?.error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-400 text-sm">
            {result.error}
          </div>
        )}
        {result?.success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm flex items-center gap-2">
            <span>✓</span> Perfil actualizado correctamente
          </div>
        )}

        {/* Bio */}
        <div>
          <label className="input-label">Descripción sobre ti</label>
          <textarea
            name="bio"
            rows={4}
            placeholder="Cuéntale a las familias sobre ti, tu experiencia y tu forma de trabajar..."
            className="input resize-none"
            defaultValue={profile.bio ?? ''}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Experience */}
          <div>
            <label className="input-label">Años de experiencia</label>
            <input
              name="experienceYears"
              type="number"
              min="0"
              max="50"
              className="input"
              defaultValue={profile.experienceYears}
            />
          </div>

          {/* Rate */}
          <div>
            <label className="input-label">Tarifa por hora (CLP)</label>
            <input
              name="hourlyRate"
              type="number"
              min="1000"
              step="500"
              className="input"
              defaultValue={Number(profile.hourlyRate)}
              placeholder="7500"
            />
          </div>
        </div>

        {/* Commune */}
        <div>
          <label className="input-label">Comuna donde trabajas</label>
          <select name="commune" className="input" defaultValue={profile.commune ?? ''}>
            <option value="">Selecciona una comuna</option>
            {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Photo URL */}
        <div>
          <label className="input-label">URL de foto de perfil</label>
          <input
            name="photoUrl"
            type="url"
            placeholder="https://ejemplo.com/mi-foto.jpg"
            className="input"
            defaultValue={profile.photoUrl ?? ''}
          />
          <p className="text-xs text-stone-400 mt-1">Pega el enlace de tu foto (Dropbox, Google Drive, etc.)</p>
        </div>

        {/* Certifications */}
        <div>
          <label className="input-label">Certificaciones y estudios</label>
          <input
            name="certifications"
            type="text"
            placeholder="Primeros auxilios, Técnico en Párvulos..."
            className="input-field"
            defaultValue={profile.certifications ?? ''}
          />
        </div>

        {/* Languages */}
        <div>
          <label className="input-label">Idiomas</label>
          <input
            name="languages"
            type="text"
            placeholder="Español, Inglés básico..."
            className="input-field"
            defaultValue={profile.languages ?? ''}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
          <div>
            <p className="text-sm font-medium text-stone-800">Disponible para solicitudes</p>
            <p className="text-xs text-stone-400 mt-0.5">Aparecerás en búsquedas cuando estés disponible</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              name="isAvailable"
              type="checkbox"
              className="sr-only peer"
              defaultChecked={profile.isAvailable}
              value="true"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer
                          peer-checked:after:translate-x-full peer-checked:bg-violet-600
                          after:content-[''] after:absolute after:top-0.5 after:left-0.5
                          after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>

        {/* Hidden field trick for checkbox */}
        <input type="hidden" name="isAvailable" value="false" />

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Guardando...
            </span>
          ) : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
