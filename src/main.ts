import './style.css'
import {
  COLS,
  ROWS,
  PLAYER_LABEL,
  applyGrammyFlex,
  canGrammyFlex,
  createGame,
  dropPiece,
  type GameState,
  type Player,
} from './game'

const AVATARS: Record<Player, string> = {
  kanye: '/kanye.svg',
  taylor: '/taylor.svg',
}

let state: GameState = createGame()
/** After a drop, the player who just moved can flex before continuing */
let flexWindowPlayer: Player | null = null

const app = document.querySelector<HTMLDivElement>('#app')!

function columnButtonsHtml(flexAvailable: boolean): string {
  return Array.from({ length: COLS }, (_, c) => {
    const full = state.board[0][c] !== null
    const locked = !!(state.winner || state.draw || flexAvailable)
    const disabled = full || locked ? 'disabled' : ''
    return `<button type="button" class="col-btn" data-col="${c}" ${disabled} aria-label="Drop in column ${c + 1}">↓ ${c + 1}</button>`
  }).join('')
}

function boardHtml(): string {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      const cell = state.board[r][c]
      const key = `${c},${r}`
      const isWin = state.winningLine?.some((p) => p.col === c && p.row === r)
      const flexed = state.flexed.has(key)
      const piece = cell
        ? `<div class="piece ${cell} ${flexed ? 'flexed' : ''}" aria-label="${PLAYER_LABEL[cell]}"></div>`
        : ''
      return `<div class="cell ${isWin ? 'winner' : ''}" role="gridcell" data-col="${c}" data-row="${r}">${piece}</div>`
    }).join(''),
  ).join('')
}

function render() {
  const flexPlayer = flexWindowPlayer
  const flexAvailable = flexPlayer !== null && canGrammyFlex(state, flexPlayer)

  let message = ''
  let messageClass = 'message'
  if (state.winner) {
    message = `${PLAYER_LABEL[state.winner]} connects 4 — legendary!`
    messageClass += ' win'
  } else if (state.draw) {
    message = 'Draw — the feud continues another day.'
    messageClass += ' draw'
  } else if (flexAvailable) {
    message = `${PLAYER_LABEL[flexPlayer!]} can Grammy Flex (optional) or skip.`
  } else {
    message = `${PLAYER_LABEL[state.current]}'s turn — drop a piece.`
  }

  const turnPlayer =
    state.winner || state.draw
      ? (state.winner ?? state.current)
      : flexAvailable
        ? flexPlayer!
        : state.current

  const statusLabel = state.winner
    ? 'Winner'
    : state.draw
      ? 'Draw'
      : flexAvailable
        ? 'Flex window'
        : 'Now playing'

  app.innerHTML = `
    <header class="site-header">
      <h1>Kanye vs Taylor Connect 4</h1>
      <p class="tagline">Local two-player showdown. Same device. Zero streaming royalties required.</p>
    </header>

    <div class="layout">
      <section>
        <div class="status-bar">
          <div class="turn-pill ${turnPlayer}">
            <img src="${AVATARS[turnPlayer]}" alt="" />
            <span>${statusLabel}: ${PLAYER_LABEL[turnPlayer]}</span>
          </div>
          <div class="${messageClass}">${message}</div>
        </div>

        <div class="controls">
          <button type="button" class="btn-grammy ${flexAvailable ? 'ready' : ''}" id="btn-grammy" ${flexAvailable ? '' : 'disabled'}>
            Grammy Flex
          </button>
          <button type="button" class="btn-secondary" id="btn-skip-flex" ${flexAvailable ? '' : 'disabled'}>
            Skip flex
          </button>
          <button type="button" class="btn-primary" id="btn-restart">New game</button>
        </div>

        <div class="board-wrap" id="board-wrap">
          <div class="flex-banner" id="flex-banner">GRAMMY FLEX!</div>
          <div class="column-hitboxes">
            ${columnButtonsHtml(flexAvailable)}
          </div>
          <div class="board" role="grid" aria-label="Connect 4 board">
            ${boardHtml()}
          </div>
        </div>

        <div class="legend">
          <span class="legend-item"><img src="${AVATARS.kanye}" alt="" /> Player 1 — Kanye</span>
          <span class="legend-item"><img src="${AVATARS.taylor}" alt="" /> Player 2 — Taylor</span>
        </div>
        <p class="grammy-status">
          Grammy Flex left — Kanye: ${state.grammyUsed.kanye ? 'used' : 'available'} · Taylor: ${state.grammyUsed.taylor ? 'used' : 'available'}
        </p>
      </section>

      <aside class="side-stack">
        <div class="panel">
          <h2>How to play</h2>
          <ol>
            <li>Players take turns on the same device. Kanye goes first.</li>
            <li>Click a column arrow (1–7) to drop your face into the lowest open slot.</li>
            <li>Get <strong style="color:#f4f0e8">four in a row</strong> — horizontal, vertical, or diagonal — to win.</li>
            <li>If the board fills with no four-in-a-row, it's a draw.</li>
            <li>Hit <strong style="color:#f4f0e8">New game</strong> anytime to reset.</li>
          </ol>
        </div>
        <div class="panel">
          <h2>Unique feature</h2>
          <div class="unique-callout">
            <strong>Grammy Flex</strong>
            Once per player, per game: right after you place a piece, tap <em>Grammy Flex</em> for a short confetti + trophy flash on that piece. Purely cosmetic — it does not change the board, block moves, or help you win. Skip it if you're feeling humble.
          </div>
        </div>
      </aside>
    </div>
    <div class="confetti-layer" id="confetti" aria-hidden="true"></div>
  `

  document.getElementById('btn-restart')?.addEventListener('click', () => {
    state = createGame()
    flexWindowPlayer = null
    render()
  })

  document.getElementById('btn-skip-flex')?.addEventListener('click', () => {
    endFlexWindow()
  })

  document.getElementById('btn-grammy')?.addEventListener('click', () => {
    if (!flexWindowPlayer) return
    const next = applyGrammyFlex(state, flexWindowPlayer)
    if (!next) return
    state = next
    burstConfetti()
    showFlexBanner()
    endFlexWindow()
  })

  document.querySelectorAll<HTMLButtonElement>('.col-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      playColumn(Number(btn.dataset.col))
    })
  })

  document.querySelectorAll<HTMLDivElement>('.cell').forEach((cell) => {
    cell.addEventListener('click', () => {
      if (state.winner || state.draw || flexWindowPlayer) return
      playColumn(Number(cell.dataset.col))
    })
  })
}

function playColumn(col: number) {
  if (flexWindowPlayer) return
  const mover = state.current
  const next = dropPiece(state, col)
  if (!next) return
  state = next
  flexWindowPlayer = canGrammyFlex(state, mover) ? mover : null
  render()
}

function endFlexWindow() {
  flexWindowPlayer = null
  render()
}

function showFlexBanner() {
  requestAnimationFrame(() => {
    const banner = document.getElementById('flex-banner')
    if (!banner) return
    banner.classList.remove('show')
    void banner.offsetWidth
    banner.classList.add('show')
  })
}

function burstConfetti() {
  const layer = document.getElementById('confetti')
  if (!layer) return
  const colors = ['#f5d76e', '#e8b4c8', '#fff', '#3dd68c', '#ff6b6b', '#7ec8ff']
  for (let i = 0; i < 48; i++) {
    const el = document.createElement('div')
    el.className = 'confetti'
    el.style.left = `${Math.random() * 100}%`
    el.style.background = colors[i % colors.length]
    el.style.animationDuration = `${1.4 + Math.random() * 1.6}s`
    el.style.animationDelay = `${Math.random() * 0.25}s`
    el.style.transform = `rotate(${Math.random() * 360}deg)`
    layer.appendChild(el)
    window.setTimeout(() => el.remove(), 3200)
  }
}

render()
