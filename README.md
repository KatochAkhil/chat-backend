# Nexus AI Chat Backend (TypeScript Express)

This folder contains the Express API and Socket.IO real-time server for **Nexus AI Chat**. It handles Google token authentications, Socket.IO channels, MongoDB transactions, Gemini AI prompt completions, and Razorpay signature verification.

---

## 💳 Razorpay Test Payment Card Info
Use the following credentials in the Razorpay Checkout Modal to simulate a successful premium upgrade:

| Field | Value |
| :--- | :--- |
| **Card Number** | `4111 1111 1111 1111` |
| **Expiry Date** | Any future month/year (e.g., `12/30`) |
| **CVV** | `123` |
| **Cardholder Name** | `Test User` |

---

## ⚙️ Environment Configuration (`.env`)
Create a `.env` file inside this directory:

```env
# Server Port
PORT=4000

# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexus-chat?retryWrites=true&w=majority

# JWT Token Secret
JWT_SECRET=supersecret_nexus_jwt_token_secret_key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Gemini AI API Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL (CORS authorization)
FRONTEND_URL=http://localhost:3000
```

---

## 🛠️ Installation & Setup

1. Make sure Node.js `20.x` is active.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. The server runs at [http://localhost:4000](http://localhost:4000).
   - **Swagger Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
   - **OpenAPI Schema (JSON)**: [http://localhost:4000/api/docs.json](http://localhost:4000/api/docs.json)

---

## ⚡ Development Operations

#### Run Type Checks
Verify compile-time type safety:
```bash
npm run type-check
```

#### Run Production Builds
Compile code for production deployment:
```bash
npm run build
```
