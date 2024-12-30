import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Minesweeper } from './pages/Minesweeper'

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path='*' element={<Minesweeper />} />
        </Routes>
    </BrowserRouter>
)

export default App
