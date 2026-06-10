import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getChildProfiles } from '@/actions/family'
import ChildProfileForm from '@/components/family/ChildProfileForm'

export const metadata = { title: 'Sobre tus hijos | Refugia' }

export default async function ChildrenPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') redirect('/login')

  const children = await getChildProfiles()

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-3xl flex items-center justify-center text-2xl"
               style={{ background: 'linear-gradient(135deg, #fdf4ff, #ede9fe)' }}>
            👨‍👩‍👧
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Cuéntanos sobre los niños</h1>
            <p className="text-stone-500 text-sm">Esto nos ayuda a recomendarte la niñera más adecuada para tu familia</p>
          </div>
        </div>
      </div>

      {/* Privacy note — brief, visible, reassuring */}
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-violet-500 text-lg mt-0.5">🔒</span>
        <div>
          <p className="text-violet-800 text-sm font-semibold">Tu información es privada</p>
          <p className="text-violet-600 text-xs mt-0.5">
            Solo se usa para mejorar las recomendaciones. Las niñeras no ven esta información hasta que aceptan una solicitud.
          </p>
        </div>
      </div>

      {/* Form */}
      <ChildProfileForm initialChildren={children as any} />

      {/* Tips */}
      <div className="bg-stone-50 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-stone-700">💡 ¿Para qué sirve esto?</p>
        <ul className="text-sm text-stone-500 space-y-1.5">
          <li>• Si tienes un bebé, priorizamos niñeras con experiencia en recién nacidos</li>
          <li>• Si tu hijo es muy activo, buscamos niñeras que disfruten ese ritmo</li>
          <li>• Si necesita apoyo escolar, filtramos quienes tienen esa habilidad</li>
          <li>• Si hay condiciones especiales, encontramos quienes tienen experiencia real</li>
        </ul>
      </div>
    </div>
  )
}
