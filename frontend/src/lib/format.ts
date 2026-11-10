const eur = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })

const dateFmt = new Intl.DateTimeFormat('en-IE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const stampFmt = new Intl.DateTimeFormat('en-IE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export const formatPrice = (cents: number): string => eur.format(cents / 100)

export const formatDeliveryPrice = (cents: number): string =>
  cents > 0 ? formatPrice(cents) : 'Free'

export const formatDate = (iso: string): string => dateFmt.format(new Date(`${iso}T12:00:00`))

export const formatTimestamp = (iso: string): string => stampFmt.format(new Date(iso))

export const plural = (count: number, word: string): string =>
  `${count} ${word}${count === 1 ? '' : 's'}`

export const firstName = (fullName: string): string => fullName.split(' ')[0] ?? ''
