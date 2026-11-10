export interface CheckoutDetails {
  name: string
  email: string
  phone: string
  line1: string
  city: string
  postcode: string
  country: string
  deliveryId: string
  payment: 'card' | 'cod'
  last4?: string
}

const STORAGE_KEY = 'voltcart.checkout'

export function readDetails(): CheckoutDetails | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw === null ? null : (JSON.parse(raw) as CheckoutDetails)
  } catch {
    return null
  }
}

export function saveDetails(details: CheckoutDetails): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details))
  } catch {
    return
  }
}

export function clearDetails(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}
