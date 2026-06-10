import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export const metadata = { title: 'Mi perfil familiar | Refugia' }

const COMMUNES = [
  'Providencia', 'Las Condes', 'Ñuñoa', 'Santiago', 'Vitacura',
  'La Florida', 'Miraflores', 'Recoleta', 'Independencia', 'Macul',
  'San Miguel', 'Puente Alto', 'Maipú', 'Peñalolén', 'La Reina',
]

async function updateFamilyProfile(formData: FormData) {
  'use server'
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') return

  await prisma.familyProfile.upsert({
    where: { userId: session.user.id },
    update: {
      commune:      formData.get('commune') as string || null,
      address:      formData.get('address') as string || null,
      phone:        formData.get('phone') as string || null,
      preferences:  formData.get('preferences') as string || null,
      childrenCount: parseInt(formData.get('childrenCount') as string) || 1,
      childrenAges:  formData.get('childrenAges') as string || null,
    },
    create: {
      userId:       session.user.id,
      commune:      formData.get('commune') as string || null,
      address:      formData.get('address') as string || null,
      phone:        formData.get('phone') as string || null,
      preferences:  formData.get('preferences') as string || null,
      childrenCount: parseInt(formData.get('childrenCount') as string) || 1,
      childrenAges:  formData.get('childrenAges') as string || null,
    },
  })

  revalidatePath('/family/profile')
  revalidatePath('/family')
}

export default async function FamilyProfilePage() {
  const session = await getSession()
  if (!session || session.user.role !== 'FAMILY') redirect('/login')

  const profile = await prisma.familyProfile.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Mi perfil familiar</h1>
        <p className="text-stone-500 mt-1 text-sm">
          Esta información nos ayuda a recomendarte las niñeras más adecuadas.
        </p>
      </div>

      {/* Account info (read-only) */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-stone-800 mb-4">Datos de cuenta</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-sm text-stone-500">Nombre</span>
            <span className="text-sm font-medium text-stone-800">{session.user.name}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-stone-500">Correo electrónico</span>
            <span className="text-sm font-medium text-stone-800">{session.user.email}</span>
          </div>
        </div>
      </div>

      {/* Editable profile form */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-stone-800 mb-5">Información del hogar</h2>
        <form action={updateFamilyProfile} className="space-y-5">

          {/* Children count + ages */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Número de niños</label>
              <input
                name="childrenCount"
                type="number"
                min="1"
                max="10"
                className="input"
                defaultValue={profile?.childrenCount ?? 1}
              />
            </div>
            <div>
              <label className="input-label">Edades de los niños</label>
              <input
                name="childrenAges"
                type="text"
                placeholder="Ej: 3, 6, 9"
                className="input"
                defaultValue={profile?.childrenAges ?? ''}
              />
            </div>
          </div>

          {/* Commune */}
          <div>
            <label className="input-label">Comuna</label>
            <select name="commune" className="input" defaultValue={profile?.commune ?? ''}>
              <option value="">Selecciona tu comuna</option>
              {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="input-label">Dirección aproximada</label>
            <input
              name="address"
              type="text"
              placeholder="Av. Providencia 1234, Piso 2"
              className="input"
              defaultValue={profile?.address ?? ''}
            />
            <p className="text-xs text-stone-400 mt-1">
              Solo la compartimos con la niñera una vez que acepte tu solicitud.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="input-label">Teléfono de contacto</label>
            <input
              name="phone"
              type="tel"
              placeholder="+56 9 1234 5678"
              className="input"
              defaultValue={profile?.phone ?? ''}
            />
          </div>

          {/* Preferences */}
          <div>
            <label className="input-label">Preferencias y notas especiales</label>
            <textarea
              name="preferences"
              rows={3}
              placeholder="Ej: Preferimos niñeras con experiencia en bebés, que hablen inglés..."
              className="input resize-none"
              defaultValue={profile?.preferences ?? ''}
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Guardar cambios
          </button>
        </form>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/family/children"
          className="card p-5 flex flex-col items-center gap-2 text-center hover:shadow-md transition-all duration-200"
        >
          <span className="text-3xl">👶</span>
          <div>
            <p className="font-semibold text-stone-800 text-sm">Perfiles de niños</p>
            <p className="text-xs text-stone-400 mt-0.5">Cuéntanos sobre tus hijos</p>
          </div>
        </Link>
        <Link
          href="/family/favorites"
          className="card p-5 flex flex-col items-center gap-2 text-center hover:shadow-md transition-all duration-200"
        >
          <span className="text-3xl">❤️</span>
          <div>
            <p className="font-semibold text-stone-800 text-sm">Mis favoritas</p>
            <p className="text-xs text-stone-400 mt-0.5">Niñeras guardadas</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
