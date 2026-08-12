import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Save, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { userService } from '../services/api'
import { getApiErrorMessage } from '../utils/formatters'

type UserFormValues = {
  fullName: string
  email: string
  phoneNumber: string
}

export default function UserFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const userId = Number(id)
  const isEditing =
    id !== undefined &&
    Number.isInteger(userId) &&
    userId > 0

  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
    },
  })

  const loadUser = useCallback(async () => {
    if (!isEditing) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const user = await userService.getById(userId)

      reset({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber ?? '',
      })
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No fue posible cargar el usuario.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [isEditing, reset, userId])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  const onSubmit = async (formValues: UserFormValues) => {
    setIsSubmitting(true)
    setErrorMessage('')

    const userData = {
      fullName: formValues.fullName.trim(),
      email: formValues.email.trim(),
      phoneNumber:
        formValues.phoneNumber.trim() || null,
    }

    try {
      if (isEditing) {
        await userService.update(userId, userData)
      } else {
        await userService.create(userData)
      }

      navigate('/usuarios')
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isEditing
            ? 'No fue posible actualizar el usuario.'
            : 'No fue posible guardar el usuario.',
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
              ? 'Editar usuario'
              : 'Nuevo usuario'}
          </h1>

          <p>
            {isEditing
              ? 'Actualiza la información del usuario.'
              : 'Completa la información del nuevo usuario.'}
          </p>
        </div>

        <Link className="back-link" to="/usuarios">
          <ArrowLeft size={17} />
          Volver a usuarios
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
          <UserRound size={22} />
          <h2>Información del usuario</h2>
        </div>

        <div className="form-grid">
          <div className="form-field full-column">
            <label htmlFor="fullName">
              Nombre completo
            </label>

            <input
              id="fullName"
              type="text"
              maxLength={100}
              placeholder="Ingresa el nombre completo"
              className={
                errors.fullName ? 'invalid' : ''
              }
              {...register('fullName', {
                required:
                  'El nombre completo es obligatorio.',
                minLength: {
                  value: 3,
                  message:
                    'El nombre debe tener al menos 3 caracteres.',
                },
                maxLength: {
                  value: 100,
                  message:
                    'El nombre no puede superar los 100 caracteres.',
                },
              })}
            />

            {errors.fullName && (
              <span className="field-error">
                {errors.fullName.message}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              maxLength={150}
              placeholder="usuario@correo.com"
              className={errors.email ? 'invalid' : ''}
              {...register('email', {
                required:
                  'El correo electrónico es obligatorio.',
                pattern: {
                  value:
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message:
                    'Ingresa un correo electrónico válido.',
                },
                maxLength: {
                  value: 150,
                  message:
                    'El correo no puede superar los 150 caracteres.',
                },
              })}
            />

            {errors.email && (
              <span className="field-error">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="phoneNumber">
              Teléfono
            </label>

            <input
              id="phoneNumber"
              type="tel"
              maxLength={20}
              placeholder="809-000-0000"
              className={
                errors.phoneNumber ? 'invalid' : ''
              }
              {...register('phoneNumber', {
                pattern: {
                  value:
                    /^[0-9+\-()\s]{7,20}$/,
                  message:
                    'Ingresa un número de teléfono válido.',
                },
                maxLength: {
                  value: 20,
                  message:
                    'El teléfono no puede superar los 20 caracteres.',
                },
              })}
            />

            {errors.phoneNumber && (
              <span className="field-error">
                {errors.phoneNumber.message}
              </span>
            )}

            <span className="field-help">
              El teléfono es opcional.
            </span>
          </div>
        </div>

        <div className="form-actions">
          <Link
            className="secondary-button"
            to="/usuarios"
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
                : 'Guardar usuario'}
          </button>
        </div>
      </form>
    </section>
  )
}