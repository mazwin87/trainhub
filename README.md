# TrainHub Malaysia 🇲🇾
### Malaysia's HRDF Trainer Directory Platform

---

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + CSS Design Tokens
- **UI**: shadcn/ui components
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel
- **Email**: Resend

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-org/trainhub-malaysia.git
cd trainhub-malaysia

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL, keys, etc.

# 4. Generate Supabase types
npm run db:types

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
trainhub/
├── app/                    # Next.js routes (App Router)
│   ├── (public)/           # Public pages (SSG/ISR)
│   ├── (trainer)/          # Trainer dashboard (auth required)
│   └── (admin)/            # Admin panel (admin role required)
├── features/               # Business logic by domain
│   ├── trainers/           # Trainer profiles, cards, hooks
│   ├── search/             # Search bar, filters
│   ├── inquiries/          # Inquiry form, inbox
│   └── auth/               # Login, register, session
├── components/ui/          # Shared primitive components
├── lib/
│   ├── supabase/           # Supabase clients
│   └── utils/              # Helper functions
├── styles/
│   ├── tokens.css          # ← ALL design tokens here
│   └── globals.css         # Global styles using tokens
└── types/                  # Shared TypeScript types
```

---

## Changing the Theme

All colours, fonts, and spacing live in **one file**:

```
styles/tokens.css
```

To change the accent colour from amber to navy:
```css
--color-accent: #0f2044;  /* just change this line */
```

The entire site updates — no component hunting needed.

---

## Deployment

Push to `main` → Vercel auto-deploys.

```bash
# Check types before pushing
npm run type-check

# Check lint
npm run lint
```
