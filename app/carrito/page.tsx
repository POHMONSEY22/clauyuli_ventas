"use client"

import type React from "react"

import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { createOrder } from "./action"

export default function CarritoPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerInfo((prev) => ({ ...prev, [name]: value }))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Información requerida",
        description: "Por favor completa tu nombre y teléfono para continuar.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", customerInfo.name)
      formData.append("phone", customerInfo.phone)
      formData.append("address", customerInfo.address || "")
      formData.append("cartItems", JSON.stringify(cart))

      const result = await createOrder(formData)

      if (result.success) {
        toast({
          title: "¡Pedido realizado!",
          description: "Tu pedido ha sido recibido y será procesado pronto.",
        })
        clearCart()
        router.push("/gracias")
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al procesar el pedido:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar tu pedido. Por favor intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-6 text-amber-900">Tu Carrito</h1>
        <p className="text-lg mb-6">Tu carrito está vacío</p>
        <Button onClick={() => router.push("/productos")} className="bg-orange-500 hover:bg-orange-600">
          Ver Productos
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-amber-900">Tu Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.map((item) => (
            <div
              key={`${item.id}-${item.withDrink ? "drink" : "no-drink"}`}
              className="flex items-center border-b py-4"
            >
              <div className="w-20 h-20 relative mr-4">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover rounded" />
              </div>

              <div className="flex-grow">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                {item.withDrink && <p className="text-sm text-amber-600">Con gaseosa</p>}
              </div>

              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item, Math.max(1, item.quantity - 1))}
                  className="h-8 w-8"
                >
                  -
                </Button>
                <span className="mx-2">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item, item.quantity + 1)}
                  className="h-8 w-8"
                >
                  +
                </Button>
              </div>

              <div className="ml-4 text-right">
                <p className="font-semibold">${(item.price * item.quantity).toLocaleString()}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item)}
                  className="text-red-500 h-8 w-8"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>

          <div className="mb-4">
            <p className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </p>
            <p className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${subtotal.toLocaleString()}</span>
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <Input
                name="name"
                value={customerInfo.name}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <Input
                name="phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                placeholder="Tu número de teléfono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dirección (opcional)</label>
              <Input
                name="address"
                value={customerInfo.address}
                onChange={handleInputChange}
                placeholder="Dirección de entrega"
              />
            </div>
          </div>

          <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleCheckout} disabled={isSubmitting}>
            {isSubmitting ? "Procesando..." : "Realizar Pedido"}
          </Button>
        </div>
      </div>
    </div>
  )
}
