import { appendFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Validates required environment variables.
 * Exits the process if validation fails
 * 
 * @returns {void}
 */
export async function validateEnvironmentVariables() {
    let PORT = process.env.PORT;

    if (PORT) {
        PORT = Number(PORT);

        if (!Number.isInteger(PORT)) {
            await log.error("PORT must be a valid integer");
            process.exit(1);
        }

        if (PORT < 1 || PORT > 65535) {
            await log.error("PORT must be between 1 and 65535");
            process.exit(1);
        }
    } else {
        log.warn("No PORT supplied; defaulting to 9128");
    }
}

const LOG_FILE_PATH = join(__dirname, "..", "logs.txt");

export const log = {
    /**
     * Log an error message to the console and append to the log file
     * @param {...any} data - Values to log
     * @returns {Promise<void>}
     **/
    error: async (...data) => {
        const logMessage = `[ERROR] ${data.join(" ")}`;

        await appendFile(LOG_FILE_PATH, `${logMessage}\n`, "utf8");
        console.error("[ERROR]", ...data);
    },

    /**
     * Log a warning message to the console and append to the log file
     * @param {...any} data - Values to log
     * @returns {Promise<void>}
     **/
    warn: async (...data) => {
        const logMessage = `[WARN] ${data.join(" ")}`;

        await appendFile(LOG_FILE_PATH, `${logMessage}\n`, "utf8");
        console.warn("[WARN]", ...data);
    },

    /**
     * Log an informational message to the console and append to the log file
     * @param {...any} data - Values to log
     * @returns {Promise<void>}
     **/
    info: async (...data) => {
        const logMessage = `[INFO] ${data.join(" ")}`;

        await appendFile(LOG_FILE_PATH, `${logMessage}\n`, "utf8");
        console.info("[INFO]", ...data);
    },

    /**
     * Log a debug message to the console and append to the log file
     * @param {...any} data - Values to log
     * @returns {Promise<void>}
     **/
    debug: async (...data) => {
        const logMessage = `[DEBUG] ${data.join(" ")}`;

        await appendFile(LOG_FILE_PATH, `${logMessage}\n`, "utf8");
        console.debug("[DEBUG]", ...data);
    }
};