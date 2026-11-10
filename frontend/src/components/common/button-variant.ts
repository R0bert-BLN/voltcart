export type ButtonFlag = 'secondary' | 'ghost' | 'danger' | 'block'

export type ButtonVariant =
  | ''
  | ButtonFlag
  | `${ButtonFlag} ${ButtonFlag}`
  | `${ButtonFlag} ${ButtonFlag} ${ButtonFlag}`

type PrimitiveVariant = 'default' | 'secondary' | 'ghost' | 'destructive'

const PRIMITIVE_BY_FLAG: Record<string, PrimitiveVariant> = {
  danger: 'destructive',
  secondary: 'secondary',
  ghost: 'ghost',
}

export const parseVariant = (variant: string): { primitive: PrimitiveVariant; block: boolean } => {
  const flags = variant.split(/\s+/).filter(Boolean)
  const tone = flags.find((flag) => flag !== 'block')

  return {
    primitive: (tone && PRIMITIVE_BY_FLAG[tone]) || 'default',
    block: flags.includes('block'),
  }
}
