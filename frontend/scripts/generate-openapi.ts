import { execSync } from 'child_process';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM 방식으로 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local을 명시적으로 읽음
config({ path: path.resolve(__dirname, '../.env.local') });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not set in .env.local');
}

const command = `openapi-generator-cli generate -i ${apiBaseUrl}/v3/api-docs -g typescript-fetch -o src/generated-api --skip-validate-spec`;

execSync(command, { stdio: 'inherit' });
