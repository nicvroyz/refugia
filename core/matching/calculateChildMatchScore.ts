/**
 * calculateChildMatchScore — v1.0
 *
 * Enriquece el score de matching con contexto de los hijos de la familia.
 * NUNCA excluye una niñera — solo ajusta el ranking.
 *
 * Regla de diseño: si no hay datos de niños → retorna null (fallback al score sin childMatch).
 */

export interface ChildMatchInput {
  age: number
  temperament?: string | null   // JSON: ["tranquilo"|"activo"|"timido"|"sociable"]
  routines?: string | null      // JSON: ["duerme_siesta"|"horario_fijo"|"rutina_especifica"]
  supportNeeds?: string | null  // JSON: ["mayor_atencion"|"apoyo_escolar"|"acompanamiento_constante"|"paciencia_extra"]
  conditions?: string | null    // JSON: ["TEA"|"TDAH"|"discapacidad_fisica"|"discapacidad_cognitiva"|"otro"]
}

// Maps child attributes → nanny skill tags
const AGE_SKILLS: { range: [number, number]; skills: string[] }[] = [
  { range: [0, 2],   skills: ['bebes', 'primeros_auxilios'] },
  { range: [3, 6],   skills: ['ninos_pequenos', 'bebes'] },
  { range: [7, 99],  skills: ['tareas', 'apoyo_escolar', 'ninos_escolares'] },
]

const TEMPERAMENT_SKILLS: Record<string, string[]> = {
  activo:   ['ninos_activos', 'juego_activo'],
  timido:   ['apoyo_emocional', 'paciencia'],
  tranquilo: [],   // most nannies handle calm kids well — no specific boost needed
  sociable:  [],
}

const SUPPORT_SKILLS: Record<string, string[]> = {
  apoyo_escolar:         ['tareas', 'apoyo_escolar'],
  acompanamiento_constante: ['apoyo_emocional', 'acompanamiento'],
  mayor_atencion:        ['paciencia', 'apoyo_emocional'],
  paciencia_extra:       ['paciencia'],
}

const CONDITION_SKILLS: Record<string, string[]> = {
  TEA:                   ['tea_tdah', 'paciencia', 'apoyo_emocional'],
  TDAH:                  ['tea_tdah', 'ninos_activos', 'paciencia'],
  discapacidad_fisica:   ['discapacidad', 'apoyo_emocional'],
  discapacidad_cognitiva:['discapacidad', 'paciencia', 'apoyo_emocional'],
  otro:                  ['paciencia', 'apoyo_emocional'],
}

function parseJSON(value: string | null | undefined): string[] {
  if (!value) return []
  try { return JSON.parse(value) } catch { return [] }
}

function hasSkill(nannySkills: string[], needed: string[]): number {
  if (needed.length === 0) return 0.5 // neutral — no specific need
  const hits = needed.filter((s) => nannySkills.includes(s)).length
  return hits / needed.length
}

/**
 * Returns a score 0–1 or null if no child data available.
 * null → caller uses original weights without childMatch.
 */
export function calculateChildMatchScore(
  children: ChildMatchInput[],
  nannySkillsRaw: string | null
): number | null {
  if (!children || children.length === 0) return null

  const nannySkills = parseJSON(nannySkillsRaw)
  const scores: number[] = []

  for (const child of children) {
    const childScores: number[] = []

    // ── 1. Age match ────────────────────────────────────────────────────────
    const ageGroup = AGE_SKILLS.find(({ range }) => child.age >= range[0] && child.age <= range[1])
    if (ageGroup && ageGroup.skills.length > 0) {
      childScores.push(hasSkill(nannySkills, ageGroup.skills))
    }

    // ── 2. Temperament ──────────────────────────────────────────────────────
    const temperaments = parseJSON(child.temperament)
    for (const t of temperaments) {
      const needed = TEMPERAMENT_SKILLS[t] ?? []
      if (needed.length > 0) childScores.push(hasSkill(nannySkills, needed))
    }

    // ── 3. Support needs ────────────────────────────────────────────────────
    const needs = parseJSON(child.supportNeeds)
    for (const n of needs) {
      const needed = SUPPORT_SKILLS[n] ?? []
      if (needed.length > 0) childScores.push(hasSkill(nannySkills, needed) * 1.2) // slight boost
    }

    // ── 4. Conditions (sensitive — never exclude, just adjust) ──────────────
    const conditions = parseJSON(child.conditions)
    for (const c of conditions) {
      const needed = CONDITION_SKILLS[c] ?? []
      // Reduce score if no match (don't set to 0), boost if match
      const match = hasSkill(nannySkills, needed)
      childScores.push(match > 0 ? match * 1.5 : 0.15) // at least 0.15 — never exclude
    }

    // Average for this child
    if (childScores.length > 0) {
      scores.push(childScores.reduce((a, b) => a + b, 0) / childScores.length)
    } else {
      scores.push(0.5) // no specific needs → neutral
    }
  }

  if (scores.length === 0) return null

  // Average across all children, capped at 1
  const raw = scores.reduce((a, b) => a + b, 0) / scores.length
  return Math.min(raw, 1)
}

/**
 * Returns a friendly label for the family based on childMatchScore.
 * Never shows a number — only human-readable context.
 */
export function getChildMatchLabel(score: number | null): string | null {
  if (score === null) return null
  if (score >= 0.75) return 'Muy recomendada para tu familia'
  if (score >= 0.45) return 'Buena opción según lo que necesitas'
  return null // don't show a label if match is low — just no badge
}
