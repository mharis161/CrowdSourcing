import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20) || 'MISSING');

function runPrismaCommand(command) {
  try {
    console.log(`\n--- Running: ${command} ---`);
    execSync(command, { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log(`\n--- ${command} Success ---`);
    return true;
  } catch (error) {
    console.error(`\n--- ${command} Failed ---`);
    return false;
  }
}

// 1. Generate client
const genSuccess = runPrismaCommand('npx prisma generate');

// 2. Local DB push
if (genSuccess) {
  runPrismaCommand('npx prisma db push --accept-data-loss');
}
