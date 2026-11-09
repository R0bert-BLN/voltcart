import { cn } from 'cn'

export interface ContactBlockProps extends React.ComponentProps<'div'> {
  contact: {
    name: string
    email?: string
    phone: string
  }
  address: {
    line1: string
    city: string
    postcode: string
    country: string
  }
}

/** Contact and delivery address of an order from the mockup
    (MK.ui.contactBlock → .address-block): two small paragraphs, the contact
    details muted. */
export function ContactBlock({ contact, address, className, ...props }: ContactBlockProps) {
  return (
    <div
      data-slot="address-block"
      className={cn('flex flex-col gap-3 [overflow-wrap:anywhere]', className)}
      {...props}
    >
      <p>
        {contact.name}
        <br />
        <span className="text-text-muted">
          {contact.email ? (
            <>
              {contact.email}
              <br />
            </>
          ) : null}
          {contact.phone}
        </span>
      </p>
      <p>
        {address.line1}
        <br />
        {address.city} {address.postcode}
        <br />
        {address.country}
      </p>
    </div>
  )
}
