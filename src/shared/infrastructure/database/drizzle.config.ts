import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: 'src/shared/infrastructure/database/drizzle',
    schema: 'src/shared/infrastructure/database/schema/**/*.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});