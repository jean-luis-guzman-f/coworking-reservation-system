import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import SpacesPage from './pages/SpacesPage'
import SpaceFormPage from './pages/SpaceFormPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="espacios" element={<SpacesPage />} />
          <Route
  path="espacios/nuevo"
  element={<SpaceFormPage />}
/>

<Route
  path="espacios/:id/editar"
  element={<SpaceFormPage />}
/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}