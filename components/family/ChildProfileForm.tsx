'use client'

import { useState } from 'react'
import { saveChildProfile, deleteChildProfile } from '@/actions/family'

// ── Types ────────────────────────────────────────────────────────────────────

interface Child {
  id?: string
  name?: string
  age: number
  temperament?: string   // JSON array string
  routines?: string
  supportNeeds?: string
  conditions?: string
  allergies?: string
  specialInstructions?: string
}

const TEMPERAMENT_OPTIONS = [
  { value: 'tranquilo',  label: '😌 Tranquilo/a',  desc: 'Le gusta jugar solo y en calma' },
  { value: 'activo',     label: '⚡ Muy activo/a',   desc: 'Lleno de energía, le encanta moverse' },
  { value: 'timido',     label: '🌸 Tímido/a',       desc: 'Se toma su tiempo para confiar' },
  { value: 'sociable',   label: '🤗 Sociable',        desc: 'Le encanta conocer gente nueva' },
]

const ROUTINE_OPTIONS = [
  { value: 'duerme_siesta',      label: '😴 Duerme siesta' },
  { value: 'horario_fijo',       label: '🕐 Tiene horario fijo' },
  { value: 'rutina_especifica',  label: '📋 Necesita una rutina específica' },
]

const SUPPORT_OPTIONS = [
  { value: 'apoyo_escolar',             label: '📚 Apoyo con tareas o lectura' },
  { value: 'acompanamiento_constante',  label: '🤝 Le gusta tener a alguien cerca' },
  { value: 'mayor_atencion',            label: '💛 Requiere un poco más de atención' },
  { value: 'paciencia_extra',           label: '🌿 Necesita paciencia extra' },
]

const CONDITION_OPTIONS = [
  { value: 'TEA',                  label: 'TEA (Trastorno del Espectro Autista)' },
  { value: 'TDAH',                 label: 'TDAH' },
  { value: 'discapacidad_fisica',  label: 'Discapacidad física' },
  { value: 'discapacidad_cognitiva', label: 'Discapacidad cognitiva' },
  { value: 'otro',                 label: 'Otra condición' },
]

// ── Empty child factory ───────────────────────────────────────────────────────

function emptyChild(): Partial<Child> {
  return { age: 3, temperament: '[]', routines: '[]', supportNeeds: '[]', conditions: '[]' }
}

// ── Toggle helpers ────────────────────────────────────────────────────────────

function toggleItem(jsonStr: string | undefined, value: string): string {
  let arr: string[] = []
  try { arr = JSON.parse(jsonStr ?? '[]') } catch {}
  const idx = arr.indexOf(value)
  if (idx === -1) arr.push(value)
  else arr.splice(idx, 1)
  return JSON.stringify(arr)
}

function hasItem(jsonStr: string | undefined, value: string): boolean {
  try { return JSON.parse(jsonStr ?? '[]').includes(value) } catch { return false }
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

interface ChildFormProps {
  child: Partial<Child>
  index: number
  onChange: (c: Partial<Child>) => void
  onSave: () => void
  onRemove?: () => void
  saving: boolean
}

function ChildForm({ child, index, onChange, onSave, onRemove, saving }: ChildFormProps) {
  const [showMore, setShowMore] = useState(!!(
    child.supportNeeds !== '[]' || child.conditions !== '[]' || child.allergies
  ))

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-stone-800 text-base">
          {child.name ? `👧 ${child.name}` : `👶 Niño/a ${index + 1}`}
        </h3>
        {onRemove && (
          <button onClick={onRemove} className="text-stone-400 hover:text-red-400 text-sm transition-colors">
            Eliminar
          </button>
        )}
      </div>

      {/* Name (optional) + Age (required) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="input-label">Nombre (opcional)</label>
          <input
            type="text"
            className="input"
            placeholder="Ej: Martín"
            value={child.name ?? ''}
            onChange={(e) => onChange({ ...child, name: e.target.value || undefined })}
          />
        </div>
        <div>
          <label className="input-label">Edad <span className="text-red-400">*</span></label>
          <input
            type="number"
            className="input"
            min={0} max={17}
            value={child.age ?? ''}
            onChange={(e) => onChange({ ...child, age: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Temperament */}
      <div>
        <label className="input-label">¿Cómo es? <span className="text-stone-400 font-normal">(opcional)</span></label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {TEMPERAMENT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange({ ...child, temperament: toggleItem(child.temperament, o.value) })}
              className={`p-3 rounded-2xl border-2 text-left text-sm transition-all duration-150 ${
                hasItem(child.temperament, o.value)
                  ? 'border-violet-400 bg-violet-50 text-violet-800'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-violet-200'
              }`}
            >
              <div className="font-semibold">{o.label}</div>
              <div className="text-xs text-stone-400 mt-0.5">{o.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Routines */}
      <div>
        <label className="input-label">¿Tiene alguna rutina importante? <span className="text-stone-400 font-normal">(opcional)</span></label>
        <div className="flex flex-wrap gap-2 mt-1">
          {ROUTINE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange({ ...child, routines: toggleItem(child.routines, o.value) })}
              className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
                hasItem(child.routines, o.value)
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* "Más información" toggle — keeps form clean */}
      {!showMore && (
        <button
          type="button"
          onClick={() => setShowMore(true)}
          className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
        >
          + ¿Hay algo más que debería saber la niñera?
        </button>
      )}

      {showMore && (
        <div className="space-y-4 border-t border-stone-100 pt-4">
          {/* Support needs — friendly labels, no clinical tone */}
          <div>
            <label className="input-label">¿Necesita apoyo adicional? <span className="text-stone-400 font-normal">(opcional)</span></label>
            <p className="text-xs text-stone-400 mb-2">Selecciona lo que aplique. Esto ayuda a encontrar la niñera más adecuada.</p>
            <div className="space-y-2">
              {SUPPORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onChange({ ...child, supportNeeds: toggleItem(child.supportNeeds, o.value) })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm text-left transition-all duration-150 ${
                    hasItem(child.supportNeeds, o.value)
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-amber-200'
                  }`}
                >
                  <span className="flex-1">{o.label}</span>
                  {hasItem(child.supportNeeds, o.value) && <span className="text-amber-500">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Conditions — presented with care, never clinical */}
          <div>
            <label className="input-label">¿Tiene alguna condición que debamos considerar? <span className="text-stone-400 font-normal">(opcional)</span></label>
            <p className="text-xs text-stone-400 mb-2">
              Esta información es privada y solo se usa para recomendarte niñeras con la experiencia adecuada.
            </p>
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onChange({ ...child, conditions: toggleItem(child.conditions, o.value) })}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
                    hasItem(child.conditions, o.value)
                      ? 'bg-violet-50 border-violet-300 text-violet-700'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-violet-200'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Free text fields */}
          <div>
            <label className="input-label">¿Alguna alergia o indicación de salud?</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: alérgico al maní, usa inhaler si juega mucho..."
              value={child.allergies ?? ''}
              onChange={(e) => onChange({ ...child, allergies: e.target.value || undefined })}
            />
          </div>

          <div>
            <label className="input-label">¿Hay algo importante que la niñera deba saber?</label>
            <textarea
              className="input h-20 resize-none"
              placeholder="Ej: le tiene miedo a los perros, le cuesta quedarse solo al principio..."
              value={child.specialInstructions ?? ''}
              onChange={(e) => onChange({ ...child, specialInstructions: e.target.value || undefined })}
            />
          </div>
        </div>
      )}

      <button
        onClick={onSave}
        disabled={saving || !child.age}
        className="btn-primary w-full justify-center"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  initialChildren: Child[]
}

export default function ChildProfileForm({ initialChildren }: Props) {
  const [children, setChildren] = useState<Partial<Child>[]>(
    initialChildren.length > 0 ? initialChildren : [emptyChild()]
  )
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<Set<number>>(new Set())

  function updateChild(i: number, data: Partial<Child>) {
    setChildren((prev) => prev.map((c, idx) => (idx === i ? data : c)))
  }

  async function handleSave(i: number) {
    const child = children[i]
    if (!child.age) return
    setSaving(i)
    const result = await saveChildProfile({
      id: child.id,
      name: child.name,
      age: child.age,
      temperament: child.temperament,
      routines: child.routines,
      supportNeeds: child.supportNeeds,
      conditions: child.conditions,
      allergies: child.allergies,
      specialInstructions: child.specialInstructions,
    })
    setSaving(null)
    if (result.success) setSaved((s) => new Set(s).add(i))
  }

  async function handleRemove(i: number) {
    const child = children[i]
    if (child.id) await deleteChildProfile(child.id)
    setChildren((prev) => prev.filter((_, idx) => idx !== i))
  }

  function addChild() {
    setChildren((prev) => [...prev, emptyChild()])
  }

  return (
    <div className="space-y-5">
      {children.map((child, i) => (
        <div key={i} className="relative">
          {saved.has(i) && (
            <div className="absolute -top-2 right-4 z-10 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              ✓ Guardado
            </div>
          )}
          <ChildForm
            child={child}
            index={i}
            onChange={(c) => updateChild(i, c)}
            onSave={() => handleSave(i)}
            onRemove={children.length > 1 ? () => handleRemove(i) : undefined}
            saving={saving === i}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addChild}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-violet-200 text-violet-600 font-semibold hover:bg-violet-50 transition-colors"
      >
        + Agregar otro niño/a
      </button>
    </div>
  )
}
