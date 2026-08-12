import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { userService } from '../services/api'
import type { User } from '../types'
import {
  formatDate,
  getApiErrorMessage,
} from '../utils/formatters'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [userToDelete, setUserToDelete] =
    useState<User | null>(null)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await userService.getAll()
      setUsers(response)
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No fue posible cargar los usuarios. Verifica que la API esté ejecutándose.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

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
    if (!userToDelete) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && deletingId === null) {
        setUserToDelete(null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [userToDelete, deletingId])

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return users
    }

    return users.filter((user) => {
      const phoneNumber = user.phoneNumber ?? ''

      return (
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        phoneNumber.toLowerCase().includes(term)
      )
    })
  }, [searchTerm, users])

  const handleDelete = async () => {
    if (!userToDelete) {
      return
    }

    const user = userToDelete

    setDeletingId(user.id)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await userService.remove(user.id)

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) => currentUser.id !== user.id,
        ),
      )

      setUserToDelete(null)
      setSuccessMessage(
        'El usuario fue eliminado correctamente.',
      )
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No fue posible eliminar el usuario. Puede tener reservas asociadas.',
        ),
      )

      setUserToDelete(null)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Usuarios</h1>

          <p>
            Administra los usuarios registrados en CoWorka.
          </p>
        </div>

        <Link
          className="primary-button"
          to="/usuarios/nuevo"
        >
          <Plus size={18} />
          Nuevo usuario
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
            onClick={() => void loadUsers()}
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
              placeholder="Buscar usuario"
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
            <p>Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="list-state">
            <Users size={38} />

            <h2>
              {users.length === 0
                ? 'No hay usuarios registrados'
                : 'No encontramos resultados'}
            </h2>

            <p>
              {users.length === 0
                ? 'Registra el primer usuario de CoWorka.'
                : 'Prueba utilizando otro término de búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table users-table">
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Correo electrónico</th>
                  <th>Teléfono</th>
                  <th>Fecha de registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="table-primary">
                        {user.fullName}
                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      {user.phoneNumber || 'Sin teléfono'}
                    </td>

                    <td>{formatDate(user.createdAt)}</td>

                    <td>
                      <div className="table-actions">
                        <Link
                          className="action-button edit-button"
                          to={`/usuarios/${user.id}/editar`}
                        >
                          <Edit3 size={15} />
                          Editar
                        </Link>

                        <button
                          className="action-button delete-button"
                          type="button"
                          disabled={deletingId === user.id}
                          onClick={() =>
                            setUserToDelete(user)
                          }
                        >
                          <Trash2 size={15} />

                          {deletingId === user.id
                            ? 'Eliminando'
                            : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {userToDelete && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              deletingId === null
            ) {
              setUserToDelete(null)
            }
          }}
        >
          <div
            className="confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
          >
            <div className="modal-icon danger">
              <Trash2 size={28} />
            </div>

            <h2 id="delete-user-title">
              Eliminar usuario
            </h2>

            <p>
              ¿Seguro que deseas eliminar al usuario{' '}
              <strong>{userToDelete.fullName}</strong>?
            </p>

            <p>
              Esta acción no se puede deshacer. Un usuario con
              reservas asociadas no podrá eliminarse.
            </p>

            <div className="modal-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={deletingId !== null}
                onClick={() => setUserToDelete(null)}
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
                  : 'Eliminar usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}