// Quick fix script — sets verification fields on nanny1 (María Rodríguez)
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function main() {
  const result = await db.nannyProfile.updateMany({
    where: { user: { email: 'nanny1@demo.cl' } },
    data: {
      identityVerified: true,
      backgroundCheck: true,
      certificationsVerified: true,
      experienceVerified: true,
      totalHorasTrabajadas: 192,
      totalServicios: 24,
    },
  })
  console.log('Updated:', result.count, 'profiles')

  // Also partially verify nanny2
  await db.nannyProfile.updateMany({
    where: { user: { email: 'nanny2@demo.cl' } },
    data: { identityVerified: true, backgroundCheck: true },
  })
  console.log('nanny2 partial verification set')
}

main().catch(console.error).finally(() => db.$disconnect())
