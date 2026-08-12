export interface User {
  id: number
  fullName: string
  email: string
  phoneNumber: string | null
  createdAt: string
}

export interface Space {
  id: number
  name: string
  description: string | null
  type: SpaceType
  capacity: number
  hourlyRate: number
  isAvailable: boolean
  createdAt: string
}

export interface Reservation {
  id: number
  userId: number
  spaceId: number
  startTime: string
  endTime: string
  status: ReservationStatus
  totalAmount: number
  createdAt: string
}

export interface Payment {
  id: number
  reservationId: number
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionReference: string | null
  paymentDate: string
}

export type SpaceType = 'Desk' | 'MeetingRoom'

export type ReservationStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Cancelled'
  | 'Completed'

export type PaymentMethod =
  | 'Cash'
  | 'Card'
  | 'Transfer'

export type PaymentStatus =
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Refunded'