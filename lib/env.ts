// Serverless deploys (Vercel) mount the bundle at /var/task read-only: opening
// the DB writable — even just to set `journal_mode = WAL` — throws
// "attempt to write a readonly database". So there the app runs read-only:
// nobody gets admin, nothing writes.
//
// Roadmap edits happen locally (npm run dev), then `npm run db:pack` + git push
// ships the updated data/roadmap.db with the next deploy.
//
// Auto-detected so a missing env var can't take prod down. ROADMAP_READONLY=1
// forces it on for local testing of the deployed behaviour.
export const READ_ONLY = process.env.ROADMAP_READONLY === "1" || !!process.env.VERCEL;
