import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPendingPayouts, getServiceFee } from '@/actions/admin'
import { PayoutButton } from '@/components/admin/PayoutButton'
import { FeeSettings } from '@/components/admin/FeeSettings'

export const metadata = { title: 'Pagos a Niñeras | Admin' }

export default async function AdminPayoutsPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const payouts = await getPendingPayouts()
  const totalPending = payouts.reduce((acc, p) => acc + p.totalAmount, 0)
  const currentFee = await getServiceFee()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Pagos a Niñeras (Semanal)</h1>
        <p className="text-muted mt-1">Revisa el historial de ganancias de las niñeras y marca los pagos realizados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-violet-600 to-brand-700 text-white shadow-md">
          <p className="text-white/80 text-sm font-medium">Total Pendiente a Pagar</p>
          <p className="text-4xl font-bold mt-2">${totalPending.toLocaleString('es-CL')}</p>
        </div>
        
        <div className="md:col-span-2">
          <FeeSettings currentFee={currentFee} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
              <tr>
                <th className="px-6 py-4 font-medium">Niñera</th>
                <th className="px-6 py-4 font-medium">Email / Contacto</th>
                <th className="px-6 py-4 font-medium">Monto a Pagar</th>
                <th className="px-6 py-4 font-medium">Servicios (IDs)</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                    No hay pagos pendientes. Todas las niñeras están al día.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.nannyId} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-stone-800">{p.nannyName}</td>
                    <td className="px-6 py-4 text-stone-500">{p.nannyEmail}</td>
                    <td className="px-6 py-4 font-bold text-violet-700">
                      ${p.totalAmount.toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4 text-stone-400 text-xs">
                      {p.paymentIds.length} servicio(s)
                    </td>
                    <td className="px-6 py-4 text-right">
                      <PayoutButton paymentIds={p.paymentIds} amount={p.totalAmount} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
