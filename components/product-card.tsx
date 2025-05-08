"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [withDrink, setWithDrink] = useState(false)

  const handleAddToCart = () => {
    addToCart({
      ...product,
      withDrink,
      price: withDrink ? product.priceWithDrink : product.price,
    })

    toast({
      title: "Producto añadido",
      description: `${product.name} ha sido añadido al carrito`,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={product.category === "arepa"}
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-amber-900">{product.name}</h3>
          <span className="font-bold text-amber-600">
            ${withDrink ? product.priceWithDrink.toLocaleString() : product.price.toLocaleString()}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4">{product.description}</p>

        {product.hasDrinkOption && (
          <div className="flex items-center space-x-2 mb-4">
            <Switch id={`drink-${product.id}`} checked={withDrink} onCheckedChange={setWithDrink} />
            <Label htmlFor={`drink-${product.id}`}>Con gaseosa (+$1,000)</Label>
          </div>
        )}

        <Button onClick={handleAddToCart} className="w-full bg-orange-500 hover:bg-orange-600">
          Añadir al Carrito
        </Button>
      </div>
    </div>
  )
}
