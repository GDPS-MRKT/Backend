import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { readdir, stat, rename } from "node:fs/promises"; 

import { validateEnvironmentVariables, log } from "./utils/functions.js";

import { global } from "./routes/global.js";

await validateEnvironmentVariables();

/*
    ELYSIA SETUP
*/

const app = new Elysia()
    .use(cors());

const routeFiles = await readdir("./routes");
for (const file of routeFiles) {
    if (file.endsWith(".js")) {
        const { default: route } = await import(`./routes/${file}`);
        app.use(route);
    }
}

app.listen(process.env.PORT || 9128, ({ hostname, port }) =>
    log.info(`Server running on http://${hostname}:${port}/`)
);

/*
    UNKNOWN ERRORS CATCHING
*/

process.on("unhandledRejection", async (reason, promise) => {
    log.error(reason.stack || reason);
    // process.exit(1);
});

process.on("uncaughtException", async (error) => {
    log.error(error.stack || error);
    // process.exit(1);
});

/*
    PERIODIC JOBS
*/

// Check if a logs rotation is needed every 5 minutes
setInterval(async () => {
    try {
        // Make sure logs.txt even exists first
        if (await Bun.file("logs.txt").exists()) {
            // Get info about it
            const stats = await stat("logs.txt");

            // If it's older than 6 months, rotate it
            if (Date.now() - stats.mtimeMs > (3 * 31 * 24 * 60 * 60 * 1000)) {
                // If logs.old.txt previously existed, it'll overwrite it
                await rename("logs.txt", "logs.old.txt");
                log.info("Logs rotated!");
            }
        }
    } catch (error) {
        log.error("Failed to rotate logs:", error.stack || error);
    }
}, 300_000);