# Corp Manager — User Help Guide

Step-by-step help for **Corp Manager** (laptopsetc): logging in, managing employees, registering assets, assignments, and admin tools.

For installation and developer setup, see [README.md](README.md).

---

## Table of contents

1. [Signing in](#signing-in)
2. [Navigation overview](#navigation-overview)
3. [User roles](#user-roles)
4. [Employees](#employees)
5. [Laptops register](#laptops-register)
6. [Other assets](#other-assets)
7. [Assignments (hardware)](#assignments-hardware)
8. [AI subscriptions](#ai-subscriptions)
9. [Parking permits](#parking-permits)
10. [Audit logs (admin)](#audit-logs-admin)
11. [Settings (admin)](#settings-admin)
12. [Common workflows](#common-workflows)
13. [Exporting data](#exporting-data)
14. [Email notifications](#email-notifications)
15. [Troubleshooting](#troubleshooting)
16. [FAQ](#faq)

---

## Signing in

1. Open the app (default: [http://localhost:3000](http://localhost:3000)).
2. You are redirected to **Login** if not signed in.
3. Enter your **email** and **password**.
4. Click **Sign In**.

**First-time setup (admin only):** After running the seed script, use:

| Email | Password |
|-------|----------|
| `admin@company.com` | `admin@123` |

Change the admin password in production.

**Session:** You stay logged in for **24 hours**. Use **Log out** in the sidebar footer to end your session.

**Errors:** `Invalid credentials` means the email or password does not match any employee record.

---

## Navigation overview

After login you land on **Dashboard**. The left sidebar includes:

| Menu item | Purpose |
|-----------|---------|
| **Dashboard** | Overview (summary cards) |
| **Employees** | People who can log in and receive assets |
| **Laptops Register** | Company laptops (asset type `LAPTOP`) |
| **Other Assets** | Phones, monitors, etc. (non-laptop hardware) |
| **AI Subscriptions** | ChatGPT, Copilot, and similar plans |
| **Assignments** | Assign or return laptops and other hardware |
| **Parking Permits** | Office parking permits per employee |

**Administration** (visible only to `ADMIN` role):

| Menu item | Purpose |
|-----------|---------|
| **Audit Logs** | Who changed what and when |
| **Settings** | Security toggles |

---

## User roles

| Role | Access |
|------|--------|
| **ADMIN** | Full access including Audit Logs and Settings |
| **EMPLOYEE** | Standard dashboard access (no Audit / Settings) |

Set role when adding or editing an employee.

---

## Employees

**Path:** Sidebar → **Employees**

### Add an employee

1. Click **Add Employee**.
2. Fill in:
   - **Name**
   - **Email** (used to log in — must be unique)
   - **Role** — `EMPLOYEE` or `ADMIN`
   - **Slack ID** (optional)
   - **Mobile number** (optional)
   - **Remarks** (optional)
3. Click **Save**.

**Default password for new employees:** `password123`  
Share this with the employee and ask them to change it when password self-service is enabled (see Settings).

### Edit or delete

- **Pencil icon** — update details (password is not changed here).
- **Trash icon** — permanently remove the employee (confirm in dialog).

### Search and export

- Use the search box to filter by name or email.
- **Export** downloads `employees.csv`.

---

## Laptops register

**Path:** Sidebar → **Laptops Register**

Use this to record laptops **before** assigning them to people.

### Register a laptop

1. Click **Register Laptop**.
2. Typical fields:
   - **Asset ID / Tag** — your internal label (e.g. `LAP-042`)
   - **Model** — e.g. `Dell Latitude 5540`
   - **Serial number**
   - **RAM / Storage / OS**
   - **Procurement** — `COMPANY_PURCHASE` or `BYOD` (Bring Your Own Device)
   - **Cost (INR / EUR)** — optional
   - **Remarks**
3. Click **Save**.

### Edit or delete

- **Pencil** — update specs or costs.
- **Trash** — remove from register (only if not actively assigned; delete blocked if in use).

### Search and export

- Search by model, serial, or asset tag.
- **Export** → `laptops_register.csv`.

---

## Other assets

**Path:** Sidebar → **Other Assets**

Same idea as laptops, but for **non-laptop** hardware (phones, tablets, monitors, etc.).

### Register an asset

1. Click **Add Asset** (or equivalent add button).
2. Choose **Asset type** (e.g. `MOBILE`, `MONITOR`).
3. Enter model, serial/IMEI, description, procurement, costs, remarks.
4. Save.

Assignments for these assets are done from **Assignments** (same flow as laptops).

---

## Assignments (hardware)

**Path:** Sidebar → **Assignments**

Shows **all hardware assets** (laptops + other) and whether each is **In Office** or **With Employee**.

### Assign an asset to an employee

1. Find an asset with status **In Office**.
2. Click **Assign** (transfer icon).
3. Select **Employee**.
4. Add optional **Remarks** (e.g. condition, charger included).
5. Confirm.

**Rules:**

- One asset can only be assigned to **one employee** at a time.
- If already assigned, you must **Return** it first.

**Email:** If Gmail is configured (`email_config.json`), the employee receives a notification email.

### Return an asset

1. Find an asset with status **With Employee**.
2. Click **Return**.
3. Add return remarks (optional) — e.g. damage notes, missing adapter.
4. Confirm.

The assignment moves to **archive** history (not shown on the main assignments table, but recorded in the database and audit log).

### Export

**Export** → `asset_assignments.csv` with status, assignee, and dates.

---

## AI subscriptions

**Path:** Sidebar → **AI Subscriptions**

Track company-paid AI tools (plans, renewal dates, costs) and who uses each seat.

### Add a subscription

1. Click **Add Subscription** (or **Register**).
2. Fill in:
   - **Subscription name** — e.g. `ChatGPT Team`
   - **Plan identifier / Tier**
   - **URL** — billing or admin portal link
   - **Renewal date**
   - **Cost (INR / EUR)**
   - **Procurement source** — e.g. company card
   - **Remarks**
3. Save.

### Assign a subscription to an employee

1. Open the row actions for a subscription.
2. Click **Assign** (users icon).
3. Pick employee and optional remarks.
4. Confirm.

### Unassign

When someone no longer needs the seat, use **Unassign**. The record is archived with dates for audit.

### Export

**Export** → `ai_subscriptions_register.csv`.

---

## Parking permits

**Path:** Sidebar → **Parking Permits**

### Add a permit

1. Click **Add Permit**.
2. Select **Employee**.
3. Enter **Permit number**, **Vehicle type** (e.g. Car / Bike), **Issue date**, optional **End date**, **Remarks**.
4. Save.

### Edit or archive

- **Pencil** — update dates or permit number.
- **Archive** — close an expired or cancelled permit (moves to archive, removed from active list).

### Export

**Export** → `parking_permits.csv`.

---

## Audit logs (admin)

**Path:** Sidebar → **Audit Logs** (ADMIN only)

Every create, update, and delete in major modules is logged here.

| Column | Meaning |
|--------|---------|
| **Timestamp** | When the change happened |
| **Action** | `INSERT`, `UPDATE`, or `DELETE` |
| **Module (Table)** | e.g. `Employee`, `Asset`, `AssetAssignment` |
| **User** | Who made the change |
| **Details** | Eye icon — view old vs new JSON snapshot |

Use **Export Logs** for `audit_logs.csv`.

---

## Settings (admin)

**Path:** Sidebar → **Settings** (ADMIN only)

### Allow password changes

Toggle **Allow Password Changes**:

- **On** — users can change their own password from the portal (when that UI is available).
- **Off** — only admins manage credentials manually.

---

## Common workflows

### New joiner — laptop + AI tool

1. **Employees** → Add employee (note default password `password123`).
2. **Laptops Register** → Register laptop if not already in system.
3. **Assignments** → Assign laptop to employee.
4. **AI Subscriptions** → Assign an available AI seat if needed.
5. **Parking Permits** → Add permit if applicable.

### Employee leaving — return equipment

1. **Assignments** → **Return** all assigned hardware.
2. **AI Subscriptions** → **Unassign** AI seats.
3. **Parking Permits** → **Archive** permit.
4. Optionally **Employees** → delete or update remarks (do not delete if audit history must stay linked).

### Monthly audit

1. **Assignments** → Export CSV — verify who has what.
2. **AI Subscriptions** → Check renewal dates.
3. **Audit Logs** → Spot unexpected changes.

---

## Exporting data

Most list pages have an **Export** button (download icon). Files are CSV and open in Excel or Google Sheets.

| Page | Download filename |
|------|-------------------|
| Employees | `employees.csv` |
| Laptops | `laptops_register.csv` |
| Other assets | `other_assets_register.csv` |
| Assignments | `asset_assignments.csv` |
| AI subscriptions | `ai_subscriptions_register.csv` |
| Parking | `parking_permits.csv` |
| Audit logs | `audit_logs.csv` |

---

## Email notifications

When `email_config.json` or `EMAIL_USER` / `EMAIL_PASS` is configured, the system sends **non-blocking** Gmail notifications for:

- **Hardware assignment** — employee receives model and serial details.

If email is not configured, assignments still work; a warning is written to the server log only.

See [README.md](README.md) for Gmail App Password setup.

---

## Troubleshooting

### Cannot log in

- Confirm the employee exists under **Employees**.
- Check email spelling.
- Default passwords: admin seed uses `admin@123`; new employees use `password123`.
- Clear browser cookies for the site and try again.

### “Asset is already assigned”

Return the asset from **Assignments** before assigning it to someone else.

### Export button does nothing

Allow downloads in your browser; check pop-up blockers.

### Email not received

- Verify `email_config.json` exists locally (not in git).
- Use a Gmail **App Password**, not the normal account password.
- Check spam folder.
- Email failures do not block the assignment — check server console logs.

### Page redirects to login constantly

Session expired (24 h) or cookies blocked. Log in again.

### Database empty after clone

Run setup from README:

```bash
npx prisma db push
npx tsx scripts/seed.ts
```

---

## FAQ

**Q: Can one employee have multiple laptops?**  
A: Each asset row supports one active assignment. Register multiple assets and assign each separately.

**Q: Can I import CSV instead of manual entry?**  
A: Not built in yet — use **Add** dialogs or bulk-load via Prisma/scripts.

**Q: Where is data stored?**  
A: Locally in SQLite (`DATABASE_URL` in `.env`, typically `prisma/dev.db`).

**Q: Who can see Audit Logs?**  
A: Only users with role `ADMIN`.

**Q: What happens when I delete an employee?**  
A: The record is removed; related assignments should be returned/archived first to avoid orphaned data.

**Q: Is this app on the internet?**  
A: By default it runs on your machine (`npm run dev`). Deploy separately if you need remote access.

---

## Getting more help

- **Setup / install issues** → [README.md](README.md)
- **Data model reference** → `prisma/schema.prisma`
- **Default admin creation** → `scripts/seed.ts`
