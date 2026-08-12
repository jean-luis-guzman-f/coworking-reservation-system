import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import ReservationFormPage from './pages/ReservationFormPage'
import ReservationsPage from './pages/ReservationsPage'
import SpaceFormPage from './pages/SpaceFormPage'
import SpacesPage from './pages/SpacesPage'
import PaymentsPage from './pages/PaymentsPage'
import PaymentFormPage from './pages/PaymentFormPage'
import UsersPage from './pages/UsersPage'
import UserFormPage from './pages/UserFormPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route
            path="espacios"
            element={<SpacesPage />}
          />

          <Route
            path="espacios/nuevo"
            element={<SpaceFormPage />}
          />

          <Route
            path="espacios/:id/editar"
            element={<SpaceFormPage />}
          />

          <Route
            path="reservas"
            element={<ReservationsPage />}
          />

          <Route
            path="reservas/nueva"
            element={<ReservationFormPage />}
          />

          <Route
            path="reservas/:id/editar"
            element={<ReservationFormPage />}
          />

          <Route
            path="pagos"
            element={<PaymentsPage />}
          />

          <Route
            path="pagos/nuevo"
            element={<PaymentFormPage />}
          />

          <Route
            path="pagos/:id/editar"
            element={<PaymentFormPage />}
          /> 

          <Route
            path="usuarios"
            element={<UsersPage />}
          />

          <Route
            path="usuarios/nuevo"
            element={<UserFormPage />}
          />

          <Route
            path="usuarios/:id/editar"
            element={<UserFormPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}