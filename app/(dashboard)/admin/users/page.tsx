import { getAdminUsers } from '@/actions/admin'
import { Avatar } from '@/components/ui/Avatar'
import { RoleBadge, UserStatusBadge } from '@/components/ui/Badges'
import { AdminUserActions } from '@/components/admin/AdminUserActions'

export default async function AdminUsersPage() {
  const users = await getAdminUsers()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Gestión de usuarios</h1>
        <p className="text-stone-500 mt-1 text-sm">{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
              <tr>
                <th className="px-6 py-4 font-medium">Usuario</th>
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Niñera aprobada</th>
                <th className="px-6 py-4 font-medium">Registrado</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                  {/* User info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} image={user.image} size="sm" />
                      <div>
                        <p className="font-medium text-stone-800 text-sm">{user.name}</p>
                        <p className="text-xs text-stone-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <UserStatusBadge status={user.status} />
                  </td>

                  {/* Nanny approval */}
                  <td className="px-6 py-4">
                    {user.role === 'NANNY' ? (
                      user.nannyProfile?.isApproved ? (
                        <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Aprobada</span>
                      ) : (
                        <span className="badge bg-amber-50 text-amber-700 border border-amber-200">Pendiente</span>
                      )
                    ) : (
                      <span className="text-stone-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-stone-500 tabular-nums text-xs">
                    {new Date(user.createdAt).toLocaleDateString('es-CL', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <AdminUserActions user={user} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-16">
            <p className="text-stone-500">No hay usuarios registrados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
