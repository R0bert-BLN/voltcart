const eur = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })

/** Money is integer cents everywhere; this is the only place it becomes text. */
export const formatPrice = (cents: number): string => eur.format(cents / 100)
