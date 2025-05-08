"use server"

import { saveOrder } from "@/lib/orders"
import type { CartItem } from "@/lib/types"

export async function createOrder(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const cartItems = JSON.parse(formData.get("cartItems") as string) as CartItem[]

    if (!name || !phone || !cartItems || cartItems.length === 0) {
      return {
        success: false,
        message: "Información incompleta",
      }
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const order = saveOrder({
      customerName: name,
      customerPhone: phone,
      customerAddress: address || undefined,
      items: cartItems,
      total,
    })

    return {
      success: true,
      message: "Pedido creado correctamente",
      orderId: order.id,
    }
  } catch (error) {
    console.error("Error al crear el pedido:", error)
    return {
      success: false,
      message: "Error al procesar el pedido",
    }
  }
}
