import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  role: z.enum(['FAMILY', 'NANNY'], { required_error: 'Selecciona un rol' }),
})

export const bookingRequestSchema = z.object({
  nannyProfileId: z.string().min(1),
  date: z.string().min(1, 'Fecha requerida'),
  startTime: z.string().min(1, 'Hora inicio requerida'),
  endTime: z.string().min(1, 'Hora fin requerida'),
  address: z.string().min(5, 'Dirección requerida'),
  comment: z.string().optional(),
})

export const nannyProfileSchema = z.object({
  bio: z.string().min(20, 'Escribe al menos 20 caracteres sobre ti').optional(),
  experienceYears: z.coerce.number().min(0).max(50),
  hourlyRate: z.coerce.number().min(1000, 'Tarifa mínima $1.000').max(100000),
  commune: z.string().min(2, 'Indica tu comuna'),
  certifications: z.string().optional(),
  languages: z.string().optional(),
  photoUrl: z.string().url('URL de foto inválida').optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
})

export const availabilitySchema = z.object({
  availability: z.array(
    z.object({
      dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
      startTime: z.string(),
      endTime: z.string(),
      enabled: z.boolean(),
    })
  ),
})

export const updateUserStatusSchema = z.object({
  userId: z.string(),
  status: z.enum(['ACTIVE', 'BLOCKED', 'PENDING_REVIEW']),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>
export type NannyProfileInput = z.infer<typeof nannyProfileSchema>
