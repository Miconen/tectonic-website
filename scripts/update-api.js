import { execSync } from 'child_process';
import fs from 'fs';

// Load .env if it exists
if (fs.existsSync('.env')) {
    process.loadEnvFile('.env');
}

const apiUrl = process.env.API_OPENAPI_URL;

if (!apiUrl) {
    console.error("Error: API_OPENAPI_URL environment variable is not set.");
    console.error("Please set it in your .env file (e.g., API_OPENAPI_URL=http://localhost:8080/openapi.json).");
    process.exit(1);
}

console.log(`Fetching OpenAPI spec and generating types from ${apiUrl}...`);

try {
    // Run openapi-typescript
    execSync(`npx openapi-typescript ${apiUrl} -o ./src/lib/api/types.gen.ts`, { stdio: 'inherit' });
    console.log("Successfully generated API types.");
} catch (error) {
    console.error("Failed to generate types. Make sure the API is running and accessible.");
    process.exit(1);
}