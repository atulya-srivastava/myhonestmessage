# MyHonestMessage

A secure, anonymous messaging platform with **end-to-end encryption**. Share your honest thoughts without revealing your identity.

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green?style=flat-square&logo=mongodb)


## Features

### End-to-End Encryption
- **Hybrid RSA + AES encryption** — Messages are encrypted client-side before reaching the server
- **Zero-knowledge architecture** — Server never sees plaintext messages
- **Password-protected private keys** with PBKDF2 key derivation (100,000 iterations)
- **Recovery codes** for account recovery without compromising security

### Anonymous Messaging
- Send messages to any registered user without creating an account
- Recipients can only read messages after decrypting with their password
- Toggle message acceptance on/off from the dashboard

### AI-Powered Suggestions
- Get engaging, thought-provoking message suggestions powered by **Google Gemini AI**
- Perfect for when you need conversation starters

### Modern UI/UX
- Beautiful, responsive design with **Tailwind CSS**
- Dark/Light theme support via `next-themes`
- Toast notifications with `sonner`
- Radix UI components for accessibility

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | NextAuth.js |
| **Encryption** | Web Crypto API (RSA-OAEP, AES-GCM, PBKDF2) |
| **Email** | Nodemailer (SMTP / Gmail) |
| **AI** | Vercel AI SDK + Google Gemini |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI, Lucide Icons |
| **Validation** | Zod + React Hook Form |

##  Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **MongoDB** instance (local or MongoDB Atlas)
- **Google AI API key** (for message suggestions)
- **SMTP Email Credentials** (Gmail App Password for Nodemailer)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/myhonestmessage.git
   cd myhonestmessage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://your-connection-string
   
   # NextAuth
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   
   # Email (Nodemailer)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   
   # AI (Google Gemini)
   GOOGLE_GENERATIVE_AI_API_KEY=your-api-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Main app routes
│   │   ├── dashboard/      # User dashboard
│   │   └── page.tsx        # Home page
│   ├── (auth)/             # Authentication routes
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── verify/
│   ├── api/                # API routes
│   │   ├── accept-messages/
│   │   ├── auth/
│   │   ├── check-username-unique/
│   │   ├── delete-message/
│   │   ├── get-encrypted-key/
│   │   ├── get-messages/
│   │   ├── get-public-key/
│   │   ├── send-message/
│   │   ├── sign-up/
│   │   ├── suggest-messages/
│   │   └── verify-code/
│   └── user/               # Public user profile
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── MessageCard.tsx
│   ├── MessageForm.tsx
│   ├── Navbar.tsx
│   └── RecoveryCodeModal.tsx
├── helpers/
│   └── sendEmail.ts        # Nodemailer email helper
├── lib/
│   ├── crypto.ts           # E2E encryption utilities
│   ├── dbConnect.ts        # MongoDB connection
│   └── utils.ts
├── models/
│   └── UserModel.ts        # User & Message schemas
├── schemas/                # Zod validation schemas
└── types/                  # TypeScript types
```

## Security Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Sender       │     │     Server      │     │    Recipient    │
│   (Browser)     │     │   (Next.js)     │     │    (Browser)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  1. Fetch public key  │                       │
         │──────────────────────>│                       │
         │                       │                       │
         │  2. Encrypt message   │                       │
         │     (AES-256-GCM)     │                       │
         │                       │                       │
         │  3. Encrypt AES key   │                       │
         │     (RSA-OAEP-2048)   │                       │
         │                       │                       │
         │  4. Send encrypted    │                       │
         │     payload           │                       │
         │──────────────────────>│  5. Store encrypted  │
         │                       │     (no plaintext)    │
         │                       │                       │
         │                       │  6. Fetch messages    │
         │                       │<──────────────────────│
         │                       │                       │
         │                       │  7. Decrypt with      │
         │                       │     private key       │
         │                       │                       │
```

## The Architecture Flow

<img width="1024" height="1536" alt="image" src="https://github.com/user-attachments/assets/416d0b75-7ae5-4fa9-bc3b-baad50323089" />

### Key Security Features

- **Client-side encryption**: Messages are encrypted in the browser before transmission
- **RSA-2048 + AES-256**: Industry-standard hybrid encryption
- **PBKDF2 key derivation**: 100,000 iterations protect against brute-force attacks
- **Recovery codes**: 16-character codes for account recovery (displayed once)
- **IndexedDB key storage**: Private keys cached locally for session persistence

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request




---

<p align="center">
  Made with <3 for anonymous, secure communication
</p>
