import { Link } from "react-router-dom"
import { FiCheckCircle } from "react-icons/fi"

function YaVotaste() {
  return (
    <div className="flex min-h-[523px] items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 text-center shadow-xl">
        {/* Icono */}
        <div className="flex justify-center">
          <FiCheckCircle className="h-16 w-16 text-green-500" />
        </div>

        {/* Título y Mensaje */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            ¡Gracias por participar!
          </h1>
          <p className="mt-2 text-gray-600">
            Tu voto fue registrado correctamente.
          </p>
        </div>

        {/* Botón */}
        <div className="pt-4">
          <Link
            to="/resultados"
            className="inline-block rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Ver Resultados
          </Link>
        </div>
      </div>
    </div>
  )
}

export default YaVotaste
