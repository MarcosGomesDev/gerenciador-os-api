import { Department, PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const alreadySeeded = await prisma.seedStatus.findUnique({
    where: { id: 'main-seed' },
  });

  if (alreadySeeded) {
    console.log('Banco de dados já foi seedado. Abortando seed.');
    return;
  }

  const hashedPassword = await bcrypt.hash('V9!rK#4pT@7zL$2qX8mF', 14);

  await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      department:
        Department.SECRETARIA_MUNICIPAL_DE_CIENCIA_TECNOLOGIA_E_INOVACAO,
      role: Role.ADMIN,
      taxIdentifier: '93978425017',
      isActive: true,
      isFirstAccess: false,
    },
  });

  await prisma.seedStatus.create({
    data: { id: 'main-seed', executedAt: new Date() },
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
