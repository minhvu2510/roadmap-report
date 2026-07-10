// Deployed (public) mode: nobody gets admin, so nothing ever writes the DB.
// Roadmap edits happen locally; the updated .db file ships with the deploy.
// Kept in its own module so lib/db.ts doesn't have to import next/headers.
export const READ_ONLY = process.env.ROADMAP_READONLY === "1";
