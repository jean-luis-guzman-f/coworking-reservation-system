import axios from 'axios'
import type { Payment, Reservation, Space, User } from '../types'

const api = axios.create({
  baseURL: 'https://localhost:7289/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const userService = {
  getAll: async () => {
    const response = await api.get<User[]>('/users')
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  },

  create: async (user: Omit<User, 'id' | 'createdAt'>) => {
    const response = await api.post<User>('/users', user)
    return response.data
  },

  update: async (
    id: number,
    user: Omit<User, 'id' | 'createdAt'>,
  ) => {
    await api.put(`/users/${id}`, user)
  },

  remove: async (id: number) => {
    await api.delete(`/users/${id}`)
  },
}

export const spaceService = {
  getAll: async () => {
    const response = await api.get<Space[]>('/spaces')
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<Space>(`/spaces/${id}`)
    return response.data
  },

  create: async (space: Omit<Space, 'id' | 'createdAt'>) => {
    const response = await api.post<Space>('/spaces', space)
    return response.data
  },

  update: async (
    id: number,
    space: Omit<Space, 'id' | 'createdAt'>,
  ) => {
    await api.put(`/spaces/${id}`, space)
  },

  remove: async (id: number) => {
    await api.delete(`/spaces/${id}`)
  },
}

export const reservationService = {
  getAll: async () => {
    const response = await api.get<Reservation[]>('/reservations')
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<Reservation>(`/reservations/${id}`)
    return response.data
  },

  create: async (
    reservation: Omit<Reservation, 'id' | 'createdAt'>,
  ) => {
    const response = await api.post<Reservation>(
      '/reservations',
      reservation,
    )
    return response.data
  },

  update: async (
    id: number,
    reservation: Omit<Reservation, 'id' | 'createdAt'>,
  ) => {
    await api.put(`/reservations/${id}`, reservation)
  },

  remove: async (id: number) => {
    await api.delete(`/reservations/${id}`)
  },
}

export const paymentService = {
  getAll: async () => {
    const response = await api.get<Payment[]>('/payments')
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<Payment>(`/payments/${id}`)
    return response.data
  },

  create: async (
    payment: Omit<Payment, 'id' | 'paymentDate'>,
  ) => {
    const response = await api.post<Payment>('/payments', payment)
    return response.data
  },

  update: async (
    id: number,
    payment: Omit<Payment, 'id' | 'paymentDate'>,
  ) => {
    await api.put(`/payments/${id}`, payment)
  },

  remove: async (id: number) => {
    await api.delete(`/payments/${id}`)
  },
}

export default api