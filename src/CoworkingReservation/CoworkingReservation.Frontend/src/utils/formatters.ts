export const formatCurrency = (amount: number) =>
  `RD$ ${new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))

export const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))

export const toDateTimeLocal = (date: string) => {
  const value = new Date(date)
  const offset = value.getTimezoneOffset()
  const localDate = new Date(value.getTime() - offset * 60_000)

  return localDate.toISOString().slice(0, 16)
}

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Ocurrió un error inesperado.',
) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: { data?: unknown }
      }
    ).response

    if (typeof response?.data === 'string') {
      return response.data
    }
  }

  return fallback
}