// Script to update nanny profile photos with local avatar images
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Get all nanny profiles with their user names
  const nannies = await prisma.nannyProfile.findMany({
    include: { user: { select: { name: true } } }
  })

  const photoMap = {
    'María Rodríguez': '/avatars/maria.png',
    'Andrea Muñoz': '/avatars/andrea.png',
    'Catalina Soto': '/avatars/catalina.png',
    'Carmen López': '/avatars/carmen.png',
  }

  for (const nanny of nannies) {
    const photo = photoMap[nanny.user.name]
    if (photo) {
      await prisma.nannyProfile.update({
        where: { id: nanny.id },
        data: { photoUrl: photo }
      })
      console.log(`✅ Updated ${nanny.user.name} → ${photo}`)
    } else {
      console.log(`⚠️  No photo mapping for ${nanny.user.name}`)
    }
  }

  console.log('\nDone!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
