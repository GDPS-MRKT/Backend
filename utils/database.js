import { SQL } from "bun";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { log } from "./functions";

const migrationsPath = join(__dirname, "..", "migrations");

/*
    DATABASE INITIALIZATION
*/

if (!process.env.DATABASE_URL) {
    await log.error("DATABASE_URL must be supplied");
    process.exit(1);
}

let sql;

(async () => {
    try {
        sql = new SQL(process.env.DATABASE_URL);

        await sql`
            CREATE TABLE IF NOT EXISTS migrations (
                date VARCHAR(10) NOT NULL UNIQUE,
                createdOn BIGINT NOT NULL,
                PRIMARY KEY(date)
            )
        `;

        const files = readdirSync(migrationsPath);
        const sqlFiles = files.filter(file => file.endsWith(".sql"));

        sqlFiles.sort((a, b) => {
            const dateA = a.substring(0, 10);
            const dateB = b.substring(0, 10);
            const [dayA, monthA, yearA] = dateA.split("-").map(Number);
            const [dayB, monthB, yearB] = dateB.split("-").map(Number);
            return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
        });

        let completedMigrations = 0;

        for (const file of sqlFiles) {
            const migrationDate = file.substring(0, 10);
            const rows = await sql`SELECT 1 FROM migrations WHERE date = ${migrationDate}`;
            if (rows.length === 0) {
                try {
                    await sql.file(join(migrationsPath, file))
                    await sql`INSERT INTO migrations (date, createdOn) VALUES (${migrationDate}, ${Date.now()})`;
                    completedMigrations += 1;
                } catch (error) {
                    log.warn(`Skipped migration ${file}: ${error}`);
                }
            }
        }

        if (completedMigrations > 0) {
            log.info(`Successfully ran ${completedMigrations} database migrations`);
        }

        log.info("Connected to the database");
    } catch (error) {
        await log.error("Error while initializing the database:", error);
        process.exit(1);
    }
})();

/*
    DATABASE METHODS
*/

export const Database = {
    searchGdps: async (query, page, per_page) => {
        const offset = page * per_page;
        const pattern = query ? `%${query}%` : '%';

        const [gdps, [{ count }]] = await Promise.all([
            sql`
                SELECT id, name, description, owner, logo, banner
                FROM gdps
                WHERE name ILIKE ${pattern}
                ORDER BY id DESC
                LIMIT ${per_page} OFFSET ${offset}
            `,
            sql`
                SELECT COUNT(*)::int as count
                FROM gdps
                WHERE name ILIKE ${pattern}
            `
        ]);

        const total_pages = Math.ceil(count / per_page);

        return { pages: total_pages, gdps }
    }
};