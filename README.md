# Souls

A minimalistic address book for contacts and the devices they own. React + Vite + Convex + Vercel. Email/password auth. Each user sees only their own data.

## Architecture

- **Frontend:** React 18 + Vite, vanilla CSS (no Tailwind, no UI libraries)
- **Backend:** Convex (serverless database + functions, real-time via WebSocket)
- **Auth:** [Convex Auth](https://labs.convex.dev/auth) with the Password provider
- **Hosting:** Vercel for the frontend; Convex handles the backend
- **Data isolation:** every query/mutation checks `getAuthUserId(ctx)` and filters by `userId`

```
souls/
├── convex/                 # Backend: runs on Convex's servers
│   ├── schema.ts           # Tables: contacts, devices (+ auth tables)
│   ├── auth.ts             # Convex Auth with Password provider
│   ├── auth.config.ts
│   ├── http.ts             # Auth HTTP routes
│   ├── contacts.ts         # Queries + mutations for contacts
│   ├── devices.ts          # Queries + mutations for devices
│   └── users.ts            # Current user query
├── src/                    # Frontend: React app
│   ├── main.jsx            # Entry; wires up ConvexAuthProvider
│   ├── App.jsx             # Auth state router
│   ├── styles.css
│   └── components/
│       ├── AuthScreen.jsx
│       ├── Souls.jsx       # Main app shell
│       ├── ContactList.jsx
│       ├── DeviceList.jsx
│       ├── ContactDetail.jsx
│       ├── ContactForm.jsx
│       ├── DeviceForm.jsx
│       ├── ConfirmDialog.jsx
│       ├── Dialog.jsx
│       └── Toast.jsx
├── public/                 # Static assets, copied as-is to /
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.local.example
└── .gitignore
```

## First-time setup (from a fresh clone)

You'll need:
- Node.js 18+ installed
- A free Convex account at [convex.dev](https://convex.dev)
- A GitHub account
- A free Vercel account at [vercel.com](https://vercel.com)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Convex

This is a one-time command that:
- Prompts you to log in to Convex
- Creates a new Convex project (or lets you pick an existing one)
- Writes your deployment URL to `.env.local`
- Generates the `convex/_generated/` folder
- Starts a dev server that live-pushes your schema and functions

```bash
npx convex dev
```

Leave this running in a terminal — it watches your `convex/` folder and pushes updates automatically. **Every time you change schema or functions, they sync live.**

### 3. Configure the Convex Auth secret

Convex Auth needs some server-side secrets. Run:

```bash
npx @convex-dev/auth
```

This sets `JWT_PRIVATE_KEY` and `JWKS` in your Convex deployment environment. You only need to do this once per deployment (dev + prod).

### 4. Run the frontend

In a second terminal:

```bash
npm run dev
```

Open http://localhost:5173. Create an account, sign in, and start adding contacts.

## Deploying to production

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create souls --public --source=. --push
```

(If you don't have `gh`, create the repo via the GitHub web UI and then
`git remote add origin <url> && git push -u origin main`.)

### 2. Deploy Convex to production

```bash
npx convex deploy
```

This creates a **separate** production deployment (different URL, different database). Note the URL it prints.

Then set the auth secrets on the production deployment:

```bash
npx @convex-dev/auth --prod
```

### 3. Deploy the frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo.
2. Vercel auto-detects Vite.
3. In the project settings, add this environment variable:
   - `VITE_CONVEX_URL` — your Convex **production** URL from step 2
4. Also set the Convex deploy command hook (optional but recommended):
   - In Vercel project settings → Build & Development → Build Command, use:
     ```
     npx convex deploy --cmd 'npm run build'
     ```
     This runs `convex deploy` on every Vercel deploy so your backend and frontend stay in sync.
5. Click Deploy.

### 4. Ongoing deploys

After the initial setup, deploys happen automatically on every `git push` to your main branch. Vercel rebuilds the frontend and pushes the Convex backend together.

## Local development workflow

You need two terminals running in parallel:

```bash
# Terminal 1 — backend in dev mode
npx convex dev

# Terminal 2 — frontend
npm run dev
```

Edits to `convex/*.ts` files are pushed automatically by terminal 1. Edits to `src/**` hot-reload via terminal 2.

## Data model

```
users         (managed by Convex Auth)
  _id
  email
  …

contacts
  _id
  userId       → references users._id
  name
  phone?
  email?
  notes?

devices
  _id
  userId       → references users._id (for fast per-user queries)
  contactId    → references contacts._id (the owner)
  name
  notes?
```

Every document carries a `userId` so the query layer can enforce "you only see your own rows." Deleting a contact cascades to delete all its devices (see `convex/contacts.ts::remove`).

## Security notes

- **Per-user isolation** is enforced on every single query/mutation. There is no way for User A to read User B's contacts, regardless of what the client sends.
- **The `VITE_CONVEX_URL` is public** — it's fine to commit it to your Vercel environment variables. The URL alone doesn't grant access to any data; auth is required for every non-public query.
- Passwords are hashed with Scrypt by Convex Auth. We never see or store raw passwords.
- There's currently no email verification or password reset. Both are straightforward to add later — see the [Convex Auth docs](https://labs.convex.dev/auth/config/passwords).

## Keyboard shortcuts

- `Esc` closes any open dialog

## Limitations & known gaps

- **Online-only.** The app requires an internet connection to read or write data. The PWA shell caches so the app can *open* offline, but all data access hits Convex.
- **No password reset.** You'd have to manually change a password in the Convex dashboard, or add a reset flow (documented in Convex Auth).
- **No email verification.** Users can sign up with any email that matches the format rules.
- **No import/export UI.** You can bulk-export via the Convex dashboard in a pinch.

## License

Do what you want with it.
