import type { CartLineData } from '@/api/generated/types'
import { Button } from '@/components/common/button'
import { PageHead } from '@/components/common/page-head'
import { ProductCell } from '@/components/common/product-cell'
import { Stepper } from '@/components/client/stepper'
import { StockBadge } from '@/components/common/stock-badge'
import { Table } from '@/components/common/table'
import { Totals } from '@/components/client/totals'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { EmptyCartState } from '@/components/views/common/states'
import { formatPrice, plural } from '@/lib/format'

export interface CartRow {
  line: CartLineData
  stock: number
  categoryId: string | null
}

export interface CartViewProps {
  rows: CartRow[]
  subtotalCents: number
  estimatedDeliveryCents: number | null
  onQuantityChange: (line: CartLineData, quantity: number) => void
  onRemove: (line: CartLineData) => void
  onMoveToWishlist: (line: CartLineData) => void
}

const LOW_STOCK_LIMIT = 5

const COLUMNS = [
  { label: 'Product' },
  { label: 'Unit price', num: true },
  { label: 'Quantity' },
  { label: 'Total', num: true },
  { label: 'Remove' },
]

const REMOVE_BUTTON_CLASS =
  'grid size-(--control) place-items-center rounded-(--radius-md) text-(--text-muted) outline-none hover:bg-(--surface-2) hover:text-text focus-visible:ring-2 focus-visible:ring-(--focus)'

const TEXT_BUTTON_CLASS =
  'text-sm text-(--text-muted) underline-offset-4 outline-none hover:text-text hover:underline focus-visible:underline'

export function CartView({
  rows,
  subtotalCents,
  estimatedDeliveryCents,
  onQuantityChange,
  onRemove,
  onMoveToWishlist,
}: CartViewProps) {
  const tableRows = rows.map(({ line, stock, categoryId }) => [
    <ProductCell
      key="product"
      product={{ id: line.productId, name: line.name, categoryId }}
      href={`/products/${line.productId}`}
      sub={
        <>
          {stock <= LOW_STOCK_LIMIT ? <StockBadge product={{ stock }} /> : null}
          <button type="button" onClick={() => onMoveToWishlist(line)} className={TEXT_BUTTON_CLASS}>
            Move to wish list
          </button>
        </>
      }
    />,
    <span key="unit-price" className="tabular-nums">
      {formatPrice(line.priceCents)}
    </span>,
    stock > 0 ? (
      <Stepper
        key="quantity"
        value={line.quantity}
        min={1}
        max={stock}
        label={`Quantity of ${line.name}`}
        onValueChange={(quantity) => onQuantityChange(line, quantity)}
      />
    ) : (
      <span key="quantity" className="text-(--text-muted)">
        None available
      </span>
    ),
    <span key="line-total" data-line-total={line.productId} className="tabular-nums">
      {formatPrice(line.lineTotalCents)}
    </span>,
    <button
      key="remove"
      type="button"
      data-remove={line.productId}
      aria-label={`Remove ${line.name} from the cart`}
      className={REMOVE_BUTTON_CLASS}
      onClick={() => onRemove(line)}
    >
      <Icon name="Trash" />
    </button>,
  ])

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead title="Your cart" subtitle={plural(rows.length, 'item')} />
      {rows.length === 0 ? (
        <EmptyCartState />
      ) : (
        <div className="grid items-start gap-(--sp-6) lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Table columns={COLUMNS} rows={tableRows} />
          <aside aria-label="Order summary">
            <Card className="gap-4">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <Totals
                subtotal={subtotalCents}
                delivery={estimatedDeliveryCents}
                deliveryLabel="Estimated delivery"
              />
              <Button label="Continue to checkout" variant="block" href="/checkout/details" />
              <Button label="Continue shopping" variant="ghost block" href="/products" />
            </Card>
          </aside>
        </div>
      )}
    </div>
  )
}
