# Corp Manager (laptopsetc)

Internal web app for tracking company assets and employee assignments: laptops, other hardware, AI subscriptions, parking permits, and audit history.

Built with **Next.js 16**, **React 19**, **Prisma** (SQLite), **Tailwind CSS**, and **shadcn/ui**.

**User guide:** [HELP.md](HELP.md) — how to use each screen, workflows, and troubleshooting.

## Features

| Module | Description |
|--------|-------------|
| **Employees** | User accounts with roles (`ADMIN` / `EMPLOYEE`) |
| **Laptops** | Laptop register with specs, cost, procurement |
| **Other assets** | Non-laptop hardware register |
| **AI subscriptions** | Plans, tiers, renewals, assignments |
| **Assignments** | Assign / return laptops and AI subscriptions (archived on return) |
| **Parking permits** | Vehicle permits per employee |
| **Audit logs** | Change history (admin only) |
| **Settings** | System configuration (admin only) |

Optional **Gmail notifications** via Nodemailer when credentials are configured.

## Requirements

- Node.js 20+
- npm

## Quick start

```bash
cd C:\Users\sandeep\Downloads\Claudes\laptopsetc

npm install

# Create .env (see Configuration below)
# Then apply schema and seed admin user:
npx prisma generate
npx prisma db push
npx tsx scripts/seed.ts

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

**Default admin** (created by seed script):

| Field | Value |
|-------|--------|
| Email | `admin@company.com` |
| Password | `admin@123` |

Change this password after first login in production.

## Configuration

### `.env`

Create a `.env` file in the project root (not committed — covered by `.gitignore`):

```env
DATABASE_URL="file:./prisma/dev.db"
```

Adjust the path if you keep the SQLite file elsewhere.

### `email_config.json` (optional)

For assignment/notification emails via Gmail. **Do not commit this file** — it is listed in `.gitignore`.

Create `email_config.json` in the project root:

```json
{
  "profiles": {
    "your.email@gmail.com": "your-gmail-app-password"
  }
}
```

Use a [Gmail App Password](https://support.google.com/accounts/answer/185833), not your normal login password.

Alternatively, set environment variables:

```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

`email_config.json` takes precedence when present.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npx prisma studio` | Browse SQLite data in a GUI |
| `npx tsx scripts/seed.ts` | Create default admin user |

## Project structure

```
laptopsetc/
├── prisma/
│   └── schema.prisma      # SQLite data model
├── scripts/
│   └── seed.ts            # Initial admin user
├── src/
│   ├── app/
│   │   ├── actions/       # Server actions (CRUD, auth)
│   │   ├── dashboard/     # Protected admin UI
│   │   └── login/         # Login page
│   ├── components/ui/     # shadcn components
│   └── lib/               # auth, prisma, email, audit
├── email_config.json      # Local only — gitignored
└── .env                   # Local only — gitignored
```

## Git notes

Sensitive files are ignored:

- `.env`
- `email_config.json`

If `email_config.json` was committed earlier, remove it from tracking (keeps the local file):

```bash
git rm --cached email_config.json
```

On Windows, if Git reports **dubious ownership** (folder owned by another user), either fix folder permissions or re-init the repo:

```powershell
Remove-Item -Recurse -Force .git
git init
git config user.name "Your Name"
git config user.email "you@example.com"
```

Use **local** `git config` (no `--global`) per repository when you want a different Git identity.

## Tech stack

- [Next.js](https://nextjs.org/) App Router
- [Prisma](https://www.prisma.io/) + SQLite
- [Tailwind CSS](https://tailwindcss.com/) v4
- [shadcn/ui](https://ui.shadcn.com/)
- [jose](https://github.com/panva/jose) — session JWT in cookies
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — password hashing
- [Nodemailer](https://nodemailer.com/) — optional email

## License

Private — internal use.
