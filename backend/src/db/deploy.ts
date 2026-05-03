import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const SCHEMA_FILE = path.join(__dirname, '../../..', 'database', 'schema.sql');
const MIGRATIONS_DIR = path.join(__dirname, '../../..', 'database', 'migrations');

async function runMigrations(client: Client): Promise<void> {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log(' No migrations directory found');
    return;
  }

  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log(' No migrations found');
    return;
  }

  console.log(`\n Running ${migrationFiles.length} migration(s)...`);
  
  for (const file of migrationFiles) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    console.log(`  Executing ${file}...`);
    
    try {
      const migration = fs.readFileSync(filePath, 'utf-8');
      await client.query(migration);
      console.log(`  ✓ ${file} completed`);
    } catch (error: any) {
      // Check if table already exists (common case for task_shares)
      if (error.message.includes('already exists')) {
        console.log(`  ⚠ ${file} - table or index already exists (skipping)`);
      } else {
        throw error;
      }
    }
  }
}

async function deploySchema(): Promise<void> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log(' Connecting to Neon...');
    await client.connect();
    console.log(' Connected to Neon successfully!');

    console.log(' Reading schema.sql...');
    const schema = fs.readFileSync(SCHEMA_FILE, 'utf-8');

    console.log(' Executing schema...');
    await client.query(schema);

    console.log('✓ Schema deployed to Neon successfully!');
    console.log(' Tables created:');
    console.log('  - users');
    console.log('  - tasks');

    // Run migrations
    await runMigrations(client);

    console.log('\n✓ Database setup complete!');
  } catch (error) {
    console.error('Error occurred:');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

deploySchema();
