import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Warehouse,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { spaceService } from '../services/api'
import type { Space } from '../types'
import {
  formatCurrency,
  getApiErrorMessage,
} from '../utils/formatters'

const spaceTypeLabels: Record<string, string> = {
  Desk: 'Escritorio',
  MeetingRoom: 'Sala de reuniones',
}

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [spaceToDelete, setSpaceToDelete] =
    useState<Space | null>(null)

  const loadSpaces = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await spaceService.getAll()
      setSpaces(response)
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No fue posible cargar los espacios. Verifica que la API esté ejecutándose.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSpaces()
  }, [loadSpaces])

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
    if (!spaceToDelete) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && deletingId === null) {
        setSpaceToDelete(null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [deletingId, spaceToDelete])

  const filteredSpaces = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return spaces
    }

    return spaces.filter((space) => {
      const typeLabel =
        spaceTypeLabels[space.type] ?? space.type

      return (
        space.name.toLowerCase().includes(term) ||
        typeLabel.toLowerCase().includes(term) ||
        space.description?.toLowerCase().includes(term)
      )
    })
  }, [searchTerm, spaces])

  const handleDelete = async () => {
    if (!spaceToDelete) {
      return
    }

    const space = spaceToDelete

    setDeletingId(space.id)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await spaceService.remove(space.id)

      setSpaces((currentSpaces) =>
        currentSpaces.filter(
          (currentSpace) => currentSpace.id !== space.id,
        ),
      )

      setSpaceToDelete(null)
      setSuccessMessage(
        'El espacio fue eliminado correctamente.',
      )
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No fue posible eliminar el espacio.',
        ),
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Espacios</h1>
          <p>
            Administra los espacios de trabajo disponibles.
          </p>
        </div>

        <Link className="primary-button" to="/espacios/nuevo">
          <Plus size={18} />
          Nuevo espacio
        </Link>
      </header>

      {successMessage && (
        <div className="alert alert-success" role="status">
          {successMessage}
        </div>
      )}

      {errorMessage && !isLoading && (
        <div className="alert alert-error" role="alert">
          <span>{errorMessage}</span>

          <button
            type="button"
            onClick={() => void loadSpaces()}
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
              placeholder="Buscar espacio"
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
            <p>Cargando espacios...</p>
          </div>
        ) : filteredSpaces.length === 0 ? (
          <div className="list-state">
            <Warehouse size={38} />

            <h2>
              {spaces.length === 0
                ? 'No hay espacios registrados'
                : 'No encontramos resultados'}
            </h2>

            <p>
              {spaces.length === 0
                ? 'Registra el primer espacio disponible en CoWorka.'
                : 'Prueba utilizando otro término de búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Capacidad</th>
                  <th>Tarifa por hora</th>
                  <th>Disponible</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredSpaces.map((space) => (
                  <tr key={space.id}>
                    <td>
                      <div className="table-primary">
                        {space.name}
                      </div>

                      {space.description && (
                        <div className="table-secondary">
                          {space.description}
                        </div>
                      )}
                    </td>

                    <td>
                      {spaceTypeLabels[space.type] ??
                        space.type}
                    </td>

                    <td>{space.capacity}</td>

                    <td>
                      {formatCurrency(space.hourlyRate)}
                    </td>

                    <td>
                      <span
                        className={`availability-badge ${
                          space.isAvailable
                            ? 'available'
                            : 'unavailable'
                        }`}
                      >
                        {space.isAvailable ? 'Sí' : 'No'}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <Link
                          className="action-button edit-button"
                          to={`/espacios/${space.id}/editar`}
                        >
                          <Edit3 size={15} />
                          Editar
                        </Link>

                        <button
                          className="action-button delete-button"
                          type="button"
                          disabled={deletingId === space.id}
                          onClick={() =>
                            setSpaceToDelete(space)
                          }
                        >
                          <Trash2 size={15} />
                          {deletingId === space.id
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

      {spaceToDelete && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              deletingId === null
            ) {
              setSpaceToDelete(null)
            }
          }}
        >
          <div
            className="confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-space-title"
          >
            <div className="modal-icon">
              <Trash2 size={25} />
            </div>

            <h2 id="delete-space-title">
              Eliminar espacio
            </h2>

            <p>
              ¿Seguro que deseas eliminar el espacio{' '}
              <strong>{spaceToDelete.name}</strong>? Esta
              acción no se puede deshacer.
            </p>

            <div className="modal-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={deletingId !== null}
                onClick={() => setSpaceToDelete(null)}
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
                  : 'Eliminar espacio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}