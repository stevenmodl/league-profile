# League of Legends Profile Dashboard

A personal LoL profile dashboard built with **Next.js 15**, **TypeScript**, **Prisma**, and **SQLite**. Features static account profiles with real-time Riot API data, rank tracking, match history, and champion statistics.

## Features

- 📊 **Rank Tracking** - Current rank with LP, wins/losses, and win rate
- 📈 **Rank History Graph** - Visual LP progression over time
- 🎮 **Champion Statistics** - Top played champions with performance metrics
- ⚔️ **Recent Matches** - Last 10 matches with detailed stats
- 🔄 **ISR (Incremental Static Regeneration)** - Auto-refresh every 10 minutes
- 🗄️ **SQLite Database** - Local data persistence with Prisma ORM
- ⚡ **Rate Limiting** - Built-in Riot API rate limiter

## Tech Stack

- **Next.js 15** (App Router, Server Components, ISR)
- **TypeScript** (Strict mode)
- **Prisma + SQLite** (Database & ORM)
- **Riot API** (League of Legends data)
- **Tailwind CSS** (Styling)
- **Recharts** (Data visualization)

## Setup

### 1. Prerequisites

- Node.js 18+ or Yarn
- A Riot Games API key ([get one here](https://developer.riotgames.com/))

### 2. Install Dependencies

```bash
yarn install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
RIOT_TOKEN=your_riot_api_token_here
REVALIDATE_SECRET=your_random_secret_here
```

### 4. Configure Your Accounts

Edit [`lib/accounts.ts`](lib/accounts.ts) to add your League accounts:

```typescript
export const ACCOUNTS: Account[] = [
  { slug: "my-main", gameName: "YourName", tagLine: "EUW", platform: "euw1" },
  { slug: "smurf", gameName: "AnotherName", tagLine: "NA1", platform: "na1" }
];
```

**Supported platforms:** `euw1`, `eun1`, `na1`, `kr`, `br1`, `jp1`, `oc1`, `tr1`, `ru`, `la1`, `la2`

### 5. Initialize Database

```bash
yarn db:push
```

### 6. Seed Data

Fetch initial data from Riot API (resolves PUUIDs, fetches ranks & matches):

```bash
yarn seed
```

**Note:** The seed process may take a few minutes due to rate limiting.

### 7. Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view your dashboard.

## Project Structure

```
app/
  (profiles)/
    [slug]/page.tsx              # Profile page (RSC with ISR)
    components/
      AccountSwitcher.tsx        # Client component for switching accounts
  api/
    revalidate/route.ts          # On-demand revalidation endpoint
  page.tsx                       # Landing page with account dropdown
lib/
  accounts.ts                    # Static accounts configuration
  riot.ts                        # Riot API client with rate limiting
  repo.ts                        # Prisma repository functions
  mapping.ts                     # Helper functions (platform→region, etc.)
  types.ts                       # Shared TypeScript types
components/
  rank-card.tsx                  # Current rank display
  history-graph.tsx              # LP history chart
  champion-stats.tsx             # Top champions grid
  recent-matches.tsx             # Recent matches list
prisma/
  schema.prisma                  # Database schema
  dev.db                         # SQLite database (gitignored)
scripts/
  seed.ts                        # Data seeding script
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn seed` | Fetch & seed data from Riot API |
| `yarn db:push` | Push schema changes to database |
| `yarn db:studio` | Open Prisma Studio (database GUI) |
| `yarn prisma:generate` | Regenerate Prisma Client |

## Data Refresh

### Automatic (ISR)
- Profile pages automatically revalidate every **10 minutes**
- Controlled by `export const revalidate = 600` in [`app/(profiles)/[slug]/page.tsx`](app/(profiles)/[slug]/page.tsx)

### Manual (On-Demand)
Trigger revalidation via API:

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your_revalidate_secret","slug":"my-main"}'
```

### Re-seed Fresh Data
Run the seed script again to fetch the latest data:

```bash
yarn seed
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables (`RIOT_TOKEN`, `REVALIDATE_SECRET`)
4. Deploy!

**Note:** SQLite works on Vercel but data won't persist between deployments. For production, consider using PostgreSQL or another hosted database.

### Other Platforms

Standard Next.js deployment applies. Ensure:
- Environment variables are set
- Database is accessible (consider Postgres for production)
- Run `yarn seed` after deployment to populate data

## Customization

### Add More Accounts
Edit [`lib/accounts.ts`](lib/accounts.ts) and run `yarn seed`

### Change Revalidation Interval
Edit `revalidate` value in [`app/(profiles)/[slug]/page.tsx`](app/(profiles)/[slug]/page.tsx)

### Adjust Rate Limiting
Modify the `RateLimiter` in [`lib/riot.ts`](lib/riot.ts)

### Styling
All components use Tailwind CSS and are in the [`components/`](components/) directory

## Troubleshooting

### "RIOT_TOKEN not set" warning
- Ensure `.env` file exists with `RIOT_TOKEN=your_token`
- Restart dev server after adding `.env`

### Rate limit errors during seed
- Normal behavior, the script will wait and retry
- Consider reducing account count or increasing delays

### No data showing on profile
- Run `yarn seed` to fetch initial data
- Check that account gameName/tagLine match exactly (case-sensitive)
- Verify RIOT_TOKEN is valid

### Build errors about Prisma
- Run `yarn prisma:generate`
- Ensure `prisma/dev.db` exists (`yarn db:push`)

## License

MIT