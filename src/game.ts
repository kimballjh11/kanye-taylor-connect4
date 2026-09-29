export type Player = 'kanye' | 'taylor'
export type Cell = Player | null

export const COLS = 7
export const ROWS = 6

export interface GameState {
  board: Cell[][]
  current: Player
  winner: Player | null
  draw: boolean
  /** column,row of the last placed piece */
  lastMove: { col: number; row: number } | null
  grammyUsed: Record<Player, boolean>
  /** cells that have been Grammy Flex'd (cosmetic) */
  flexed: Set<string>
  winningLine: Array<{ col: number; row: number }> | null
}

export function createEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))
}

export function createGame(): GameState {
  return {
    board: createEmptyBoard(),
    current: 'kanye',
    winner: null,
    draw: false,
    lastMove: null,
    grammyUsed: { kanye: false, taylor: false },
    flexed: new Set(),
    winningLine: null,
  }
}

export function dropPiece(state: GameState, col: number): GameState | null {
  if (state.winner || state.draw) return null
  if (col < 0 || col >= COLS) return null
  if (state.board[0][col] !== null) return null

  const board = state.board.map((row) => [...row])
  let row = -1
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) {
      board[r][col] = state.current
      row = r
      break
    }
  }
  if (row < 0) return null

  const line = findWinningLine(board, col, row, state.current)
  const winner = line ? state.current : null
  const draw = !winner && board.every((r) => r.every((c) => c !== null))

  return {
    ...state,
    board,
    lastMove: { col, row },
    winner,
    draw,
    winningLine: line,
    current: winner || draw ? state.current : state.current === 'kanye' ? 'taylor' : 'kanye',
  }
}

export function canGrammyFlex(state: GameState, player: Player): boolean {
  if (state.grammyUsed[player]) return false
  if (!state.lastMove) return false
  const { col, row } = state.lastMove
  // The piece just placed must belong to this player
  return state.board[row][col] === player
}

export function applyGrammyFlex(state: GameState, player: Player): GameState | null {
  if (!canGrammyFlex(state, player)) return null
  const { col, row } = state.lastMove!
  const key = `${col},${row}`
  const flexed = new Set(state.flexed)
  flexed.add(key)
  return {
    ...state,
    grammyUsed: { ...state.grammyUsed, [player]: true },
    flexed,
  }
}

function findWinningLine(
  board: Cell[][],
  col: number,
  row: number,
  player: Player,
): Array<{ col: number; row: number }> | null {
  const dirs: Array<[number, number]> = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ]

  for (const [dx, dy] of dirs) {
    const line = [{ col, row }]
    for (const sign of [1, -1] as const) {
      let c = col + dx * sign
      let r = row + dy * sign
      while (c >= 0 && c < COLS && r >= 0 && r < ROWS && board[r][c] === player) {
        line.push({ col: c, row: r })
        c += dx * sign
        r += dy * sign
      }
    }
    if (line.length >= 4) return line
  }
  return null
}

export const PLAYER_LABEL: Record<Player, string> = {
  kanye: 'Kanye West',
  taylor: 'Taylor Swift',
}
