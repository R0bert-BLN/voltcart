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
