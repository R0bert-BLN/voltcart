import { icons } from 'lucide-react'

export type IconName = keyof typeof icons

const toPascalCase = (name: string): string =>
  name.replace(/(^|[-_])(\w)/g, (_, _separator: string, character: string) => character.toUpperCase())

export const toIconName = (name: string): IconName => {
  const pascal = toPascalCase(name)
  return pascal in icons ? (pascal as IconName) : 'CircleQuestionMark'
}
