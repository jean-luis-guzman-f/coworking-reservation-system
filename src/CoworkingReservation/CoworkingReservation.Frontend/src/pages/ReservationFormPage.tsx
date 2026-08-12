import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Save } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  reservationService,
  spaceService,
  userService,
} from '../services/api'
import type { Space, User } from '../types'
import {
  getApiErrorMessage,
  toDateTimeLocal,
} from '../utils/formatters'

type ReservationFormValues = {
  userId: number
  spaceId: number
  startTime: string
  endTime: string
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'
  totalAmount: number
}

const reservationStatuses = [
  {
    value: 'Pending',
    label: 'Pendiente',
  },
  {
    value: 'Confirmed',
    label: 'Confirmada',
  },
  {
    value: 'Cancelled',
    label: 'Cancelada',
  },
  {
    value: 'Completed',
    label: 'Completada',
  },
] as const

export default function ReservationFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const reservationId = Number(id)
  const isEditing =
    id !== undefined &&
    Number.isInteger(reservationId) &&
    reservationId > 0

  const [users, setUsers] = useState<User[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    defaultValues: {
      userId: 0,
      spaceId: 0,
      startTime: '',
      endTime: '',
      status: 'Pending',
      totalAmount: 1,
    },
  })

  const selectedSpaceId = Number(watch('spaceId'))
  const startTime = watch('startTime')

  const loadFormData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [usersResponse, spacesResponse] =
        await Promise.all([
          userService.getAll(),
          spaceService.getAll(),
        ])

      setUsers(usersResponse)
      setSpaces(spacesResponse)

      if (isEditing) {
        const reservation =
          await reservationService.getById(reservationId)

        reset({
          userId: reservation.userId,
          spaceId: reservation.spaceId,
          startTime: toDateTimeLocal(
            reservation.startTime,
          ),
          endTime: toDateTimeLocal(reservation.endTime),
          status: reservation.status,
          totalAmount: reservation.totalAmount,
        })
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isEditing
            ? 'No fue posible cargar la reserva.'
            : 'No fue posible cargar los datos del formulario.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [isEditing, reservationId, reset])

  useEffect(() => {
    void loadFormData()
  }, [loadFormData])

  const selectableSpaces = useMemo(() => {
    if (!isEditing) {
      return spaces.filter((space) => space.isAvailable)
    }

    return spaces.filter(
      (space) =>
        space.isAvailable || space.id === selectedSpaceId,
    )
  }, [isEditing, selectedSpaceId, spaces])

  const onSubmit = async (
    formValues: ReservationFormValues,
  ) => {
    setIsSubmitting(true)
    setErrorMessage('')

    const reservationData = {
      userId: Number(formValues.userId),
      spaceId: Number(formValues.spaceId),
      startTime: new Date(
        formValues.startTime,
      ).toISOString(),
      endTime: new Date(formValues.endTime).toISOString(),
      status: formValues.status,
      totalAmount: Number(formValues.totalAmount),
    }

    try {
      if (isEditing) {
        await reservationService.update(
          reservationId,
          reservationData,
        )
      } else {
        await reservationService.create(reservationData)
      }

      navigate('/reservas')
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isEditing
            ? 'No fue posible actualizar la reserva.'
            : 'No fue posible guardar la reserva.',
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
            {isEditing
              ? 'Editar reserva'
              : 'Nueva reserva'}
          </h1>

          <p>
            {isEditing
              ? 'Actualiza la información de la reserva.'
              : 'Completa la información para reservar un espacio.'}
          </p>
        </div>

        <Link className="back-link" to="/reservas">
          <ArrowLeft size={17} />
          Volver a reservas
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
          <CalendarDays size={22} />

          <h2>Información de la reserva</h2>
        </div>

        {users.length === 0 || spaces.length === 0 ? (
          <div className="alert alert-error">
            <span>
              Para registrar una reserva debe existir al menos
              un usuario y un espacio.
            </span>
          </div>
        ) : (
          <>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="userId">Cliente</label>

                <select
                  id="userId"
                  className={errors.userId ? 'invalid' : ''}
                  {...register('userId', {
                    valueAsNumber: true,
                    validate: (value) =>
                      Number(value) > 0 ||
                      'Selecciona un cliente.',
                  })}
                >
                  <option value={0}>
                    Selecciona un cliente
                  </option>

                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </select>

                {errors.userId && (
                  <span className="field-error">
                    {errors.userId.message}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="spaceId">Espacio</label>

                <select
                  id="spaceId"
                  className={errors.spaceId ? 'invalid' : ''}
                  {...register('spaceId', {
                    valueAsNumber: true,
                    validate: (value) =>
                      Number(value) > 0 ||
                      'Selecciona un espacio.',
                  })}
                >
                  <option value={0}>
                    Selecciona un espacio
                  </option>

                  {selectableSpaces.map((space) => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </select>

                {errors.spaceId && (
                  <span className="field-error">
                    {errors.spaceId.message}
                  </span>
                )}

                {selectableSpaces.length === 0 && (
                  <span className="field-help">
                    No hay espacios disponibles actualmente.
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="startTime">
                  Fecha y hora de inicio
                </label>

                <input
                  id="startTime"
                  type="datetime-local"
                  className={
                    errors.startTime ? 'invalid' : ''
                  }
                  {...register('startTime', {
                    required:
                      'Indica la fecha y hora de inicio.',
                  })}
                />

                {errors.startTime && (
                  <span className="field-error">
                    {errors.startTime.message}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="endTime">
                  Fecha y hora de finalización
                </label>

                <input
                  id="endTime"
                  type="datetime-local"
                  className={errors.endTime ? 'invalid' : ''}
                  {...register('endTime', {
                    required:
                      'Indica la fecha y hora de finalización.',
                    validate: (value) => {
                      if (!startTime || !value) {
                        return true
                      }

                      return (
                        new Date(value) >
                          new Date(startTime) ||
                        'La finalización debe ser posterior al inicio.'
                      )
                    },
                  })}
                />

                {errors.endTime && (
                  <span className="field-error">
                    {errors.endTime.message}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="status">Estado</label>

                <select
                  id="status"
                  {...register('status', {
                    required: 'Selecciona un estado.',
                  })}
                >
                  {reservationStatuses.map((status) => (
                    <option
                      key={status.value}
                      value={status.value}
                    >
                      {status.label}
                    </option>
                  ))}
                </select>

                {errors.status && (
                  <span className="field-error">
                    {errors.status.message}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="totalAmount">
                  Monto total (RD$)
                </label>

                <input
                  id="totalAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  className={
                    errors.totalAmount ? 'invalid' : ''
                  }
                  {...register('totalAmount', {
                    valueAsNumber: true,
                    required: 'Indica el monto total.',
                    min: {
                      value: 1,
                      message:
                        'El monto debe ser mayor que cero.',
                    },
                  })}
                />

                {errors.totalAmount && (
                  <span className="field-error">
                    {errors.totalAmount.message}
                  </span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <Link
                className="secondary-button"
                to="/reservas"
              >
                Cancelar
              </Link>

              <button
                className="primary-button"
                type="submit"
                disabled={
                  isSubmitting ||
                  users.length === 0 ||
                  selectableSpaces.length === 0
                }
              >
                <Save size={17} />

                {isSubmitting
                  ? 'Guardando...'
                  : isEditing
                    ? 'Guardar cambios'
                    : 'Guardar reserva'}
              </button>
            </div>
          </>
        )}
      </form>
    </section>
  )
}