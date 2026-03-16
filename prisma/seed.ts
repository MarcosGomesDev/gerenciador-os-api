import { faker } from '@faker-js/faker/locale/pt_BR';
import {
  Department,
  OrderPriority,
  OrderStatus,
  PrismaClient,
  Role,
  ServiceOrderType,
} from '@prisma/client';
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
  const testUsersPasswordHash = await bcrypt.hash('123', 14);

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

  const departments = Object.values(Department);
  const usedTaxIdentifiers = new Set<string>(['93978425017']);

  const generateUniqueCpf = () => {
    let cpf: string;
    do {
      cpf = faker.string.numeric(11);
    } while (usedTaxIdentifiers.has(cpf));
    usedTaxIdentifiers.add(cpf);
    return cpf;
  };

  const usersToCreate: Role[] = [
    ...Array(10).fill(Role.ADMIN),
    ...Array(20).fill(Role.TECHNICIAN),
    ...Array(40).fill(Role.DEPARTMENT),
  ];

  for (const role of usersToCreate) {
    await prisma.user.create({
      data: {
        id: uuidv4(),
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: testUsersPasswordHash,
        department: departments[Math.floor(Math.random() * departments.length)],
        role,
        taxIdentifier: generateUniqueCpf(),
        isActive: true,
        isFirstAccess: true,
      },
    });
  }

  const allUsers = await prisma.user.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true, department: true, role: true },
  });

  const technicians = allUsers
    .filter((user) => user.role === Role.TECHNICIAN)
    .map((user) => user.id);

  const year = new Date().getFullYear();

  const getRandomDateInMonth = (year: number, monthIndex: number) => {
    const day = faker.number.int({ min: 1, max: 28 });
    const hour = faker.number.int({ min: 0, max: 23 });
    const minute = faker.number.int({ min: 0, max: 59 });
    const second = faker.number.int({ min: 0, max: 59 });
    return new Date(year, monthIndex, day, hour, minute, second);
  };

  const targetCount = 150;
  const months = [0, 1, new Date().getMonth()]; // janeiro, fevereiro e mês atual

  const orderStatuses = Object.values(OrderStatus);
  const orderTypes = Object.values(ServiceOrderType);
  const orderPriorities = Object.values(OrderPriority);

  for (let i = 0; i < targetCount; i++) {
    const user =
      allUsers[faker.number.int({ min: 0, max: allUsers.length - 1 })];

    const monthIndex = months[i % months.length];
    const createdAt = getRandomDateInMonth(year, monthIndex);

    const sequenceNumber = String(i + 1).padStart(3, '0');
    const orderId = `OS-${year}-${sequenceNumber}`;

    const type = orderTypes[i % orderTypes.length];
    const priority = orderPriorities[i % orderPriorities.length];
    const finalStatus = orderStatuses[i % orderStatuses.length];

    const possibleSubjects = [
      'Problema no computador',
      'Erro no sistema de protocolo',
      'Solicitação de acesso ao sistema',
      'Instalação de impressora',
      'Lentidão na rede',
      'Atualização de software',
      'Configuração de e-mail institucional',
      'Suporte a videoconferência',
    ];

    const possibleDescriptions = [
      'O equipamento está apresentando travamentos constantes durante o expediente.',
      'Usuário relata que não consegue acessar o sistema desde ontem à tarde.',
      'Solicitada a criação de novo usuário com perfil de técnico.',
      'Necessário instalar impressora na secretaria para uso compartilhado.',
      'Rede apresenta oscilações e quedas frequentes em determinados horários.',
      'Requer atualização de todos os computadores para a última versão do sistema.',
      'Configuração de e-mail institucional em novo dispositivo do servidor.',
      'Apoio para configuração de reunião online com vários participantes.',
    ];

    const subject =
      possibleSubjects[
        faker.number.int({ min: 0, max: possibleSubjects.length - 1 })
      ];
    const description =
      possibleDescriptions[
        faker.number.int({ min: 0, max: possibleDescriptions.length - 1 })
      ];

    const serviceOrder = await prisma.serviceOrder.create({
      data: {
        id: uuidv4(),
        orderId,
        subject,
        description,
        type,
        status: finalStatus,
        department: user.department,
        requester: user.name,
        priority,
        attachment: null,
        createdAt,
        userId: user.id,
      },
    });

    const statusEntries: { status: OrderStatus; createdAt: Date }[] = [];

    statusEntries.push({ status: OrderStatus.OPEN, createdAt });

    if (
      finalStatus === OrderStatus.IN_PROGRESS ||
      finalStatus === OrderStatus.CLOSED
    ) {
      const inProgressDate = new Date(createdAt.getTime());
      inProgressDate.setHours(
        inProgressDate.getHours() + faker.number.int({ min: 1, max: 24 }),
      );
      statusEntries.push({
        status: OrderStatus.IN_PROGRESS,
        createdAt: inProgressDate,
      });

      if (finalStatus === OrderStatus.CLOSED) {
        const closedDate = new Date(inProgressDate.getTime());
        closedDate.setHours(
          closedDate.getHours() + faker.number.int({ min: 1, max: 48 }),
        );
        statusEntries.push({
          status: OrderStatus.CLOSED,
          createdAt: closedDate,
        });
      }
    }

    for (const statusEntry of statusEntries) {
      // eslint-disable-next-line prefer-const
      let data: any = {
        id: uuidv4(),
        status: statusEntry.status,
        createdAt: statusEntry.createdAt,
        serviceOrder: {
          connect: {
            id: serviceOrder.id,
          },
        },
      };

      if (
        statusEntry.status === OrderStatus.CLOSED ||
        statusEntry.status === OrderStatus.IN_PROGRESS
      ) {
        data.technician = {
          connect: {
            id: technicians[
              faker.number.int({ min: 0, max: technicians.length - 1 })
            ],
          },
        };
        data.note = faker.lorem.sentence();
      }

      await prisma.serviceOrderStatus.create({
        data,
      });
    }
  }

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
