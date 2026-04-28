require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({
  connectionString,
});

const prismaClientSingleton = () => new PrismaClient({ adapter });

if (!global.prismaGlobal) {
  global.prismaGlobal = prismaClientSingleton();
}

module.exports = global.prismaGlobal;
