import { useEffect, useState } from 'react'
import { GameState, Tile, TileState } from '../types'
import { clearUnflagged, countBoard, floodFill, generateBoard, nearbyFlagged } from '../utils/board'

export const Minesweeper = () => {
    const [rows, setRows] = useState(15)
    const [cols, setCols] = useState(30)

    return <div>{<Board rows={rows} cols={cols} mines={Math.floor(0.1 * rows * cols)} />}</div>
}

export const Board = ({ rows, cols, mines }: { rows: number; cols: number; mines: number }) => {
    const [board, setBoard] = useState<TileState[][] | undefined>(undefined)
    const [mineCount, setMineCount] = useState(mines)
    const [gameState, setGameState] = useState(GameState.NOT_STARTED)

    const end = gameState == GameState.DEAD || gameState == GameState.WIN
    const reveal = (row: number, col: number) => {
        if (end) {
            return
        }
        const newBoard: TileState[][] = board
            ? JSON.parse(JSON.stringify(board))
            : generateBoard(rows, cols, mines, [row, col])
        if (newBoard[row][col].revealed && newBoard[row][col].nearby && nearbyFlagged(newBoard, [row, col])) {
            clearUnflagged(newBoard, [row, col])
        } else {
            floodFill(newBoard, [row, col])
        }
        setBoard(newBoard)
    }
    const flag = (row: number, col: number) => {
        if (end) {
            return
        }
        const newBoard = board ? JSON.parse(JSON.stringify(board)) : generateBoard(rows, cols, mines, [row, col])
        newBoard[row][col].flagged = !newBoard[row][col].flagged
        setBoard(newBoard)
    }

    useEffect(() => {
        if (board) {
            setGameState(GameState.HAPPY)
            const count = countBoard(board)
            setMineCount(mines - count.flags)
            if (count.revealedMines) {
                setGameState(GameState.DEAD)
            } else if (count.togo == 0) {
                setMineCount(0)
                setGameState(GameState.WIN)
            }
        } else {
            setGameState(GameState.NOT_STARTED)
            setMineCount(mines)
        }
    }, [board])

    return (
        <div className='w-full'>
            <div className='flex justify-between items-center px-4 p-2'>
                <p>{mineCount}</p>
                <p className='text-4xl'>{gameState}</p>
                <p>999</p>
            </div>
            {new Array(rows).fill(0).map((_, r) => (
                <div key={`board row ${r}`} className='flex w-full'>
                    {new Array(cols).fill(0).map((_, c) => (
                        <Square
                            key={`square row ${r} col ${c}`}
                            gameState={gameState}
                            state={board && board[r][c]}
                            reveal={() => reveal(r, c)}
                            flag={e => {
                                e.preventDefault()
                                flag(r, c)
                            }}
                        />
                    ))}
                </div>
            ))}
            {end && <button onClick={() => setBoard(undefined)}>Restart</button>}
        </div>
    )
}

const Square = ({
    gameState,
    state,
    reveal,
    flag,
}: {
    gameState: GameState
    state?: TileState
    reveal: () => any
    flag: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => any
}) => {
    if (!state || (!state.flagged && !state.revealed)) {
        if (state && gameState == GameState.DEAD && state.tile == Tile.MINE) {
            return (
                <div className='rounded-full bg-red-400 flex-1 aspect-square flex items-center justify-center'>💣</div>
            )
        }
        if (state && gameState == GameState.WIN && state.tile == Tile.MINE) {
            return (
                <div className='flex-1 aspect-square flex items-center justify-center ring-1 ring-inset ring-offset-1 ring-gray-400'>
                    🚩
                </div>
            )
        }
        return (
            <button
                onClick={reveal}
                onContextMenu={flag}
                className='flex-1 aspect-square flex items-center justify-center ring-1 ring-inset ring-offset-1 ring-gray-400 hover:bg-gray-100'
            ></button>
        )
    }
    if (state.revealed) {
        if (state.tile == Tile.MINE) {
            return (
                <div className='rounded-full bg-red-400 flex-1 aspect-square flex items-center justify-center'>💣</div>
            )
        }
        if (state.tile == Tile.EMPTY && state.nearby) {
            return (
                <button onClick={reveal} className='flex-1 aspect-square flex items-center justify-center'>
                    {state.nearby}
                </button>
            )
        }
        return <div className='flex-1 aspect-square flex items-center justify-center'></div>
    }
    if (state.flagged) {
        return (
            <button
                onContextMenu={flag}
                className='flex-1 aspect-square flex items-center justify-center ring-1 ring-inset ring-offset-1 ring-gray-400'
            >
                🚩
            </button>
        )
    }
}
