import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/features/legal-shield/db/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('Seeding users...');
  
  const testUsers = [
    {
      name: 'Admin User',
      email: 'admin@factory.ai',
      password: 'admin123',
      isVerified: true,
    },
    {
      name: 'Ricardo G.',
      email: 'ricardo@gmail.com',
      password: 'ricardo123',
      isVerified: true,
    },
    {
      name: 'Startup CEO',
      email: 'ceo@startup.io',
      password: 'ceo123',
      isVerified: true,
    }
  ];

  for (const user of testUsers) {
    try {
      await db.insert(schema.users).values(user).onConflictDoNothing();
      console.log(`User ${user.email} seeded.`);
    } catch (e) {
      console.error(`Error seeding ${user.email}:`, e);
    }
  }

  console.log('Seed completed.');
}

seed().catch(console.error);
