/**
 * Skill match score: ratio of required skills covered by nanny.
 * If no required skills → 1.0 (no penalty).
 */
export function calculateSkillMatch(
  nannySkillsJson: string | null,
  requiredSkillsJson: string | null
): number {
  const required = parseJson(requiredSkillsJson)
  if (required.length === 0) return 1.0 // no requirements = perfect match

  const nannySkills = parseJson(nannySkillsJson)
  if (nannySkills.length === 0) return 0

  const covered = required.filter((s) =>
    nannySkills.some((ns) => ns.toLowerCase() === s.toLowerCase())
  )
  return covered.length / required.length
}

function parseJson(json: string | null): string[] {
  if (!json) return []
  try { return JSON.parse(json) } catch { return [] }
}
