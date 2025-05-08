"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { getOrders, getSalesStats, updateOrderStatus } from "@/lib/orders"
import { logoutAdmin } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { products } from "@/lib/products"
import type { Order } from "@/lib/orders"

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<any>(null)
  const router = useRouter()

  // Función para cargar datos
  const loadData = () => {
    try {
      const allOrders = getOrders()
      setOrders(allOrders)
      setStats(getSalesStats())
      console.log("Pedidos cargados:", allOrders.length)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    }
  }

  useEffect(() => {
    // Cargar datos iniciales
    loadData()

    // Configurar un intervalo para actualizar datos cada 10 segundos
    const interval = setInterval(loadData, 10000)

    // Configurar un evento para actualizar cuando el usuario regrese a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Limpiar
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const handleLogout = () => {
    logoutAdmin()
    router.push("/admin/login")
  }

  const handleStatusChange = (orderId: string, status: Order["status"]) => {
    updateOrderStatus(orderId, status)
    loadData() // Recargar datos inmediatamente
  }

  const getProductNameById = (id: string) => {
    const product = products.find((p) => p.id === id)
    return product ? product.name : id
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={loadData}>
            Actualizar Datos
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Pedidos ({orders.length})</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.totalSales?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Completados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats?.totalOrders ? Math.round(stats.totalSales / stats.totalOrders).toLocaleString() : 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ventas por Día</CardTitle>
                <CardDescription>Últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {stats?.salesByDay && stats.salesByDay.length > 0 ? (
                    <div className="space-y-4">
                      {stats.salesByDay.map((day: any) => (
                        <div key={day.date} className="flex justify-between items-center">
                          <div className="font-medium">{day.date}</div>
                          <div className="flex items-center">
                            <span className="mr-4">{day.orders} pedidos</span>
                            <span className="font-bold">${day.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No hay datos de ventas disponibles</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productos Más Vendidos</CardTitle>
                <CardDescription>Por cantidad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.productSales && Object.keys(stats.productSales).length > 0 ? (
                    Object.entries(stats.productSales)
                      .sort(([, a]: [string, any], [, b]: [string, any]) => b.quantity - a.quantity)
                      .slice(0, 5)
                      .map(([productId, data]: [string, any]) => (
                        <div key={productId} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{getProductNameById(productId)}</div>
                            <div className="text-sm text-muted-foreground">${data.revenue.toLocaleString()}</div>
                          </div>
                          <div className="font-bold">{data.quantity} unidades</div>
                        </div>
                      ))
                  ) : (
                    <p className="text-muted-foreground">No hay datos de productos vendidos</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Pedidos</CardTitle>
              <CardDescription>Gestiona los pedidos y actualiza su estado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {orders.length === 0 ? (
                  <p className="text-center py-4">No hay pedidos registrados</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold">Pedido #{order.id.split("-")[1]}</h3>
                          <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <Badge
                          className={
                            order.status === "completed"
                              ? "bg-green-500"
                              : order.status === "cancelled"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }
                        >
                          {order.status === "completed"
                            ? "Completado"
                            : order.status === "cancelled"
                              ? "Cancelado"
                              : "Pendiente"}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <p>
                          <strong>Cliente:</strong> {order.customerName}
                        </p>
                        <p>
                          <strong>Teléfono:</strong> {order.customerPhone}
                        </p>
                        {order.customerAddress && (
                          <p>
                            <strong>Dirección:</strong> {order.customerAddress}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Productos:</h4>
                        <ul className="space-y-2">
                          {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span>
                                {item.quantity}x {item.name}
                                {item.withDrink && " (con gaseosa)"}
                              </span>
                              <span>${(item.price * item.quantity).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                          <span>Total:</span>
                          <span>${order.total.toLocaleString()}</span>
                        </div>
                      </div>

                      {order.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleStatusChange(order.id, "completed")}
                          >
                            Completar
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-500 border-red-500 hover:bg-red-50"
                            onClick={() => handleStatusChange(order.id, "cancelled")}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Productos</CardTitle>
              <CardDescription>Listado de todos los productos disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <div className="mt-2">
                      <p>
                        <strong>Precio:</strong> ${product.price.toLocaleString()}
                      </p>
                      {product.hasDrinkOption && (
                        <p>
                          <strong>Con gaseosa:</strong> ${product.priceWithDrink.toLocaleString()}
                        </p>
                      )}
                      <p>
                        <strong>Categoría:</strong> {product.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
