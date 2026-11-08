/** The checkout's details (mockup MK.checkout): the contact, the address and
    the payment choices the Delivery and payment form keeps for the Review
    order step after it. sessionStorage keeps them for the browser session;
    the digits of the card never leave the form, only the last 4. */

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
  /* Only the last digits are kept from the card number, for the hint. */
  last4?: string
}

const STORAGE_KEY = 'voltcart.checkout'

/** The details saved earlier in this session, or null when none are. */
export function readDetails(): CheckoutDetails | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw === null ? null : (JSON.parse(raw) as CheckoutDetails)
  } catch {
    return null
  }
}

/** Keeps the details the form reviewed (mockup MK.checkout.save). */
export function saveDetails(details: CheckoutDetails): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details))
  } catch {
    /* memory only */
  }
}

/** Drops the kept details: the order they belong to went in. */
export function clearDetails(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* memory only */
  }
}
