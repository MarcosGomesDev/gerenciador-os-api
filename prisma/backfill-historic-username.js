const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function columnExists(table, column) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${table}
        AND column_name = ${column}
    ) AS "exists"
  `;

  return Boolean(rows[0]?.exists);
}

async function main() {
  const hasUserId = await columnExists('historics', 'user_id');
  const hasUsername = await columnExists('historics', 'username');

  if (!hasUsername) {
    console.log('Coluna username não existe. Adicionando...');
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "historics" ADD COLUMN "username" TEXT',
    );
  }

  if (!hasUserId) {
    const [{ total, withUsername }] = await prisma.$queryRaw`
      SELECT
        COUNT(*)::bigint AS total,
        COUNT(username)::bigint AS "withUsername"
      FROM historics
    `;

    console.log(
      'Coluna user_id já não existe. Migration provavelmente já aplicada.',
    );
    console.log(`Total de históricos: ${total}`);
    console.log(`Com username preenchido: ${withUsername}`);
    return;
  }

  const before = await prisma.$queryRaw`
    SELECT
      COUNT(*)::bigint AS total,
      COUNT(*) FILTER (WHERE username IS NULL OR username = '')::bigint AS "withoutUsername"
    FROM historics
  `;

  console.log(`Históricos totais: ${before[0].total}`);
  console.log(`Sem username: ${before[0].withoutUsername}`);

  const updated = await prisma.$executeRaw`
    UPDATE historics AS h
    SET username = u.name
    FROM users AS u
    WHERE h.user_id = u.id
      AND (h.username IS NULL OR h.username = '')
  `;

  const orphaned = await prisma.$queryRaw`
    SELECT COUNT(*)::bigint AS count
    FROM historics
    WHERE user_id IS NOT NULL
      AND (username IS NULL OR username = '')
  `;

  console.log(`Históricos atualizados com username: ${updated}`);
  console.log(
    `Históricos com user_id sem usuário correspondente: ${orphaned[0].count}`,
  );
  console.log(
    'Pronto. Se ainda não rodou a migration, execute: npm run db:deploy',
  );
}

main()
  .catch((error) => {
    console.error('Falha no backfill de historic.username:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
