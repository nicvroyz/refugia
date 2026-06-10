import type { BookingStatus, UserStatus, Role } from '@/lib/types'

const BOOKING_MAP: Record<BookingStatus, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: 'Pago pendiente', cls: 'badge bg-orange-50 text-orange-700 border border-orange-200' },
  PENDING:         { label: 'Pendiente',       cls: 'badge-pending' },
  REQUESTED:       { label: 'Solicitada',      cls: 'badge bg-sky-50 text-sky-700 border border-sky-200' },
  IN_CHAT:         { label: 'En chat',          cls: 'badge bg-violet-50 text-violet-700 border border-violet-200' },
  ACCEPTED:        { label: 'Aceptada',         cls: 'badge-accepted' },
  REJECTED:        { label: 'Rechazada',        cls: 'badge-rejected' },
  CANCELLED:       { label: 'Cancelada',        cls: 'badge-cancelled' },
  CANCELLED_LATE:  { label: 'Cancelación tardía', cls: 'badge bg-red-50 text-red-700 border border-red-200' },
  COMPLETED:       { label: 'Completada',       cls: 'badge-completed' },
}

export function StatusBadge({ status }: { status: BookingStatus | string }) {
  const map = BOOKING_MAP[status as BookingStatus]
  if (!map) return <span className="badge bg-stone-100 text-stone-500">{status}</span>
  return <span className={map.cls}>{map.label}</span>
}

const USER_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ACTIVE:         { label: 'Activo',            cls: 'badge bg-emerald-50 text-emerald-700 border border-emerald-200' },
  BLOCKED:        { label: 'Bloqueado',          cls: 'badge bg-red-50 text-red-700 border border-red-200' },
  PENDING_REVIEW: { label: 'Revisión pendiente', cls: 'badge bg-amber-50 text-amber-700 border border-amber-200' },
}

export function UserStatusBadge({ status }: { status: string }) {
  const map = USER_STATUS_MAP[status] ?? { label: status, cls: 'badge bg-stone-100 text-stone-500' }
  return <span className={map.cls}>{map.label}</span>
}

const ROLE_MAP: Record<string, { label: string; cls: string }> = {
  ADMIN:  { label: 'Admin',   cls: 'badge bg-violet-50 text-violet-700 border border-violet-200' },
  FAMILY: { label: 'Familia', cls: 'badge bg-sky-50 text-sky-700 border border-sky-200' },
  NANNY:  { label: 'Niñera',  cls: 'badge bg-pink-50 text-pink-700 border border-pink-200' },
}

export function RoleBadge({ role }: { role: string }) {
  const map = ROLE_MAP[role] ?? { label: role, cls: 'badge bg-stone-100 text-stone-500' }
  return <span className={map.cls}>{map.label}</span>
}
