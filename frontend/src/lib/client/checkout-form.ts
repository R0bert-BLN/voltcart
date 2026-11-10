import type { CheckoutDetails } from '@/lib/client/checkout'

type RequiredField = 'name' | 'email' | 'phone' | 'line1' | 'city' | 'postcode' | 'country'

export type CheckoutErrors = Partial<Record<RequiredField | 'cardNumber', string>>

export type CheckoutFormResult =
  | { valid: true; details: CheckoutDetails }
  | { valid: false; errors: CheckoutErrors }

const REQUIRED_FIELDS: ReadonlyArray<{ name: RequiredField; message: string }> = [
  { name: 'name', message: 'Enter your full name.' },
  { name: 'email', message: 'Enter your email address.' },
  { name: 'phone', message: 'Enter a phone number.' },
  { name: 'line1', message: 'Enter your address.' },
  { name: 'city', message: 'Enter your city.' },
  { name: 'postcode', message: 'Enter your postcode.' },
  { name: 'country', message: 'Enter your country.' },
]

const LAST_DIGITS = 4

export function readCheckoutForm(
  data: FormData,
  choice: Pick<CheckoutDetails, 'deliveryId' | 'payment'>,
  saved: CheckoutDetails | null,
): CheckoutFormResult {
  const value = (name: string) => String(data.get(name) ?? '').trim()

  const errors: CheckoutErrors = {}
  for (const { name, message } of REQUIRED_FIELDS) {
    if (value(name) === '') errors[name] = message
  }
  const cardNumber = value('cardNumber')
  if (choice.payment === 'card' && cardNumber === '') errors.cardNumber = 'Enter the card number.'

  if (Object.keys(errors).length > 0) return { valid: false, errors }

  const last4 =
    choice.payment === 'card'
      ? cardNumber.replace(/\D/g, '').slice(-LAST_DIGITS) || saved?.last4 || undefined
      : undefined

  return {
    valid: true,
    details: {
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      line1: value('line1'),
      city: value('city'),
      postcode: value('postcode'),
      country: value('country'),
      deliveryId: choice.deliveryId,
      payment: choice.payment,
      last4,
    },
  }
}
