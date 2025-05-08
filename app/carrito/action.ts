"use server"

import { cookies } from "next/headers"

export async function createOrder(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const cartItems = formData.get("cartItems") as string

    if (!name || !phone || !cartItems) {
      return {
        success: false,
        message: "Información incompleta",
      }
    }

    // Crear un ID único para el pedido
    const orderId = `order-${Date.now()}`

    // Crear el objeto de pedido
    const order = {
      id: orderId,
      customerName: name,
      customerPhone: phone,
      customerAddress: address || undefined,
      items: JSON.parse(cartItems),
      total: JSON.parse(cartItems).reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    // Almacenar el pedido en una cookie para que el cliente pueda acceder a él
    // Esto es temporal, en una aplicación real usaríamos una base de datos
    const existingOrdersCookie = cookies().get("orders")?.value
    const existingOrders = existingOrdersCookie ? JSON.parse(existingOrdersCookie) : []
    const updatedOrders = [...existingOrders, order]

    // Guardar en cookies
    cookies().set("orders", JSON.stringify(updatedOrders), {
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: "/",
    })

    return {
      success: true,
      message: "Pedido creado correctamente",
      orderId: orderId,
    }
  } catch (error) {
    console.error("Error al crear el pedido:", error)
    return {
      success: false,
      message: "Error al procesar el pedido",
    }
  }
}
