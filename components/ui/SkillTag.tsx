'use client'

const ALL_SKILLS = [
  { id: 'primeros_auxilios', label: '🩹 Primeros auxilios' },
  { id: 'rcp',               label: '❤️ RCP' },
  { id: 'ingles',            label: '🇬🇧 Inglés' },
  { id: 'musica',            label: '🎵 Música' },
  { id: 'deporte',           label: '⚽ Deporte' },
  { id: 'tareas',            label: '📚 Apoyo escolar' },
  { id: 'cocina',            label: '🍳 Cocina' },
  { id: 'bebes',             label: '👶 Bebés (0-2 años)' },
  { id: 'nee',               label: '💜 Necesidades especiales' },
  { id: 'artes',             label: '🎨 Artes y manualidades' },
  { id: 'frances',           label: '🇫🇷 Francés' },
  { id: 'natacion',          label: '🏊 Natación' },
]

interface SkillTagProps {
  skill: string
  selected?: boolean
  onClick?: () => void
}

export function SkillTag({ skill, selected = false, onClick }: SkillTagProps) {
  const found = ALL_SKILLS.find((s) => s.id === skill)
  const label = found?.label ?? skill
  return (
    <button
      type="button"
      onClick={onClick}
      className={`skill-tag ${selected ? 'selected' : ''}`}
    >
      {label}
    </button>
  )
}

interface SkillsPickerProps {
  value: string[]   // array of skill ids
  onChange: (skills: string[]) => void
  label?: string
}

export function SkillsPicker({ value, onChange, label = 'Habilidades' }: SkillsPickerProps) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((s) => s !== id) : [...value, id])
  }

  return (
    <div>
      <label className="input-label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {ALL_SKILLS.map((s) => (
          <SkillTag
            key={s.id}
            skill={s.id}
            selected={value.includes(s.id)}
            onClick={() => toggle(s.id)}
          />
        ))}
      </div>
      {value.length > 0 && (
        <p className="text-xs text-warm-400 mt-2">{value.length} seleccionada{value.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}

export { ALL_SKILLS }
