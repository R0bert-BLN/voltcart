import { Link, type LinkProps } from '@tanstack/react-router'

export interface AppLinkProps extends Omit<React.ComponentProps<'a'>, 'href'> {
  href: string
}

export function AppLink({ href, children, ...props }: AppLinkProps) {
  return (
    <Link to={href as LinkProps['to']} {...props}>
      {children}
    </Link>
  )
}
