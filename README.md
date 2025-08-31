<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1RQGhonswnVxkIaWJVIzkC4FDMb2nbNKu

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend

This repository now ships with a Cloudflare Worker backend (see [`worker/`](worker/)) which uses **D1** for configuration storage and **R2** for object storage. To run it locally:

1. `cd worker`
2. `npm install`
3. Initialize the database: `wrangler d1 execute HRIS_DB --file ./schema.sql`
4. Start the worker: `npm run dev`

The frontend expects the worker base URL (for example, `http://127.0.0.1:8787`) in the `VITE_API_BASE_URL` environment variable. Set it in `.env.local` before running `npm run dev`.

## Production configuration

Configure environment values for the worker without exposing secrets to the client.

1. Add non-sensitive variables such as `WAHA_ENDPOINT` and `WAHA_SESSION_NAME` in `worker/wrangler.toml` under `[vars]`.
2. Store sensitive tokens using Wrangler secrets:

   ```bash
   cd worker
   wrangler secret put WAHA_API_KEY
   ```

3. The worker exposes `GET /api/config/status` to verify that configuration values exist without revealing them.
