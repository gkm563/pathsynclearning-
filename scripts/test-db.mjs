import { neon } from '@neondatabase/serverless';
import 'dotenv/config.js'; // load .env
import { config } from 'dotenv';
config({path: '.env.local'});
const sql = neon(process.env.DATABASE_URL);
sql`SELECT count(*) FROM roadmaps`.then(res => console.log('TABLE EXISTS:', res)).catch(e => console.error('TABLE ERROR:', e.message));
