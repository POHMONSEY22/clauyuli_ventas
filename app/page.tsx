import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import { products } from "@/lib/products"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="bg-amber-100 rounded-lg p-6 mb-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">¡Deliciosas Empanadas, Pasteles y Arepas!</h1>
        <p className="text-lg text-amber-800">Los mejores sabores tradicionales, hechos con ingredientes frescos.</p>
        <div className="mt-4">
          <Link href="/productos">
            <Button className="bg-orange-500 hover:bg-orange-600">Ver Menú Completo</Button>
          </Link>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-amber-900">Nuestros Productos Destacados</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.slice(0, 3).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/productos">
          <Button className="bg-orange-500 hover:bg-orange-600">Ver Todos los Productos</Button>
        </Link>
      </div>
    </main>
  )
}
