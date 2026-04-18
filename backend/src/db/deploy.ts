import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const SCHEMA_FILE = path.join(__dirname, '../../..', 'database', 'schema.sql');

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

    console.log('Schema deployed to Neon successfully!');
    console.log(' Tables created:');
    console.log('  - users');
    console.log('  - tasks');
    console.log('\n Database setup complete!');
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
