import { products } from "@/lib/products"
import ProductCard from "@/components/product-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProductosPage() {
  const empanadas = products.filter((p) => p.category === "empanada")
  const pasteles = products.filter((p) => p.category === "pastel")
  const arepas = products.filter((p) => p.category === "arepa")

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-amber-900">Nuestro Menú</h1>

      <Tabs defaultValue="todos" className="mb-8">
        <TabsList className="bg-amber-100">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="empanadas">Empanadas</TabsTrigger>
          <TabsTrigger value="pasteles">Pasteles</TabsTrigger>
          <TabsTrigger value="arepas">Arepas</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="empanadas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {empanadas.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pasteles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {pasteles.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="arepas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {arepas.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
