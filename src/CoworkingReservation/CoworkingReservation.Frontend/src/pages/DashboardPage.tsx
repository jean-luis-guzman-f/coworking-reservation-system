import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CreditCard,
  Monitor,
  RefreshCw,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  paymentService,
  reservationService,
  spaceService,
  userService,
} from '../services/api'
import type {
  Payment,
  Reservation,
  Space,
  User,
} from '../types'
import {
  formatCurrency,
  formatDateTime,
  getApiErrorMessage,
} from '../utils/formatters'

interface DashboardData {
  users: User[]
  spaces: Space[]
  reservations: Reservation[]
  payments: Payment[]
}

const initialData: DashboardData = {
  users: [],
  spaces: [],
  reservations: [],
  payments: [],
}

const reservationStatusLabels: Record<string, string> = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  Cancelled: 'Cancelada',
  Completed: 'Completada',
}

const reservationStatusClasses: Record<string, string> = {
  Pending: 'status-pending',
  Confirmed: 'status-confirmed',
  Cancelled: 'status-cancelled',
  Completed: 'status-completed',
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [users, spaces, reservations, payments] =
        await Promise.all([
          userService.getAll(),
          spaceService.getAll(),
          reservationService.getAll(),
          paymentService.getAll(),
        ])

      setData({
        users,
        spaces,
        reservations,
        payments,
      })
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No fue posible cargar el panel. Verifica que la API esté ejecutándose.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const dashboardValues = useMemo(() => {
    const availableSpaces = data.spaces.filter(
      (space) => space.isAvailable,
    ).length

    const unavailableSpaces =
      data.spaces.length - availableSpaces

    const activeReservations = data.reservations.filter(
      (reservation) =>
        reservation.status === 'Pending' ||
        reservation.status === 'Confirmed',
    ).length

    const completedPayments = data.payments
      .filter((payment) => payment.status === 'Paid')
      .reduce((total, payment) => total + payment.amount, 0)

    const recentReservations = [...data.reservations]
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime(),
      )
      .slice(0, 6)

    return {
      availableSpaces,
      unavailableSpaces,
      activeReservations,
      completedPayments,
      recentReservations,
    }
  }, [data])

  const usersById = useMemo(
    () =>
      new Map(
        data.users.map((user) => [user.id, user.fullName]),
      ),
    [data.users],
  )

  const spacesById = useMemo(
    () =>
      new Map(
        data.spaces.map((space) => [space.id, space.name]),
      ),
    [data.spaces],
  )

  const spaceChartData = [
    {
      name: 'Disponibles',
      value: dashboardValues.availableSpaces,
      color: '#159a9c',
    },
    {
      name: 'No disponibles',
      value: dashboardValues.unavailableSpaces,
      color: '#142331',
    },
  ]

  if (isLoading) {
    return (
      <section className="page">
        <div className="page-state">
          <div className="loading-spinner" />
          <h2>Cargando panel principal</h2>
          <p>Estamos consultando la información de CoWorka.</p>
        </div>
      </section>
    )
  }

  if (errorMessage) {
    return (
      <section className="page">
        <div className="page-state error-state">
          <h2>No se pudo cargar el panel</h2>
          <p>{errorMessage}</p>

          <button
            className="primary-button"
            type="button"
            onClick={() => void loadDashboard()}
          >
            <RefreshCw size={18} />
            Intentar nuevamente
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Bienvenido, Jean Luis</h1>
          <p>
            Resumen general de la actividad de tu coworking.
          </p>
        </div>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon users-icon">
            <Users size={25} />
          </div>

          <div>
            <span>Usuarios registrados</span>
            <strong>{data.users.length}</strong>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon spaces-icon">
            <Monitor size={25} />
          </div>

          <div>
            <span>Espacios disponibles</span>
            <strong>{dashboardValues.availableSpaces}</strong>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon reservations-icon">
            <CalendarDays size={25} />
          </div>

          <div>
            <span>Reservas activas</span>
            <strong>{dashboardValues.activeReservations}</strong>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon payments-icon">
            <CreditCard size={25} />
          </div>

          <div>
            <span>Pagos completados</span>
            <strong className="currency-value">
              {formatCurrency(
                dashboardValues.completedPayments,
              )}
            </strong>
          </div>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Reservas recientes</h2>

          {dashboardValues.recentReservations.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={34} />
              <p>No hay reservas registradas.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Espacio</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardValues.recentReservations.map(
                    (reservation) => (
                      <tr key={reservation.id}>
                        <td>
                          {usersById.get(reservation.userId) ??
                            `Usuario #${reservation.userId}`}
                        </td>

                        <td>
                          {spacesById.get(reservation.spaceId) ??
                            `Espacio #${reservation.spaceId}`}
                        </td>

                        <td>
                          {formatDateTime(
                            reservation.startTime,
                          )}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              reservationStatusClasses[
                                reservation.status
                              ] ?? ''
                            }`}
                          >
                            {reservationStatusLabels[
                              reservation.status
                            ] ?? reservation.status}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Link className="card-link" to="/reservas">
            Ver todas las reservas
            <span aria-hidden="true">→</span>
          </Link>
        </article>

        <article className="dashboard-card space-status-card">
          <h2>Estado de espacios</h2>

          <div className="chart-content">
            <div className="chart-wrapper">
              {data.spaces.length === 0 ? (
                <div className="chart-empty">
                  Sin espacios
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spaceChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="63%"
                        outerRadius="88%"
                        paddingAngle={1}
                        stroke="none"
                      >
                        {spaceChartData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="chart-center">
                    <span>Total</span>
                    <strong>{data.spaces.length}</strong>
                    <small>espacios</small>
                  </div>
                </>
              )}
            </div>

            <div className="chart-legend">
              {spaceChartData.map((entry) => {
                const percentage =
                  data.spaces.length === 0
                    ? 0
                    : (entry.value / data.spaces.length) * 100

                return (
                  <div
                    className="legend-item"
                    key={entry.name}
                  >
                    <span
                      className="legend-color"
                      style={{ backgroundColor: entry.color }}
                    />

                    <div>
                      <p>{entry.name}</p>
                      <strong>{entry.value}</strong>
                      <small>{percentage.toFixed(1)}%</small>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Link className="primary-button full-width" to="/espacios">
            Ver espacios
          </Link>
        </article>
      </div>
    </section>
  )
}