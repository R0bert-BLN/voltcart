import { useEffect, useRef, useState } from 'react'

import type { ProductInput } from '@/api/queries/admin/catalogue'
import { focusField } from '@/lib/focus'
import {
  readProductForm,
  type ProductFormErrors,
  type ProductFormField,
} from '@/lib/admin/product-form'

export function useProductForm(onValid: (input: ProductInput) => void) {
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [deliveryError, setDeliveryError] = useState<string | undefined>()
  const pendingFocus = useRef<ProductFormField | null>(null)

  useEffect(() => {
    if (pendingFocus.current === null) return
    focusField(pendingFocus.current)
    pendingFocus.current = null
  }, [errors, deliveryError])

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    if (target.name === 'deliveryIds' && target.checked) setDeliveryError(undefined)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = readProductForm(event.currentTarget)

    if (result.valid) {
      setErrors({})
      setDeliveryError(undefined)
      onValid(result.input)
      return
    }

    pendingFocus.current = result.firstInvalid
    setErrors(result.errors)
    setDeliveryError(result.deliveryError)
  }

  return { errors, deliveryError, handleChange, handleSubmit }
}
