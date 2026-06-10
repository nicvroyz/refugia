import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const hash = (pw: string) => bcrypt.hashSync(pw, 10)

// Commune coordinates (approximate centroids)
const COORDS = {
  Providencia:  { lat: -33.4326, lng: -70.6093 },
  'Las Condes': { lat: -33.4097, lng: -70.5674 },
  'Ñuñoa':      { lat: -33.4569, lng: -70.5981 },
  Santiago:     { lat: -33.4569, lng: -70.6483 },
  Vitacura:     { lat: -33.3927, lng: -70.5780 },
}

async function main() {
  console.log('🌱 Starting seed v2...')

  // ─── Admin ───────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nannyconnect.cl' },
    update: {},
    create: {
      email: 'admin@nannyconnect.cl',
      name: 'Admin NannyConnect',
      passwordHash: hash('Admin1234!'),
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('✅ Admin:', admin.email)

  // ─── Family ───────────────────────────────────────────────────────────────
  const family = await prisma.user.upsert({
    where: { email: 'familia@demo.cl' },
    update: {},
    create: {
      email: 'familia@demo.cl',
      name: 'Familia Martínez',
      passwordHash: hash('Family1234!'),
      role: 'FAMILY',
      status: 'ACTIVE',
    },
  })
  await prisma.familyProfile.upsert({
    where: { userId: family.id },
    update: {},
    create: {
      userId: family.id,
      childrenCount: 2,
      childrenAges: '3, 6',
      commune: 'Providencia',
      lat: COORDS.Providencia.lat,
      lng: COORDS.Providencia.lng,
      phone: '+56 9 1234 5678',
      preferences: 'Buscamos niñera con experiencia en bebés y habilidades en inglés.',
      favoriteNannies: '[]',
    },
  })
  console.log('✅ Family:', family.email)

  // ─── Nanny 1 — TOP_NANNY ─────────────────────────────────────────────────
  const nanny1 = await prisma.user.upsert({
    where: { email: 'nanny1@demo.cl' },
    update: {},
    create: {
      email: 'nanny1@demo.cl',
      name: 'María Rodríguez',
      passwordHash: hash('Nanny1234!'),
      role: 'NANNY',
      status: 'ACTIVE',
    },
  })
  const np1 = await prisma.nannyProfile.upsert({
    where: { userId: nanny1.id },
    update: {
      trustStatus: 'TOP_NANNY', badgeSource: 'AUTO', isApproved: true,
      rating: 4.9, totalReviews: 24, totalServicios: 24, totalHorasTrabajadas: 192,
      identityVerified: true, backgroundCheck: true, certificationsVerified: true, experienceVerified: true,
    },
    create: {
      userId: nanny1.id,
      bio: 'Educadora de párvulos con 8 años de experiencia. Especializada en estimulación temprana y apoyo escolar. Apasionada por el bienestar de los niños.',
      experienceYears: 8,
      commune: 'Providencia',
      lat: COORDS.Providencia.lat + 0.005,
      lng: COORDS.Providencia.lng + 0.003,
      coverageRadiusKm: 8,
      skills: JSON.stringify(['primeros_auxilios', 'rcp', 'ingles', 'tareas', 'bebes']),
      certifications: JSON.stringify(['Educadora de Párvulos', 'RCP AHA', 'Primeros Auxilios Cruz Roja']),
      hourlyRate: 6000,
      hourlyRatePremium: 8000,
      level: 'PREMIUM',
      trustStatus: 'TOP_NANNY',
      badgeSource: 'AUTO',
      isApproved: true,
      isAvailable: true,
      rating: 4.9,
      totalReviews: 24,
      totalServicios: 24,
      totalHorasTrabajadas: 192,
      // Verification checklist — fully verified
      identityVerified: true,
      backgroundCheck: true,
      certificationsVerified: true,
      experienceVerified: true,
    },
  })
  // Availability
  for (const [day, start, end] of [
    ['MONDAY', '08:00', '20:00'], ['TUESDAY', '08:00', '20:00'],
    ['WEDNESDAY', '08:00', '20:00'], ['THURSDAY', '08:00', '20:00'],
    ['FRIDAY', '08:00', '18:00'], ['SATURDAY', '09:00', '14:00'],
  ]) {
    await prisma.nannyAvailability.upsert({
      where: { nannyProfileId_dayOfWeek: { nannyProfileId: np1.id, dayOfWeek: day } },
      update: {},
      create: { nannyProfileId: np1.id, dayOfWeek: day, startTime: start, endTime: end },
    })
  }
  console.log('✅ Nanny 1 (TOP):', nanny1.email)

  // ─── Nanny 2 — VERIFIED ───────────────────────────────────────────────────
  const nanny2 = await prisma.user.upsert({
    where: { email: 'nanny2@demo.cl' },
    update: {},
    create: {
      email: 'nanny2@demo.cl',
      name: 'Catalina Vega',
      passwordHash: hash('Nanny1234!'),
      role: 'NANNY',
      status: 'ACTIVE',
    },
  })
  const np2 = await prisma.nannyProfile.upsert({
    where: { userId: nanny2.id },
    update: {},
    create: {
      userId: nanny2.id,
      bio: 'Niñera con 5 años de experiencia cuidando niños de todas las edades. Paciente, cariñosa y responsable.',
      experienceYears: 5,
      commune: 'Las Condes',
      lat: COORDS['Las Condes'].lat - 0.003,
      lng: COORDS['Las Condes'].lng + 0.004,
      coverageRadiusKm: 6,
      skills: JSON.stringify(['musica', 'artes', 'cocina', 'tareas', 'deporte']),
      certifications: JSON.stringify(['Técnico en Párvulos']),
      hourlyRate: 4000,
      hourlyRatePremium: 5000,
      level: 'EXPERIENCED',
      trustStatus: 'VERIFIED',
      badgeSource: 'AUTO',
      isApproved: true,
      isAvailable: true,
      rating: 4.7,
      totalReviews: 11,
    },
  })
  for (const [day, start, end] of [
    ['MONDAY', '09:00', '19:00'], ['WEDNESDAY', '09:00', '19:00'],
    ['FRIDAY', '09:00', '19:00'], ['SATURDAY', '10:00', '16:00'],
    ['SUNDAY', '10:00', '16:00'],
  ]) {
    await prisma.nannyAvailability.upsert({
      where: { nannyProfileId_dayOfWeek: { nannyProfileId: np2.id, dayOfWeek: day } },
      update: {},
      create: { nannyProfileId: np2.id, dayOfWeek: day, startTime: start, endTime: end },
    })
  }
  console.log('✅ Nanny 2 (VERIFIED):', nanny2.email)

  // ─── Nanny 3 — PENDING ────────────────────────────────────────────────────
  const nanny3 = await prisma.user.upsert({
    where: { email: 'nanny3@demo.cl' },
    update: {},
    create: {
      email: 'nanny3@demo.cl',
      name: 'Andrea Silva',
      passwordHash: hash('Nanny1234!'),
      role: 'NANNY',
      status: 'ACTIVE',
    },
  })
  await prisma.nannyProfile.upsert({
    where: { userId: nanny3.id },
    update: {},
    create: {
      userId: nanny3.id,
      bio: 'Recién titulada como Técnico en Párvulos. Con mucho amor y ganas de aprender.',
      experienceYears: 1,
      commune: 'Ñuñoa',
      lat: COORDS['Ñuñoa'].lat + 0.002,
      lng: COORDS['Ñuñoa'].lng - 0.003,
      coverageRadiusKm: 4,
      skills: JSON.stringify(['bebes', 'artes', 'cocina']),
      certifications: JSON.stringify(['Técnico en Párvulos']),
      hourlyRate: 3000,
      level: 'BASIC',
      trustStatus: 'PENDING_REVIEW',
      badgeSource: 'AUTO',
      isApproved: false,
      isAvailable: true,
      rating: 0,
      totalReviews: 0,
    },
  })
  console.log('✅ Nanny 3 (PENDING):', nanny3.email)

  // ─── Demo booking + review ────────────────────────────────────────────────
  const booking = await prisma.bookingRequest.upsert({
    where: { id: 'demo-booking-001' },
    update: {},
    create: {
      id: 'demo-booking-001',
      familyId: family.id,
      nannyProfileId: np1.id,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      startTime: '09:00',
      endTime: '17:00',
      address: 'Providencia',
      lat: COORDS.Providencia.lat,
      lng: COORDS.Providencia.lng,
      serviceType: 'OCCASIONAL',
      childrenCount: 2,
      childrenAges: '3, 6',
      isUrgent: false,
      isRecurrent: false,
      finalRate: 9500,
      totalAmount: 76000,
      status: 'COMPLETED',
    },
  })

  await prisma.review.upsert({
    where: { bookingId: booking.id },
    update: {},
    create: {
      bookingId: booking.id,
      fromUserId: family.id,
      toUserId: nanny1.id,
      rating: 5,
      punctuality: 5,
      kindness: 5,
      reliability: 5,
      comment: 'María fue increíble. Mis hijos quedaron encantados. La recontratamos sin duda.',
    },
  })

  console.log('✅ Demo booking + review created')
  console.log('\n🎉 Seed v2 completed!')
  console.log('━'.repeat(42))
  console.log('Admin:   admin@nannyconnect.cl / Admin1234!')
  console.log('Familia: familia@demo.cl / Family1234!')
  console.log('Niñera:  nanny1@demo.cl  / Nanny1234!')
  console.log('━'.repeat(42))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
