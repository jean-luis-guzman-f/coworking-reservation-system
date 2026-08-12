import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CreditCard,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  paymentService,
  reservationService,
  userService,
} from '../services/api'
import type {
  Payment,
  Reservation,
  User,
} from '../types'
import {
  formatCurrency,
  formatDateTime,
  getApiErrorMessage,
} from '../utils/formatters'

const paymentMethodLabels: Record<string, string> = {
  Cash: 'Efectivo',
  Card: 'Tarjeta',
  Transfer: 'Transferencia',
}

const paymentStatusLabels: Record<string, string> = {
  Pending: 'Pendiente',
  Paid: 'Pagado',
  Failed: 'Fallido',
  Refunded: 'Reembolsado',
}

const paymentStatusClasses: Record<string, string> = {
  Pending: 'status-pending',
  Paid: 'status-confirmed',
  Failed: 'status-cancelled',
  Refunded: 'status-completed',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [paymentToDelete, setPaymentToDelete] =
    useState<Payment | null>(null)

  const loadPayments = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [
        paymentsResponse,
        reservationsResponse,
        usersResponse,
      ] = await Promise.all([
        paymentService.getAll(),
        reservationService.getAll(),
        userService.getAll(),
      ])

      setPayments(paymentsResponse)
      setReservations(reservationsResponse)
      setUsers(usersResponse)
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No fue posible cargar los pagos. Verifica que la API esté ejecutándose.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPayments()
  }, [loadPayments])

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
    if (!paymentToDelete) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && deletingId === null) {
        setPaymentToDelete(null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [paymentToDelete, deletingId])

  const usersById = useMemo(
    () =>
      new Map(
        users.map((user) => [user.id, user]),
      ),
    [users],
  )

  const reservationsById = useMemo(
    () =>
      new Map(
        reservations.map((reservation) => [
          reservation.id,
          reservation,
        ]),
      ),
    [reservations],
  )

  const getClientName = useCallback(
    (reservationId: number) => {
      const reservation =
        reservationsById.get(reservationId)

      if (!reservation) {
        return `Reserva #${reservationId}`
      }

      return (
        usersById.get(reservation.userId)?.fullName ??
        `Usuario #${reservation.userId}`
      )
    },
    [reservationsById, usersById],
  )

  const filteredPayments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return payments
    }

    return payments.filter((payment) => {
      const clientName = getClientName(
        payment.reservationId,
      )

      const method =
        paymentMethodLabels[payment.method] ??
        payment.method

      const status =
        paymentStatusLabels[payment.status] ??
        payment.status

      const transactionReference =
        payment.transactionReference ?? ''

      return (
        clientName.toLowerCase().includes(term) ||
        method.toLowerCase().includes(term) ||
        status.toLowerCase().includes(term) ||
        transactionReference.toLowerCase().includes(term) ||
        String(payment.reservationId).includes(term)
      )
    })
  }, [getClientName, payments, searchTerm])

  const handleDelete = async () => {
    if (!paymentToDelete) {
      return
    }

    const payment = paymentToDelete

    setDeletingId(payment.id)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await paymentService.remove(payment.id)

      setPayments((currentPayments) =>
        currentPayments.filter(
          (currentPayment) =>
            currentPayment.id !== payment.id,
        ),
      )

      setPaymentToDelete(null)
      setSuccessMessage(
        'El pago fue eliminado correctamente.',
      )
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No fue posible eliminar el pago.',
        ),
      )

      setPaymentToDelete(null)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Pagos</h1>

          <p>
            Gestiona los pagos asociados a las reservas.
          </p>
        </div>

        <Link
          className="primary-button"
          to="/pagos/nuevo"
        >
          <Plus size={18} />
          Nuevo pago
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
            onClick={() => void loadPayments()}
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
              placeholder="Buscar pago"
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
            <p>Cargando pagos...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="list-state">
            <CreditCard size={38} />

            <h2>
              {payments.length === 0
                ? 'No hay pagos registrados'
                : 'No encontramos resultados'}
            </h2>

            <p>
              {payments.length === 0
                ? 'Registra el primer pago de CoWorka.'
                : 'Prueba utilizando otro término de búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table payments-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Reserva</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th>Referencia</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => {
                  const methodLabel =
                    paymentMethodLabels[payment.method] ??
                    payment.method

                  const statusLabel =
                    paymentStatusLabels[payment.status] ??
                    payment.status

                  const statusClass =
                    paymentStatusClasses[payment.status] ??
                    'status-pending'

                  return (
                    <tr key={payment.id}>
                      <td>
                        <div className="table-primary">
                          {getClientName(
                            payment.reservationId,
                          )}
                        </div>
                      </td>

                      <td>
                        Reserva #{payment.reservationId}
                      </td>

                      <td>
                        {formatCurrency(payment.amount)}
                      </td>

                      <td>{methodLabel}</td>

                      <td>
                        <span
                          className={`status-badge ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      <td>
                        {payment.transactionReference ||
                          'Sin referencia'}
                      </td>

                      <td>
                        {formatDateTime(
                          payment.paymentDate,
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                          <Link
                            className="action-button edit-button"
                            to={`/pagos/${payment.id}/editar`}
                          >
                            <Edit3 size={15} />
                            Editar
                          </Link>

                          <button
                            className="action-button delete-button"
                            type="button"
                            disabled={
                              deletingId === payment.id
                            }
                            onClick={() =>
                              setPaymentToDelete(payment)
                            }
                          >
                            <Trash2 size={15} />

                            {deletingId === payment.id
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

      {paymentToDelete && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              deletingId === null
            ) {
              setPaymentToDelete(null)
            }
          }}
        >
          <div
            className="confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-payment-title"
          >
            <div className="modal-icon danger">
              <Trash2 size={28} />
            </div>

            <h2 id="delete-payment-title">
              Eliminar pago
            </h2>

            <p>
              ¿Seguro que deseas eliminar el pago de{' '}
              <strong>
                {formatCurrency(paymentToDelete.amount)}
              </strong>{' '}
              correspondiente a{' '}
              <strong>
                {getClientName(
                  paymentToDelete.reservationId,
                )}
              </strong>
              ?
            </p>

            <p>Esta acción no se puede deshacer.</p>

            <div className="modal-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={deletingId !== null}
                onClick={() => setPaymentToDelete(null)}
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
                  : 'Eliminar pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}