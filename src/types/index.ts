export interface TileState {
    tile: Tile
    flagged: boolean
    revealed: boolean
    nearby: number
}

export enum Tile {
    EMPTY = 'EMPTY',
    MINE = 'MINE',
}

export enum GameState {
    NOT_STARTED = '...',
    HAPPY = '🙂',
    WIN = '🏆',
    DEAD = '💀',
}
