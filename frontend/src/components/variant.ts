/** The variant flags of the mockup buttons (MK.ui.button / MK.ui.submit):
    combinable words like "secondary block". */
export type MockupVariantFlag = 'secondary' | 'ghost' | 'danger' | 'block'

/** Empty string means the default button variant. */
export type MockupVariant =
  | ''
  | MockupVariantFlag
  | `${MockupVariantFlag} ${MockupVariantFlag}`
  | `${MockupVariantFlag} ${MockupVariantFlag} ${MockupVariantFlag}`

type PrimitiveVariant = 'default' | 'secondary' | 'ghost' | 'destructive'

const toPrimitiveTone = (flag: string): PrimitiveVariant =>
  flag === 'danger'
    ? 'destructive'
    : flag === 'secondary'
      ? 'secondary'
      : flag === 'ghost'
        ? 'ghost'
        : 'default'

/** Splits the combinable mockup flags into the primitive colour variant and
    the block flag; unknown flags fall back to the default variant. */
export const parseVariant = (variant: string): { primitive: PrimitiveVariant; block: boolean } => {
  const flags = variant ? variant.split(/\s+/).filter(Boolean) : []

  return {
    primitive: toPrimitiveTone(flags.find((flag) => flag !== 'block') ?? ''),
    block: flags.includes('block'),
  }
}
