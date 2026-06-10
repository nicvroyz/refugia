// Type aliases matching the String fields in SQLite schema
// In production with PostgreSQL, these would be native Prisma enums

export type Role = 'ADMIN' | 'FAMILY' | 'NANNY'
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING_REVIEW'
export type BookingStatus =
  | 'PENDING_PAYMENT'   // Created, awaiting payment
  | 'PENDING'           // Legacy / fallback
  | 'REQUESTED'         // Payment confirmed, sent to nanny
  | 'IN_CHAT'           // Nanny has opened the chat
  | 'ACCEPTED'          // Nanny accepted
  | 'REJECTED'          // Nanny rejected
  | 'CANCELLED'         // Family cancelled (> 24h)
  | 'CANCELLED_LATE'    // Family cancelled (< 24h)
  | 'COMPLETED'         // Service finished
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
