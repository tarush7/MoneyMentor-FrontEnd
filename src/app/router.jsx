import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import HomePage from '../pages/HomePage'
import TransactionsPage from '../pages/TransactionsPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
