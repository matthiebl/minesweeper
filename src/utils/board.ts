import { Tile, TileState } from '../types'

const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
]

export const generateBoard = (rows: number, cols: number, mines: number, initial: [number, number]) => {
    const board: TileState[][] = []
    for (let i = 0; i < rows; i++) {
        let row = []
        for (let j = 0; j < cols; j++) {
            row.push(emptyTileState())
        }
        board.push(row)
    }
    const [ir, ic] = initial

    for (let i = 0; i < mines; ) {
        const r = Math.floor(Math.random() * rows)
        const c = Math.floor(Math.random() * cols)
        if (board[r][c].tile == Tile.EMPTY && manhattanDistance(r, c, ir, ic) > 2) {
            board[r][c].tile = Tile.MINE
            i++
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            board[r][c].nearby = nearby(board, [r, c])
        }
    }

    return board
}

const manhattanDistance = (ar: number, ac: number, br: number, bc: number) => {
    return Math.abs(ar - br) + Math.abs(ac - bc)
}

const nearby = (board: TileState[][], initial: [number, number]) => {
    const [r, c] = initial
    let count = 0
    directions.forEach(([dr, dc]) => {
        const [nr, nc] = [r + dr, c + dc]
        if (0 <= nr && nr < board.length && 0 <= nc && nc < board[0].length && board[nr][nc].tile == Tile.MINE) {
            count += 1
        }
    })
    return count
}

const emptyTileState = (): TileState => ({
    tile: Tile.EMPTY,
    flagged: false,
    revealed: false,
    nearby: 0,
})

export const floodFill = (board: TileState[][], initial: [number, number]) => {
    const seen = new Set<string>()
    const queue: [number, number][] = [initial]
    while (queue.length) {
        const [r, c] = queue.shift()!
        if (seen.has([r, c].toString())) {
            continue
        }
        seen.add([r, c].toString())
        board[r][c].revealed = true
        if (board[r][c].nearby != 0) {
            continue
        }
        directions.forEach(([dr, dc]) => {
            const [nr, nc] = [r + dr, c + dc]
            if (
                0 <= nr &&
                nr < board.length &&
                0 <= nc &&
                nc < board[0].length &&
                board[nr][nc].tile == Tile.EMPTY &&
                !seen.has([nr, nc].toString())
            ) {
                queue.push([nr, nc])
            }
        })
    }
}

export const nearbyFlagged = (board: TileState[][], initial: [number, number]) => {
    const [r, c] = initial
    let flagged = 0
    directions.forEach(([dr, dc]) => {
        const [nr, nc] = [r + dr, c + dc]
        if (0 <= nr && nr < board.length && 0 <= nc && nc < board[0].length && board[nr][nc].flagged) {
            flagged += 1
        }
    })
    return flagged == nearby(board, initial)
}

export const clearUnflagged = (board: TileState[][], initial: [number, number]) => {
    const [r, c] = initial
    directions.forEach(([dr, dc]) => {
        const [nr, nc] = [r + dr, c + dc]
        if (0 <= nr && nr < board.length && 0 <= nc && nc < board[0].length) {
            if (!board[nr][nc].flagged) {
                if (board[nr][nc].tile == Tile.EMPTY && board[nr][nc].nearby == 0) {
                    floodFill(board, [nr, nc])
                }
                board[nr][nc].revealed = true
            }
        }
    })
}

export const countBoard = (board: TileState[][]) => {
    let flags = 0
    let mines = 0
    let revealedMines = 0
    let revealed = 0
    board.forEach(row => {
        row.forEach(state => {
            flags += state.flagged ? 1 : 0
            mines += state.tile == Tile.MINE ? 1 : 0
            revealedMines += state.revealed && state.tile == Tile.MINE ? 1 : 0
            revealed += state.revealed ? 1 : 0
        })
    })
    return {
        flags,
        mines,
        revealedMines,
        revealed,
        togo: board.length * board[0].length - mines - revealed,
    }
}
