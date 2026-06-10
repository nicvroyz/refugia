const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.nannyProfile.updateMany({
    where: { level: 'PREMIUM' },
    data: { hourlyRate: 6000, hourlyRatePremium: 8000 }
  })
  
  await prisma.nannyProfile.updateMany({
    where: { level: 'EXPERIENCED' },
    data: { hourlyRate: 4000, hourlyRatePremium: 5000 }
  })

  await prisma.nannyProfile.updateMany({
    where: { level: 'BASIC' },
    data: { hourlyRate: 3000, hourlyRatePremium: null }
  })

  console.log('Tarifas actualizadas en la base de datos (Min: 3000).')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
