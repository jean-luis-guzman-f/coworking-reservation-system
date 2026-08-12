import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  reservationService,
  spaceService,
  userService,
} from '../services/api'
import type {
  Reservation,
  Space,
  User,
} from '../types'
import {
  formatCurrency,
  formatDateTime,
  getApiErrorMessage,
} from '../utils/formatters'

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

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [reservationToDelete, setReservationToDelete] =
    useState<Reservation | null>(null)

  const loadReservations = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [
        reservationsResponse,
        usersResponse,
        spacesResponse,
      ] = await Promise.all([
        reservationService.getAll(),
        userService.getAll(),
        spaceService.getAll(),
      ])

      setReservations(reservationsResponse)
      setUsers(usersResponse)
      setSpaces(spacesResponse)
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No fue posible cargar las reservas. Verifica que la API esté ejecutándose.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadReservations()
  }, [loadReservations])

  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('')
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [successMessage])

  useEffect(() => {
    if (!reservationToDelete) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && deletingId === null) {
        setReservationToDelete(null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [reservationToDelete, deletingId])

  const userNames = useMemo(
    () =>
      new Map(
        users.map((user) => [user.id, user.fullName]),
      ),
    [users],
  )

  const spaceNames = useMemo(
    () =>
      new Map(
        spaces.map((space) => [space.id, space.name]),
      ),
    [spaces],
  )

  const filteredReservations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return reservations
    }

    return reservations.filter((reservation) => {
      const userName =
        userNames.get(reservation.userId) ??
        `Usuario #${reservation.userId}`

      const spaceName =
        spaceNames.get(reservation.spaceId) ??
        `Espacio #${reservation.spaceId}`

      const status =
        reservationStatusLabels[reservation.status] ??
        reservation.status

      return (
        userName.toLowerCase().includes(term) ||
        spaceName.toLowerCase().includes(term) ||
        status.toLowerCase().includes(term)
      )
    })
  }, [reservations, searchTerm, spaceNames, userNames])

  const handleDelete = async () => {
    if (!reservationToDelete) {
      return
    }

    const reservation = reservationToDelete

    setDeletingId(reservation.id)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await reservationService.remove(reservation.id)

      setReservations((currentReservations) =>
        currentReservations.filter(
          (currentReservation) =>
            currentReservation.id !== reservation.id,
        ),
      )

      setReservationToDelete(null)
      setSuccessMessage(
        'La reserva fue eliminada correctamente.',
      )
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No fue posible eliminar la reserva.',
        ),
      )

      setReservationToDelete(null)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Reservas</h1>

          <p>
            Gestiona las reservas de espacios de coworking.
          </p>
        </div>

        <Link
          className="primary-button"
          to="/reservas/nueva"
        >
          <Plus size={18} />
          Nueva reserva
        </Link>
      </header>

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {errorMessage && !isLoading && (
        <div className="alert alert-error">
          <span>{errorMessage}</span>

          <button
            type="button"
            onClick={() => void loadReservations()}
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      )}

      <article className="list-card">
        <div className="list-toolbar">
          <label className="search-field">
            <Search size={18} />

            <input
              type="search"
              placeholder="Buscar reserva"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </label>
        </div>

        {isLoading ? (
          <div className="list-state">
            <div className="loading-spinner" />
            <p>Cargando reservas...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="list-state">
            <CalendarDays size={38} />

            <h2>
              {reservations.length === 0
                ? 'No hay reservas registradas'
                : 'No encontramos resultados'}
            </h2>

            <p>
              {reservations.length === 0
                ? 'Registra la primera reserva de CoWorka.'
                : 'Prueba utilizando otro término de búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table reservations-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Espacio</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Estado</th>
                  <th>Monto total</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredReservations.map((reservation) => {
                  const userName =
                    userNames.get(reservation.userId) ??
                    `Usuario #${reservation.userId}`

                  const spaceName =
                    spaceNames.get(reservation.spaceId) ??
                    `Espacio #${reservation.spaceId}`

                  const statusLabel =
                    reservationStatusLabels[
                      reservation.status
                    ] ?? reservation.status

                  const statusClass =
                    reservationStatusClasses[
                      reservation.status
                    ] ?? 'pending'

                  return (
                    <tr key={reservation.id}>
                      <td>
                        <div className="table-primary">
                          {userName}
                        </div>
                      </td>

                      <td>{spaceName}</td>

                      <td>
                        {formatDateTime(
                          reservation.startTime,
                        )}
                      </td>

                      <td>
                        {formatDateTime(
                          reservation.endTime,
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      <td>
                        {formatCurrency(
                          reservation.totalAmount,
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                          <Link
                            className="action-button edit-button"
                            to={`/reservas/${reservation.id}/editar`}
                          >
                            <Edit3 size={15} />
                            Editar
                          </Link>

                          <button
                            className="action-button delete-button"
                            type="button"
                            disabled={
                              deletingId === reservation.id
                            }
                            onClick={() =>
                              setReservationToDelete(reservation)
                            }
                          >
                            <Trash2 size={15} />

                            {deletingId === reservation.id
                              ? 'Eliminando'
                              : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {reservationToDelete && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              deletingId === null
            ) {
              setReservationToDelete(null)
            }
          }}
        >
          <div
            className="confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-reservation-title"
          >
            <div className="modal-icon danger">
              <Trash2 size={28} />
            </div>

            <h2 id="delete-reservation-title">
              Eliminar reserva
            </h2>

            <p>
              ¿Seguro que deseas eliminar la reserva de{' '}
              <strong>
                {userNames.get(
                  reservationToDelete.userId,
                ) ??
                  `Usuario #${reservationToDelete.userId}`}
              </strong>
              ?
            </p>

            <p>Esta acción no se puede deshacer.</p>

            <div className="modal-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={deletingId !== null}
                onClick={() =>
                  setReservationToDelete(null)
                }
              >
                Cancelar
              </button>

              <button
                className="danger-button"
                type="button"
                disabled={deletingId !== null}
                onClick={() => void handleDelete()}
              >
                <Trash2 size={17} />

                {deletingId !== null
                  ? 'Eliminando...'
                  : 'Eliminar reserva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}