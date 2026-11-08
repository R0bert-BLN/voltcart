const eur = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })

/** Money is integer cents everywhere; this is the only place it becomes text. */
export const formatPrice = (cents: number): string => eur.format(cents / 100)

/** ISO date, as the demo data keeps it, in the mockup's short form (MK.date). */
const dateFmt = new Intl.DateTimeFormat('en-IE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export const formatDate = (iso: string): string => dateFmt.format(new Date(`${iso}T12:00:00`))

/** A full ISO timestamp, as the API keeps created_at and estimated_at, in the
    same short form; read in UTC, so the date never rolls over a timezone. */
const stampFmt = new Intl.DateTimeFormat('en-IE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export const formatTimestamp = (iso: string): string => stampFmt.format(new Date(iso))
