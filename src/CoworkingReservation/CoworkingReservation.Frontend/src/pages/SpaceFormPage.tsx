import { useEffect, useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { spaceService } from '../services/api'
import type { SpaceType } from '../types'
import { getApiErrorMessage } from '../utils/formatters'

interface SpaceFormValues {
  name: string
  description: string
  type: SpaceType
  capacity: number
  hourlyRate: number
  isAvailable: boolean
}

const defaultValues: SpaceFormValues = {
  name: '',
  description: '',
  type: 'Desk',
  capacity: 1,
  hourlyRate: 1,
  isAvailable: true,
}

export default function SpaceFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [isLoading, setIsLoading] = useState(isEditing)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SpaceFormValues>({
    defaultValues,
  })

  useEffect(() => {
    if (!id) {
      return
    }

    const loadSpace = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const space = await spaceService.getById(Number(id))

        reset({
          name: space.name,
          description: space.description ?? '',
          type: space.type,
          capacity: space.capacity,
          hourlyRate: space.hourlyRate,
          isAvailable: space.isAvailable,
        })
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            'No fue posible cargar la información del espacio.',
          ),
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadSpace()
  }, [id, reset])

  const onSubmit = async (values: SpaceFormValues) => {
    setErrorMessage('')

    const spaceData = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      type: values.type,
      capacity: Number(values.capacity),
      hourlyRate: Number(values.hourlyRate),
      isAvailable: values.isAvailable,
    }

    try {
      if (isEditing && id) {
        await spaceService.update(Number(id), spaceData)
      } else {
        await spaceService.create(spaceData)
      }

      navigate('/espacios')
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isEditing
            ? 'No fue posible actualizar el espacio.'
            : 'No fue posible registrar el espacio.',
        ),
      )
    }
  }

  if (isLoading) {
    return (
      <section className="page">
        <div className="page-state">
          <div className="loading-spinner" />
          <h2>Cargando espacio</h2>
          <p>Estamos consultando la información registrada.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>{isEditing ? 'Editar espacio' : 'Nuevo espacio'}</h1>
          <p>
            {isEditing
              ? 'Actualiza la información del espacio de coworking.'
              : 'Completa la información del espacio de coworking.'}
          </p>
        </div>

        <Link className="back-link" to="/espacios">
          <ArrowLeft size={17} />
          Volver a espacios
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
        <h2>Información del espacio</h2>

        <div className="form-grid">
          <div className="form-field full-column">
            <label htmlFor="name">Nombre</label>

            <input
              id="name"
              type="text"
              placeholder="Ingresa el nombre del espacio"
              {...register('name', {
                required: 'El nombre es obligatorio.',
                minLength: {
                  value: 3,
                  message:
                    'El nombre debe contener al menos 3 caracteres.',
                },
                maxLength: {
                  value: 150,
                  message:
                    'El nombre no puede superar 150 caracteres.',
                },
              })}
            />

            {errors.name && (
              <span className="field-error">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="form-field full-column">
            <label htmlFor="description">Descripción</label>

            <textarea
              id="description"
              rows={4}
              placeholder="Describe las características del espacio"
              {...register('description', {
                maxLength: {
                  value: 500,
                  message:
                    'La descripción no puede superar 500 caracteres.',
                },
              })}
            />

            {errors.description && (
              <span className="field-error">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="type">Tipo</label>

            <select
              id="type"
              {...register('type', {
                required: 'Selecciona el tipo de espacio.',
              })}
            >
              <option value="Desk">Escritorio</option>
              <option value="MeetingRoom">
                Sala de reuniones
              </option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="capacity">Capacidad</label>

            <input
              id="capacity"
              type="number"
              min="1"
              placeholder="Ingresa la capacidad máxima"
              {...register('capacity', {
                required: 'La capacidad es obligatoria.',
                valueAsNumber: true,
                min: {
                  value: 1,
                  message:
                    'La capacidad debe ser mayor que cero.',
                },
              })}
            />

            {errors.capacity && (
              <span className="field-error">
                {errors.capacity.message}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="hourlyRate">
              Tarifa por hora (RD$)
            </label>

            <input
              id="hourlyRate"
              type="number"
              min="1"
              step="0.01"
              placeholder="Ingresa la tarifa por hora"
              {...register('hourlyRate', {
                required: 'La tarifa es obligatoria.',
                valueAsNumber: true,
                min: {
                  value: 1,
                  message:
                    'La tarifa debe ser mayor que cero.',
                },
              })}
            />

            {errors.hourlyRate && (
              <span className="field-error">
                {errors.hourlyRate.message}
              </span>
            )}
          </div>

          <div className="form-field">
            <span className="field-label">Disponible</span>

            <label className="switch-field">
              <input
                type="checkbox"
                {...register('isAvailable')}
              />

              <span className="switch-control" />

              <span>El espacio está disponible</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <Link className="secondary-button" to="/espacios">
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
                : 'Guardar espacio'}
          </button>
        </div>
      </form>
    </section>
  )
}