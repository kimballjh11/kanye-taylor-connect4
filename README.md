# Kanye vs Taylor Connect 4

A humorous local two-player Connect 4 game for Kimball Hansen's class assignment. Player 1 is Kanye West; Player 2 is Taylor Swift. Pieces are original stylized SVG avatars (not album art).

## How to run locally

```bash
cd ~/Desktop/kanye-taylor-connect4
npm install
npm run dev
```

Open **[http://127.0.0.1:43127](http://127.0.0.1:43127)**.

Production build:

```bash
npm run build
npm run preview   # http://127.0.0.1:43128
```

## How to play

1. Two players share one device. **Kanye goes first.**
2. Click a column arrow (1–7) — or the column itself — to drop your face into the lowest open slot.
3. Get **four in a row** (horizontal, vertical, or diagonal) to win.
4. If the board fills with no winner, it's a draw.
5. Use **New game** to reset.

### Unique feature: Grammy Flex

Once per player, per game, right after you place a piece you can tap **Grammy Flex**. That triggers a short confetti burst and a trophy flash on the piece you just dropped. It is **purely cosmetic** — it does not change rules, block columns, or affect who wins. You can **Skip flex** to continue immediately.

## Public deploy

`npm run build` outputs static files in `dist/`.

### Option A — Netlify Drop (no account CLI needed)

1. Run `npm run build`.
2. Open [https://app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag the `dist` folder onto the page.
4. Copy the public URL Netlify gives you into `Canvas_Submission.docx`.

### Option B — Vercel

```bash
npx vercel --prod
```

### Option C — GitHub Pages

Push this folder to a GitHub repo, enable Pages from the `dist` folder (or use a GitHub Action that runs `npm run build`).

If a live public URL is not available yet, play locally at the URL above and note “pending deploy” on the Canvas submission.

## Project layout

- `src/game.ts` — Connect 4 rules + Grammy Flex state
- `src/main.ts` — UI and interactions
- `src/style.css` — layout and animations
- `public/kanye.svg`, `public/taylor.svg` — original stylized face assets
- `Canvas_Submission.docx` — Canvas write-up

## Stack

Vite + TypeScript (vanilla DOM). No framework required.
