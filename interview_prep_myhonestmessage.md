# MyHonestMessage — Interview Prep Guide

## Should You Add This Project to Your Resume?

**Yes, absolutely.** Here's why:
- It demonstrates **applied cryptography** — not just using a library, but designing an entire key lifecycle (generation → wrapping → storage → recovery)
- It shows **security-first thinking** — zero-knowledge architecture is a real-world concept (Signal, ProtonMail use it)
- It combines multiple domains: crypto, full-stack, AI, auth — shows breadth
- It's a complete, deployed product, not a tutorial clone

---

## Likely Interview Questions & How to Answer

### 🔐 Encryption & Cryptography

#### Q1: "Walk me through how a message gets encrypted and delivered."
**Answer using your actual flow:**
1. Sender visits `/user/{username}` (no auth required)
2. Page fetches recipient's **public key** via `GET /api/get-public-key`
3. Client generates a random **AES-256-GCM** key for this specific message
4. Message is encrypted with the AES key
5. The AES key itself is encrypted with recipient's **RSA-OAEP 2048-bit** public key
6. Three pieces are sent to server: `encryptedContent`, `encryptedAESKey`, `iv`
7. Server stores them as-is — **never sees plaintext**
8. Recipient unlocks with password → PBKDF2 derives key → unwraps private key → RSA decrypts AES key → AES decrypts message

> [!TIP]
> This is the **most important question**. Practice this flow until you can whiteboard it in 2 minutes.

#### Q2: "Why hybrid encryption? Why not just RSA for everything?"
**Answer:**
- RSA can only encrypt data smaller than the key size (2048 bits ≈ 245 bytes max for OAEP)
- Messages can be arbitrarily long → AES has no size limit
- AES-GCM is also **much faster** than RSA for bulk data
- This is the same pattern used by TLS, PGP, Signal Protocol

#### Q3: "Why PBKDF2 with 100K iterations? Why not bcrypt or Argon2?"
**Answer:**
- PBKDF2 is natively supported by the **Web Crypto API** — no external libraries needed
- bcrypt/Argon2 aren't available in the browser's Web Crypto API
- 100K iterations is OWASP's recommended minimum for PBKDF2-HMAC-SHA256
- The tradeoff: Argon2 is memory-hard (better against GPU attacks), but isn't available in Web Crypto API without a WASM build

> [!IMPORTANT]
> If asked "would you change this in production?", say: "I'd consider Argon2 via a WASM build for stronger resistance against GPU/ASIC attacks, but PBKDF2 at 100K iterations meets OWASP standards and keeps the bundle size small."

#### Q4: "How does the recovery code system work?"
**Answer:**
- During sign-up, the private key is wrapped **twice**: once with the user's password, once with a randomly generated recovery code
- Both `encryptedPrivateKey` and `recoveryWrappedKey` are stored server-side
- Recovery code format: `XXXX-XXXX-XXXX-XXXX` (excludes confusing chars like 0/O/I/1)
- If user forgets password, they enter the recovery code to unwrap the same private key
- The server never knows the recovery code — it only stores the already-wrapped key

#### Q5: "Where is the private key stored on the client? What happens on page refresh?"
**Answer:**
- After unlocking, the `CryptoKey` object is stored in **IndexedDB** (scoped per user ID)
- IndexedDB persists across page refreshes but is cleared when the browser is closed
- User can manually "Lock" messages which calls `clearStoredPrivateKey()` to wipe IndexedDB
- The raw private key never touches `localStorage` (which is string-only and accessible to XSS)

---

### 🏗️ Architecture & Design

#### Q6: "What does 'zero-knowledge' mean in your architecture?"
**Answer:**
- The server **never** has access to:
  - Plaintext messages
  - The user's private key (only the password-wrapped version)
  - The user's password in the context of encryption (bcrypt hash is stored for auth, but the encryption password derivation happens client-side)
- Even if the database is breached, the attacker gets only ciphertext and wrapped keys — useless without passwords

#### Q7: "What happens if your server is compromised?"
**Answer:**
- Attacker gets: encrypted messages, wrapped private keys, public keys, bcrypt-hashed passwords
- They **cannot** read messages without each user's password (PBKDF2 100K iterations)
- They **could** serve malicious JavaScript that captures passwords on login → this is the main threat model weakness of any browser-based E2E system
- Mitigation: Content Security Policy headers, Subresource Integrity, code audits

> [!WARNING]
> This is a known limitation of **all** browser-based E2E encryption (including ProtonMail). Be honest about it. Interviewers respect honesty over hand-waving.

#### Q8: "Why did you embed messages inside the User document instead of a separate collection?"
**Answer:**
- Simpler query pattern — one `findById` gets user + all messages
- MongoDB's 16MB document limit is the tradeoff
- For a messaging platform at scale, I'd move to a separate `Messages` collection with indexing on `recipientId` and `createdAt`

#### Q9: "How does auth work? How is the auth password different from the encryption password?"
**Answer:**
- Auth uses **NextAuth.js** with credentials provider — password is **bcrypt**-hashed server-side for login
- Encryption uses the **same password** but derived client-side via **PBKDF2** into an AES wrapping key
- These are two completely separate derivations — the server's bcrypt hash can't be used to unwrap the private key

---

### 🎨 Frontend & UX

#### Q10: "How do you handle the UX of encryption — doesn't it add friction?"
**Answer:**
- On first login after a session, user sees a "Unlock Messages" modal
- After unlocking, the key is cached in IndexedDB → no re-entry on refresh
- "Lock" button lets security-conscious users manually clear the key
- Encrypting indicator shows "Encrypting..." → "Sending..." for transparency
- Senders see a shield badge: "End-to-end encrypted • Only @username can read your message"

#### Q11: "Why Zod for validation?"
**Answer:**
- Type-safe schema validation shared between client (react-hook-form) and server
- `zodResolver` integrates directly with react-hook-form for instant client-side validation
- Same schemas can be reused for API request validation

---

### 🤖 AI Integration

#### Q12: "How does the Gemini integration work? Why not OpenAI?"
**Answer:**
- Uses Vercel AI SDK (`@ai-sdk/google`) with `gemini-2.5-flash`
- Generates 3 open-ended anonymous questions separated by `||`
- `temperature: 0.8, topP: 0.9, topK: 40` for diverse but coherent suggestions
- Why Gemini: Cost-effective, fast inference, and the `ai` SDK makes switching models trivial (OpenAI is also in `package.json` as a fallback)

---

## 🔄 Key Tradeoffs to Discuss

| Decision | Tradeoff | What You'd Change at Scale |
|---|---|---|
| **PBKDF2 over Argon2** | Web Crypto API compatibility vs. GPU resistance | Argon2 via WASM if bundle size allows |
| **Messages embedded in User doc** | Simple reads vs. 16MB doc limit | Separate `Messages` collection with indexes |
| **IndexedDB for key caching** | Persists across refreshes vs. XSS exposure risk | Web Workers + Content Security Policy |
| **RSA-2048** | Good performance vs. 4096 being more future-proof | RSA-4096 or ECDH (smaller keys, same security) |
| **Client-side encryption in browser** | No native app needed vs. server can serve malicious JS | Desktop app or browser extension for critical use |
| **No rate limiting on send-message** | Simpler code vs. spam vulnerability | Redis-based rate limiting per IP |
| **Public key served via API** | Convenient vs. no key verification (TOFU) | Key fingerprint verification or key transparency log |
| **Single-device key access** | Simpler key management vs. can't read on multiple devices | Key sync protocol or re-wrapping for multiple devices |

---

## ⚠️ Known Weaknesses (Be Ready for These)

### 1. Middleware has a bug
```typescript
// middleware.ts line 14
url.pathname.startsWith('/')  // This matches EVERYTHING
```
This means any authenticated user visiting ANY path gets redirected to `/dashboard`. The `/user/[username]` page still works because it's not in the matcher config, but this is a bug worth acknowledging.

### 2. No rate limiting
The `send-message` API has no rate limiting — an attacker could spam a user's inbox. You should mention you'd add Redis + sliding window rate limiting.

### 3. No message size limit
The API doesn't enforce max message size. An attacker could send very large encrypted payloads.

### 4. Trust on First Use (TOFU)
There's no way for senders to verify the public key belongs to the actual user. A compromised server could swap public keys (MITM). Mention that key transparency or fingerprint verification would fix this.

### 5. No forward secrecy
All messages are encrypted with the same RSA key pair. If the private key is compromised, all past messages are readable. Signal Protocol uses ratcheting for forward secrecy — mention this as an improvement.

---

## 💡 Bonus: Questions YOU Can Ask the Interviewer

If they ask "what would you improve?", these show depth:

1. "I'd add **forward secrecy** using a Double Ratchet protocol so that compromising one key doesn't expose historical messages"
2. "I'd implement **key transparency logs** so senders can verify they have the authentic public key"
3. "I'd add **message expiry** — encrypted messages auto-delete after N days to reduce exposure surface"
4. "I'd move to **ECDH (Curve25519)** for key exchange — smaller keys, equivalent security to RSA-3072"
5. "I'd add **CSP headers and SRI** to mitigate the browser-served-JS attack vector"

---

## Summary: Your Talking Points Cheat Sheet

1. **"Why this project?"** → "I wanted to understand how apps like Signal handle E2E encryption, so I built one from scratch using Web Crypto API"
2. **"Hardest part?"** → "Designing the key lifecycle — generation, wrapping, storage, recovery — while keeping the server zero-knowledge"
3. **"What would you change?"** → Pick 2-3 from the tradeoffs table above
4. **"How does it compare to Signal?"** → "Similar hybrid encryption concept, but Signal adds forward secrecy via Double Ratchet and has a native app which eliminates the malicious-JS attack vector"
