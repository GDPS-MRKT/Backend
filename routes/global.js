import { Elysia } from "elysia";
import { RegexCheck } from "../utils/security.js";
import { Database } from "../utils/database.js";
import { log } from "../utils/functions.js";

export const global = new Elysia({ prefix: "/api/v1" })
    .get("/search", async ({ query: { query, page, per }, status }) => {
        try {
            // Make sure "page" & "per" are supplied (mandatory)
            if (!page || !per)
                return status(400, { error: "global.missing_parameters", pages: null, gdps: [] });

            // If query is supplied, make sure its not possible to SQL inject with it
            if (query && !RegexCheck.name(query))
                return status(400, { error: "search.bad_query", pages: null, gdps: [] });

            page = parseInt(page);
            per = parseInt(per);

            // Validate numbers after conversion and make sure they are positive
            if (!Number.isInteger(page) || !Number.isInteger(per) || page < 0 || per < 0)
                return status(400, { error: "global.bad_parameters", pages: null, gdps: [] });

            // Only allow up to 100 GDPSs to be displayed per request
            if (per > 100)
                return status(400, { error: "global.bad_per", pages: null, gdps: [] });

            return {
                error: "",
                ...await Database.searchGdps(query, page, per)
            };
        } catch (error) {
            log.error(`GET /api/v1/search failed:`, error.stack || error);
            return status(500, { error: "global.error", pages: null, gdps: [] });
        }
    })

export default global;