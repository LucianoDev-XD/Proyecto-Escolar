import { useEffect, useState } from "react";
import { db, auth } from "../../services/Firebase.js";
import { onAuthStateChanged } from "firebase/auth"; // onAuthStateChanged ya es modular
import { doc, getDoc } from "firebase/firestore"; 
import { Link } from "react-router-dom";
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const ENCUESTA_CERRADA = false; // false si querés reabrir y true si quiere cerrar

function Home() {
  const [yaVoto, setYaVoto] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!ENCUESTA_CERRADA) {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const votoDoc = await getDoc(doc(db, "votos", user.uid));
            setYaVoto(votoDoc.exists());
          } catch (err) {
            console.error("Error verificando voto:", err);
          }
        }
        setCargando(false);
      });
      return () => unsub();
    } else {
      setCargando(false);
    }
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-lg space-y-6 rounded-lg bg-white p-6 text-center shadow-lg sm:p-8"
      >
        <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
          Bienvenido a la encuesta de la <span className="whitespace-nowrap">Expo-Tecnica 2025</span>
        </h2>
        <p className="text-sm text-gray-600 sm:text-base">
          ¿Qué Carrera te gusta más de la Escuela técnica?
        </p>
        <p className="pb-2 text-xs text-gray-500 sm:text-sm">
          La Encuesta solo tomará unos minutos
        </p>

        {/* 
          // BLOQUE PARA CUANDO LA ENCUESTA ESTÉ CERRADA
          // Para activarlo, cambia la constante ENCUESTA_CERRADA a 'true'
        */}
        {ENCUESTA_CERRADA 
          ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 rounded-lg bg-yellow-100 p-4 font-semibold text-yellow-800">
                  <FiAlertTriangle className="h-6 w-6" />
                  <span>La encuesta ya está cerrada.</span>
                </div>
                <Link
                  to="/resultados"
                  className="inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Ver resultados
                </Link>
              </div>
            ) 
          : (
              <>
                {yaVoto ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 rounded-lg bg-green-100 p-4 font-semibold text-green-800">
                      <FiCheckCircle className="h-6 w-6" />
                      <span>¡Gracias por participar! Ya has votado.</span>
                    </div>
                    <Link
                      to="/resultados"
                      className="inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Ver resultados
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/encuesta"
                    className="inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Iniciar encuesta
                  </Link>
                )}
              </>
            )
        }
      </div>
    </div>
  );
}

export default Home;
