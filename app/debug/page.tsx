"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    // Cargar datos del localStorage
    const loadData = () => {
      try {
        const savedOrders = localStorage.getItem("orders")
        const savedCart = localStorage.getItem("cart")

        setOrders(savedOrders ? JSON.parse(savedOrders) : [])
        setCart(savedCart ? JSON.parse(savedCart) : [])
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }

    loadData()
  }, [])

  const clearOrders = () => {
    localStorage.removeItem("orders")
    setOrders([])
  }

  const clearCart = () => {
    localStorage.removeItem("cart")
    setCart([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Página de Depuración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Pedidos en localStorage</span>
              <Button variant="destructive" size="sm" onClick={clearOrders}>
                Limpiar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">{JSON.stringify(orders, null, 2)}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Carrito en localStorage</span>
              <Button variant="destructive" size="sm" onClick={clearCart}>
                Limpiar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">{JSON.stringify(cart, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={() => window.location.reload()}>Actualizar Datos</Button>
      </div>
    </div>
  )
}
