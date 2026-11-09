# BizManager Shop — Paystack setup (test mode first)

This integration adds Paystack-hosted checkout to the existing checkout page. The server calculates prices from Firestore, initializes Paystack, verifies the transaction on the server, checks the amount and currency, and only then marks the order paid and deducts stock. Cash on Delivery, existing Mobile Money, and Bank Transfer options remain available.

## Important Firebase Spark limitation

Your project is on Firebase Spark. Firebase Cloud Functions deployment requires the Blaze plan, so this package uses the existing `backend/server.js` as a separate Node.js web service. You can deploy it to a Node-capable host. This is separate from Firebase and does not require changing the shop's Firebase project. The host must support HTTPS and environment variables.

## 1. Get Paystack test keys

1. Sign in to your Paystack Dashboard.
2. Switch to **Test Mode**.
3. Open **Settings → API Keys & Webhooks** (menu wording may vary).
4. Copy the **test secret key** (starts with `sk_test_`). Keep it private. Never put it in `checkout.js`, HTML, GitHub, or a public file.

Official docs: https://paystack.com/docs/developer-tools/api-keys/

## 2. Deploy the backend

Deploy the `backend` folder as a Node.js web service using `backend/package.json` and `backend/server.js` as the start point. Set these environment variables in the host dashboard:

- `PAYSTACK_SECRET_KEY`: your `sk_test_...` key
- `FRONTEND_URL`: the full HTTPS origin of your hosted shop (for example `https://your-domain.com`, no trailing slash)
- `BACKEND_PUBLIC_URL`: the full HTTPS origin of the deployed backend, no trailing slash
- `ALLOWED_ORIGINS`: same shop origin as `FRONTEND_URL`; add a comma-separated local origin only while testing locally
- `FIREBASE_SERVICE_ACCOUNT_JSON`: the complete Firebase service-account JSON as a single-line JSON value

To obtain the service-account JSON: Firebase Console → Project settings → Service accounts → Generate new private key. Store it only as a private environment variable on the backend host. Do not upload it to your website or commit it to source control. Anyone holding this file can access your Firebase project with its granted permissions.

Once deployed, open `https://YOUR-BACKEND-DOMAIN/health`. It should return JSON with `ok: true`.

## 3. Connect the shop to the backend

Open `checkout.js` and find:

`const PAYSTACK_BACKEND_URL = "https://YOUR-BACKEND-DOMAIN.example.com";`

Replace the placeholder with the exact deployed backend HTTPS URL, with no trailing slash. Upload the updated `checkout.js` and `checkout.html` with the rest of the existing site.

## 4. Configure Paystack webhook

In Paystack Test Mode → Settings / Developers → Webhooks, set the webhook URL to:

`https://YOUR-BACKEND-DOMAIN/api/paystack/webhook`

The callback URL is supplied automatically by the backend during transaction initialization.

## 5. Test carefully

1. Use Paystack test mode only; do not use live keys yet.
2. Place a low-value test order using a product that has stock.
3. Complete a test transaction using the current test details in Paystack's official documentation.
4. Confirm the browser returns to `checkout.html?payment=success...`.
5. In Firestore → `orders`, check `paymentStatus: "paid"`, `status: "Processing"`, `stockDeducted: true`, and `paystack.reference`.
6. Check that the product's `stock` and `quantity` fields decreased once, not twice.
7. Also test cancelled/failed payment. It must not be marked paid or deduct stock.

Paystack docs: https://paystack.com/docs/api/transaction/ and https://paystack.com/docs/payments/verify-payments/

## Notes / security

- Do not accept a total or product price from the browser; the backend looks up current product prices in Firestore.
- Payment confirmation is based on the server-side Verify API, not the browser redirect alone.
- This integration assumes product documents are in `products` and have a numeric `price` or `sellingPrice` and `stock` or `quantity` field, consistent with the current checkout code.
- The backend's Firebase Admin SDK bypasses Firestore rules, so protect its service-account JSON and backend host account.
- A rare edge case can occur if payment succeeds after stock has been bought by someone else. The backend will refuse to mark that order as fulfilled and log the problem for manual review; refund or resolution would then be required.
- Use live keys only after test transactions and production-domain checks succeed.
