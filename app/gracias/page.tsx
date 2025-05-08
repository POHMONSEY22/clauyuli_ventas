import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GraciasPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4 text-amber-900">¡Gracias por tu pedido!</h1>
      <p className="text-lg mb-8">
        Hemos recibido tu pedido correctamente. Te contactaremos pronto para confirmar los detalles.
      </p>
      <Link href="/">
        <Button className="bg-orange-500 hover:bg-orange-600">Volver al Inicio</Button>
      </Link>
    </div>
  )
}
