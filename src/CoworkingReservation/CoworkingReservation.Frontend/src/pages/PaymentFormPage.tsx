import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CreditCard, Save } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
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

type PaymentFormValues = {
  reservationId: number
  amount: number
  method: 'Cash' | 'Card' | 'Transfer'
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded'
  transactionReference: string
}

const paymentMethods = [
  { value: 'Cash', label: 'Efectivo' },
  { value: 'Card', label: 'Tarjeta' },
  { value: 'Transfer', label: 'Transferencia' },
] as const

const paymentStatuses = [
  { value: 'Pending', label: 'Pendiente' },
  { value: 'Paid', label: 'Pagado' },
  { value: 'Failed', label: 'Fallido' },
  { value: 'Refunded', label: 'Reembolsado' },
] as const

export default function PaymentFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const paymentId = Number(id)
  const isEditing =
    id !== undefined &&
    Number.isInteger(paymentId) &&
    paymentId > 0

  const [reservations, setReservations] =
    useState<Reservation[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentPayment, setCurrentPayment] =
    useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    defaultValues: {
      reservationId: 0,
      amount: 1,
      method: 'Cash',
      status: 'Pending',
      transactionReference: '',
    },
  })

  const selectedReservationId = Number(
    watch('reservationId'),
  )

  const loadFormData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [
        reservationsResponse,
        paymentsResponse,
        usersResponse,
      ] = await Promise.all([
        reservationService.getAll(),
        paymentService.getAll(),
        userService.getAll(),
      ])

      setReservations(reservationsResponse)
      setPayments(paymentsResponse)
      setUsers(usersResponse)

      if (isEditing) {
        const payment =
          await paymentService.getById(paymentId)

        setCurrentPayment(payment)

        reset({
          reservationId: payment.reservationId,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          transactionReference:
            payment.transactionReference ?? '',
        })
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isEditing
            ? 'No fue posible cargar el pago.'
            : 'No fue posible cargar los datos del formulario.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [isEditing, paymentId, reset])

  useEffect(() => {
    void loadFormData()
  }, [loadFormData])

  const usersById = useMemo(
    () =>
      new Map(
        users.map((user) => [user.id, user.fullName]),
      ),
    [users],
  )

  const paidReservationIds = useMemo(
    () =>
      new Set(
        payments
          .filter(
            (payment) =>
              !isEditing || payment.id !== paymentId,
          )
          .map((payment) => payment.reservationId),
      ),
    [isEditing, paymentId, payments],
  )

  const selectableReservations = useMemo(
    () =>
      reservations.filter(
        (reservation) =>
          !paidReservationIds.has(reservation.id) ||
          reservation.id ===
            currentPayment?.reservationId,
      ),
    [
      currentPayment,
      paidReservationIds,
      reservations,
    ],
  )

  const selectedReservation = useMemo(
    () =>
      reservations.find(
        (reservation) =>
          reservation.id === selectedReservationId,
      ),
    [reservations, selectedReservationId],
  )

  const getReservationLabel = (
    reservation: Reservation,
  ) => {
    const clientName =
      usersById.get(reservation.userId) ??
      `Usuario #${reservation.userId}`

    return `${clientName} — Reserva #${reservation.id} — ${formatCurrency(
      reservation.totalAmount,
    )}`
  }

  const onSubmit = async (
    formValues: PaymentFormValues,
  ) => {
    setIsSubmitting(true)
    setErrorMessage('')

    const paymentData = {
      reservationId: Number(formValues.reservationId),
      amount: Number(formValues.amount),
      method: formValues.method,
      status: formValues.status,
      transactionReference:
        formValues.transactionReference.trim() || null,
    }

    try {
      if (isEditing) {
        await paymentService.update(
          paymentId,
          paymentData,
        )
      } else {
        await paymentService.create(paymentData)
      }

      navigate('/pagos')
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isEditing
            ? 'No fue posible actualizar el pago.'
            : 'No fue posible guardar el pago.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="page">
        <div className="form-loading">
          <div className="loading-spinner" />
          <p>Cargando formulario...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <header className="page-header form-page-header">
        <div>
          <h1>
            {isEditing ? 'Editar pago' : 'Nuevo pago'}
          </h1>

          <p>
            {isEditing
              ? 'Actualiza la información del pago.'
              : 'Registra el pago correspondiente a una reserva.'}
          </p>
        </div>

        <Link className="back-link" to="/pagos">
          <ArrowLeft size={17} />
          Volver a pagos
        </Link>
      </header>

      {errorMessage && (
        <div className="alert alert-error">
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        className="form-card"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="form-card-title">
          <CreditCard size={22} />
          <h2>Información del pago</h2>
        </div>

        {selectableReservations.length === 0 ? (
          <div className="list-state compact-state">
            <CreditCard size={36} />

            <h2>No hay reservas pendientes de pago</h2>

            <p>
              Todas las reservas existentes ya tienen un pago
              registrado.
            </p>

            <Link
              className="secondary-button"
              to="/pagos"
            >
              Volver a pagos
            </Link>
          </div>
        ) : (
          <>
            <div className="form-grid">
              <div className="form-field full-column">
                <label htmlFor="reservationId">
                  Reserva
                </label>

                <select
                  id="reservationId"
                  className={
                    errors.reservationId ? 'invalid' : ''
                  }
                  {...register('reservationId', {
                    valueAsNumber: true,
                    validate: (value) =>
                      Number(value) > 0 ||
                      'Selecciona una reserva.',
                  })}
                >
                  <option value={0}>
                    Selecciona una reserva
                  </option>

                  {selectableReservations.map(
                    (reservation) => (
                      <option
                        key={reservation.id}
                        value={reservation.id}
                      >
                        {getReservationLabel(reservation)}
                      </option>
                    ),
                  )}
                </select>

                {errors.reservationId && (
                  <span className="field-error">
                    {errors.reservationId.message}
                  </span>
                )}

                {selectedReservation && (
                  <span className="field-help">
                    Fecha de la reserva:{' '}
                    {formatDateTime(
                      selectedReservation.startTime,
                    )}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="amount">
                  Monto pagado (RD$)
                </label>

                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  className={
                    errors.amount ? 'invalid' : ''
                  }
                  {...register('amount', {
                    valueAsNumber: true,
                    required: 'Indica el monto pagado.',
                    min: {
                      value: 1,
                      message:
                        'El monto debe ser mayor que cero.',
                    },
                  })}
                />

                {errors.amount && (
                  <span className="field-error">
                    {errors.amount.message}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="method">
                  Método de pago
                </label>

                <select
                  id="method"
                  {...register('method', {
                    required:
                      'Selecciona un método de pago.',
                  })}
                >
                  {paymentMethods.map((method) => (
                    <option
                      key={method.value}
                      value={method.value}
                    >
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="status">Estado</label>

                <select
                  id="status"
                  {...register('status', {
                    required: 'Selecciona un estado.',
                  })}
                >
                  {paymentStatuses.map((status) => (
                    <option
                      key={status.value}
                      value={status.value}
                    >
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="transactionReference">
                  Referencia de transacción
                </label>

                <input
                  id="transactionReference"
                  type="text"
                  maxLength={100}
                  placeholder="Opcional"
                  {...register('transactionReference', {
                    maxLength: {
                      value: 100,
                      message:
                        'La referencia no puede superar los 100 caracteres.',
                    },
                  })}
                />

                {errors.transactionReference && (
                  <span className="field-error">
                    {
                      errors.transactionReference
                        .message
                    }
                  </span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <Link
                className="secondary-button"
                to="/pagos"
              >
                Cancelar
              </Link>

              <button
                className="primary-button"
                type="submit"
                disabled={isSubmitting}
              >
                <Save size={17} />

                {isSubmitting
                  ? 'Guardando...'
                  : isEditing
                    ? 'Guardar cambios'
                    : 'Guardar pago'}
              </button>
            </div>
          </>
        )}
      </form>
    </section>
  )
}