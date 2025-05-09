import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-amber-800 text-amber-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative w-16 h-16">
              <Image src="/logo-arepa.png" alt="Logo" width={64} height={64} className="object-contain" />
            </div>
            <span className="text-2xl font-bold">Empanadas & Arepas</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Sobre Nosotros</h3>
            <p className="mb-2">Los mejores sabores tradicionales</p>
            <p>Hechos con ingredientes frescos y de calidad</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Horario</h3>
            <p className="mb-2">Martes y Jueves: 7:00 PM - 9:00 PM</p>
            <p>Domingos: 7:00 AM - 11:00 AM</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <p>Teléfono: +57 302 2346701</p>
          </div>
        </div>

        <div className="border-t border-amber-700 mt-8 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} Empanadas & Arepas. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
