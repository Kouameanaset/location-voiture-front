import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Voitures from './pages/Voitures'
import Reservations from './pages/Reservations'
import Paiements from './pages/Paiements'
import Categories from './pages/Categories'

export default function App() {
    return (
        <BrowserRouter>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 max-w-6xl w-full overflow-x-hidden">
                    <Routes>
                        <Route path="/"             element={<Dashboard />} />
                        <Route path="/clients"      element={<Clients />} />
                        <Route path="/voitures"     element={<Voitures />} />
                        <Route path="/reservations" element={<Reservations />} />
                        <Route path="/paiements"    element={<Paiements />} />
                        <Route path="/categories"   element={<Categories />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}