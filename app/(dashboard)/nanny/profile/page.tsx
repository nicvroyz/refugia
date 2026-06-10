import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getNannyDashboardData } from '@/actions/nanny'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { VerificationChecklist, AutoBadges } from '@/components/ui/VerificationChecklist'
import { AvailabilityCalendar } from '@/components/nanny/AvailabilityCalendar'
import Link from 'next/link'

export const metadata = { title: 'Mi Perfil | Refugia' }

const LEVEL_OPTIONS = [
  { id: 'BASIC', label: 'Básica (1-2 años)' },
  { id: 'EXPERIENCED', label: 'Experimentada (3-6 años)' },
  { id: 'PREMIUM', label: 'Premium (7+ años, certificaciones)' },
]

const COMMUNES = ['Providencia', 'Las Condes', 'Ñuñoa', 'Santiago', 'Vitacura', 'La Florida', 'Recoleta', 'Independencia', 'Macul', 'San Miguel', 'Puente Alto', 'Maipú', 'Peñalolén', 'La Reina', 'Lo Barnechea']

export default async function NannyProfilePage() {
  const session = await getSession()
  if (!session || session.user.role !== 'NANNY') redirect('/login')

  const data = await getNannyDashboardData()
  if (!data) redirect('/login')

  const { profile } = data
  let skills: string[] = []
  let certs: string[] = []
  try { skills = JSON.parse(profile.skills ?? '[]') } catch {}
  try { certs = JSON.parse(profile.certifications ?? '[]') } catch {}

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Mi perfil profesional</h1>
          <p className="text-stone-500 text-sm mt-1">Mantén tu información actualizada para atraer más familias.</p>
        </div>
        <div className="flex items-center gap-2">
          <TrustBadge status={profile.trustStatus} source={profile.badgeSource} />
        </div>
      </div>

      {/* Profile overview */}
      <div className="card p-6 space-y-5">
        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-3">Información básica</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Nombre completo</label>
            <p className="input bg-stone-50 cursor-not-allowed">{session.user.name}</p>
          </div>
          <div>
            <label className="input-label">Email</label>
            <p className="input bg-stone-50 cursor-not-allowed">{session.user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Años de experiencia</label>
            <p className="input bg-stone-50">{profile.experienceYears}</p>
          </div>
          <div>
            <label className="input-label">Nivel actual</label>
            <div className="mt-1">
              <span className={`badge ${profile.level === 'PREMIUM' ? 'badge-premium' : profile.level === 'EXPERIENCED' ? 'badge-experienced' : 'badge-basic'}`}>
                {profile.level}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="input-label">Biografía</label>
          <p className="input bg-stone-50 min-h-[80px]">{profile.bio ?? 'Sin biografía aún'}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-100">
          <div className="text-center bg-stone-50 rounded-xl p-3">
            <p className="text-xs text-stone-500 font-medium">Tpo. Resp.</p>
            <p className="text-lg font-bold text-stone-800">{profile.avgResponseTimeMins ? `${profile.avgResponseTimeMins}m` : '-'}</p>
          </div>
          <div className="text-center bg-stone-50 rounded-xl p-3">
            <p className="text-xs text-stone-500 font-medium">% Resp.</p>
            <p className="text-lg font-bold text-stone-800">{profile.acceptanceRate ? `${Math.round(profile.acceptanceRate * 100)}%` : '-'}</p>
          </div>
          <div className="text-center bg-stone-50 rounded-xl p-3">
            <p className="text-xs text-stone-500 font-medium">Familias</p>
            <p className="text-lg font-bold text-stone-800">{profile.totalFamiliesWorked}</p>
          </div>
          <div className="text-center bg-stone-50 rounded-xl p-3">
            <p className="text-xs text-stone-500 font-medium">Recontratos</p>
            <p className="text-lg font-bold text-stone-800">{profile.totalRebookings}</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-3">Ubicación y cobertura</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Comuna base</label>
            <p className="input bg-stone-50">{profile.commune ?? 'No configurada'}</p>
          </div>
          <div>
            <label className="input-label">Radio de cobertura</label>
            <p className="input bg-stone-50">{profile.coverageRadiusKm} km</p>
          </div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-sm text-amber-800 border border-amber-200">
          🔒 Tu ubicación exacta nunca es compartida. Solo mostramos tu comuna y una zona aproximada.
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-3">Verificaciones de identidad</h2>
        <VerificationChecklist
          identityVerified={profile.identityVerified}
          backgroundCheck={profile.backgroundCheck}
          certificationsVerified={profile.certificationsVerified}
          experienceVerified={profile.experienceVerified}
          size="md"
        />
        {profile.verificationNotes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-800">
            📋 Nota: {profile.verificationNotes}
          </div>
        )}
      </div>
      {/* Skills & Certs */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-3">Habilidades y certificaciones</h2>
        <div>
          <label className="input-label">Habilidades</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {skills.length === 0 ? (
              <p className="text-stone-400 text-sm">No configuradas aún</p>
            ) : skills.map((s) => (
              <span key={s} className="skill-tag selected pointer-events-none">{s.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
        <div>
          <label className="input-label">Certificaciones</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {certs.length === 0 ? (
              <p className="text-stone-400 text-sm">No configuradas aún</p>
            ) : certs.map((c) => (
              <span key={c} className="badge badge-verified">{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Rates */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-3">Tarifas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-violet-50 rounded-2xl p-4">
            <p className="text-sm text-violet-600 font-medium">Tarifa base</p>
            <p className="text-2xl font-bold text-stone-800 mt-1">${profile.hourlyRate.toLocaleString('es-CL')}<span className="text-sm font-normal text-stone-500">/hr</span></p>
          </div>
          {profile.hourlyRatePremium && (
            <div className="bg-amber-50 rounded-2xl p-4">
              <p className="text-sm text-amber-600 font-medium">Tarifa premium (noche/urgencia)</p>
              <p className="text-2xl font-bold text-stone-800 mt-1">${profile.hourlyRatePremium.toLocaleString('es-CL')}<span className="text-sm font-normal text-stone-500">/hr</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Calendar & Availability */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-3 mb-4">Disponibilidad y Calendario</h2>
        <AvailabilityCalendar 
          initialAvailability={profile.availability} 
          initialBlocks={profile.blocks} 
        />
      </div>

      {/* Trust badge info */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-3 mb-4">Estado de verificación</h2>
        <div className="flex items-start gap-4">
          <div className="text-3xl">
            {profile.trustStatus === 'TOP_NANNY' ? '⭐' : profile.trustStatus === 'VERIFIED' ? '✅' : '⏳'}
          </div>
          <div>
            <TrustBadge status={profile.trustStatus} source={profile.badgeSource} size="md" />
            <p className="text-stone-500 text-sm mt-2">
              {profile.trustStatus === 'TOP_NANNY' && 'Eres una niñera Top Refugia. Has superado las 10 reseñas con rating ≥ 4.8. ¡Felicitaciones!'}
              {profile.trustStatus === 'VERIFIED' && 'Tu perfil fue revisado y aprobado por el equipo Refugia.'}
              {profile.trustStatus === 'PENDING_REVIEW' && 'Tu perfil está siendo revisado. Te notificaremos cuando sea aprobado.'}
            </p>
            {profile.rating > 0 && (
              <p className="text-sm font-semibold text-stone-700 mt-2">
                ⭐ {profile.rating.toFixed(1)} ({profile.totalReviews} reseñas)
                {profile.trustStatus === 'VERIFIED' && profile.rating >= 4.8 && profile.totalReviews >= 10 &&
                  <span className="text-emerald-600 ml-2">→ Pronto puedes ser TOP_NANNY</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Link href="/nanny" className="btn-secondary">← Volver al panel</Link>
        <Link href="/nanny/agenda" className="btn-primary">Ver agenda →</Link>
      </div>
    </div>
  )
}
