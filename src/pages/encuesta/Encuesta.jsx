import { PreguntasEncuesta } from "../../data/Preguntas"
import React, { useState, useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import { db, auth } from "../../services/Firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { signInAnonymously } from "firebase/auth"
import { FiCheckCircle, FiPenTool, FiGift, FiPlayCircle } from "react-icons/fi";

// Convertimos el array de preguntas a un objeto para fácil acceso por ID
const preguntasPorId = PreguntasEncuesta.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

// Mapa de íconos para las transiciones
const iconMap = {
  FiCheckCircle: FiCheckCircle,
  FiPenTool: FiPenTool,
  FiGift: FiGift,
  FiPlayCircle: FiPlayCircle,
};

function Encuesta() {
  const [idPreguntaActual, setIdPreguntaActual] = useState(PreguntasEncuesta[0].id);
  const [respuestas, setRespuestas] = useState({})
  const [respuestasTexto, setRespuestasTexto] = useState({});
  const [historialPreguntas, setHistorialPreguntas] = useState([PreguntasEncuesta[0].id]);
  const [mensaje, setMensaje] = useState(null)
  const navigate = useNavigate()

  // Asegurar que haya sesión (anónima si no hay otra)
  const asegurarSesionAnonima = async () => {
    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }
  }

  const manejarAnterior = () => {
    if (historialPreguntas.length > 1) {
      const nuevoHistorial = [...historialPreguntas];
      nuevoHistorial.pop(); // Elimina la pregunta actual del historial
      const idPreguntaAnterior = nuevoHistorial[nuevoHistorial.length - 1];
      setHistorialPreguntas(nuevoHistorial);
      setIdPreguntaActual(idPreguntaAnterior);
    }
  }

  // Maneja el cambio en los inputs de texto libre
  const manejarRespuestaTexto = (preguntaId, opcionId, texto) => {
    // 1. Actualiza el estado de las respuestas de texto
    setRespuestasTexto({
      ...respuestasTexto,
      [preguntaId]: texto,
    });

    // 2. Selecciona la opción correspondiente (para que el botón 'Siguiente' se active)
    setRespuestas({ ...respuestas, [preguntaId]: opcionId });
  };

  // Maneja la selección de una opción de radio
  const manejarSeleccionRadio = (preguntaId, opcionId) => {
    // 1. Limpia cualquier respuesta de texto para esta pregunta
    const nuevasRespuestasTexto = { ...respuestasTexto };
    delete nuevasRespuestasTexto[preguntaId];
    setRespuestasTexto(nuevasRespuestasTexto);
    // 2. Establece la respuesta de radio
    setRespuestas({ ...respuestas, [preguntaId]: opcionId });
  }

  const manejarSiguiente = () => {
    const pregunta = preguntasPorId[idPreguntaActual];

    // Determinar la siguiente pregunta
    let siguienteId = 'final'; // Por defecto, ir al final

    // Si es una pantalla de transición, solo tiene un 'siguiente' directo.
    if (pregunta.type === 'transicion') {
      siguienteId = pregunta.siguiente;
    } else {
      // Para preguntas normales, buscar el 'siguiente' en la opción o en la pregunta.
      const idRespuesta = respuestas[pregunta.id];
      const opcionSeleccionada = pregunta.opciones.find(o => o.id === idRespuesta);

      if (opcionSeleccionada && opcionSeleccionada.siguiente) {
        siguienteId = opcionSeleccionada.siguiente;
      } else if (pregunta.siguiente) {
        siguienteId = pregunta.siguiente;
      } else {
        const indiceActual = PreguntasEncuesta.findIndex(p => p.id === idPreguntaActual);
        if (indiceActual < PreguntasEncuesta.length - 1) {
          siguienteId = PreguntasEncuesta[indiceActual + 1].id;
        }
      }
    }

    if (siguienteId === 'final') {
      registrarVoto();
    } else {
      setHistorialPreguntas([...historialPreguntas, siguienteId]);
      setIdPreguntaActual(siguienteId);
    }
  }

  // Guardar voto en Firestore
  const registrarVoto = async () => {
    try {
      //Garantizamos que haya sesión (anónima si no hay otra)
      await asegurarSesionAnonima()

      // Preparamos las respuestas de texto para que no colisionen con las de opción
      const respuestasTextoParaGuardar = Object.entries(respuestasTexto).reduce((acc, [key, value]) => {
        acc[`${key}_texto`] = value;
        return acc;
      }, {});

      //Guardamos el voto en un documento con ID = uid
      await setDoc(doc(db, "votos", auth.currentUser.uid), {
        ...respuestas,
        ...respuestasTextoParaGuardar,
        fecha: serverTimestamp()
      })

      // Si todo va bien
      setMensaje("✅ Voto registrado con éxito")

      // Redirigir a la página "Ya votaste"
      navigate("/ya-votaste")
    } catch (error) {
      console.error("Error al registrar voto:", error)
      setMensaje("⚠️ Ocurrió un error inesperado")
    }
  }

  // Lógica para calcular la ruta de preguntas y el progreso
  const rutaActiva = useMemo(() => {
    const primeraRespuesta = respuestas[PreguntasEncuesta[0].id];
    let ruta = [];

    // Simula el recorrido para obtener la lista de IDs de preguntas
    const simularRuta = (idInicial) => {
      let rutaSimulada = [];
      let idActual = idInicial;
      const visitados = new Set();

      while (idActual && idActual !== 'final' && !visitados.has(idActual)) {
        visitados.add(idActual);
        const pregunta = preguntasPorId[idActual];
        if (pregunta) {
          rutaSimulada.push(idActual);
          // Para la simulación, tomamos el 'siguiente' de la pregunta o de la primera opción
          let proximoId = pregunta.siguiente;
          // Si no hay 'siguiente' a nivel de pregunta, intentamos con la primera opción
          if (!proximoId && pregunta.opciones && pregunta.opciones.length > 0) {
            proximoId = pregunta.opciones[0].siguiente;
          }
          // Si aún no hay, intentamos con la siguiente pregunta en el array como último recurso
          idActual = proximoId;
        } else {
          break;
        }
      }
      return rutaSimulada;
    };

    // Si el usuario ya eligió un rol, calculamos su ruta específica
    if (primeraRespuesta) {
      const opcionElegida = preguntasPorId['rol_en_escuela'].opciones.find(o => o.id === primeraRespuesta);
      if (opcionElegida?.siguiente) {
        ruta = ['rol_en_escuela', ...simularRuta(opcionElegida.siguiente)];
      }
    }

    // Si no hay ruta, se muestra una por defecto (la más larga)
    if (ruta.length === 0) {
      ruta = ['rol_en_escuela', ...simularRuta('carrera')];
    }

    // Filtramos las transiciones para no contarlas como "preguntas"
    return ruta.filter(id => preguntasPorId[id]?.type !== 'transicion');
  }, [respuestas[PreguntasEncuesta[0].id]]);

  const totalPreguntasRuta = rutaActiva.length;
  const preguntaActualNumero = rutaActiva.indexOf(idPreguntaActual) + 1;
  const porcentaje = totalPreguntasRuta > 0 ? (preguntaActualNumero / totalPreguntasRuta) * 100 : 0;

  const pregunta = preguntasPorId[idPreguntaActual];


  return (
    <div className="flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md space-y-5 rounded-lg bg-white p-4 shadow-lg sm:max-w-lg md:max-w-xl sm:p-6 sm:space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800 sm:text-xl">Encuesta Expo-Técnica</h2>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">Tu opinión es importante para nosotros.</p>
        </div>

        {/* Barra de Progreso */}
        <div>
          <p className="text-xs text-gray-500 sm:text-sm">
            {preguntaActualNumero > 0 && `Pregunta ${preguntaActualNumero} de ${totalPreguntasRuta}`}
          </p>
          <div className="relative mt-1 h-4 w-full rounded-full bg-gray-200">
            <div
              className="h-4 rounded-full bg-blue-600 transition-all duration-300 flex items-center justify-end pr-2"
              style={{ width: `${porcentaje}%` }}
            >
              {porcentaje > 10 && (
                <span className="text-xs font-bold text-white">
                  {Math.round(porcentaje)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {pregunta.type === 'transicion' ? (
          <div className="text-center py-6 px-4 space-y-4 bg-white rounded-lg border border-gray-200">
            {pregunta.icon && iconMap[pregunta.icon] && ( 
              <div className="flex justify-center">
                {/* Renderiza el ícono dinámicamente */}
                {React.createElement(iconMap[pregunta.icon], { className: "h-10 w-10 text-blue-500 sm:h-12 sm:w-12" })}
              </div>
            )}
            <h2 className="text-lg font-bold text-gray-800 sm:text-xl">{pregunta.texto}</h2>
            {pregunta.subtexto && <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed sm:max-w-md sm:text-base">{pregunta.subtexto}</p>}
          </div>
        ) : pregunta.type === 'final' ? (
          <div className="text-center py-6 px-4 space-y-6 bg-white rounded-lg border border-gray-200">
            {pregunta.icon && iconMap[pregunta.icon] && (
              <div className="flex justify-center">
                {React.createElement(iconMap[pregunta.icon], { className: "h-10 w-10 text-blue-500 sm:h-12 sm:w-12" })}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">{pregunta.texto}</h2>
              {pregunta.subtexto && <p className="text-gray-600 max-w-md mx-auto leading-relaxed mt-2">{pregunta.subtexto}</p>}
            </div>
            <div className="mt-4 space-y-3 text-left max-w-md mx-auto">
              {pregunta.opciones.map((opcion) =>
                opcion.type === 'text' ? (
                  <div key={opcion.id}>
                    <textarea name={pregunta.id} rows="3" className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder={opcion.texto} value={respuestasTexto[pregunta.id] || ''} onChange={(e) => manejarRespuestaTexto(pregunta.id, opcion.id, e.target.value)}></textarea>
                  </div>
                ) : (
                  <label key={opcion.id} className="flex cursor-pointer items-center rounded-lg border p-4 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:ring-2 has-[:checked]:ring-blue-500">
                    <input
                      type="radio"
                      name={pregunta.id}
                      value={opcion.id}
                      checked={respuestas[pregunta.id] === opcion.id}
                      onChange={() => manejarSeleccionRadio(pregunta.id, opcion.id)}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 block text-sm font-medium text-gray-800">{opcion.texto}</span>
                  </label>
                )
              )}
            </div>
          </div>
        ) : (
          <fieldset>
            <legend className="text-sm font-semibold text-gray-900 sm:text-base">{pregunta.texto}</legend>
            {pregunta.subtexto && <p className="mt-1 text-xs text-gray-500 sm:text-sm">{pregunta.subtexto}</p>}
            <div className="mt-4 space-y-3">
              {pregunta.opciones.map((opcion) =>
                opcion.type === 'text' ? (
                  <div key={opcion.id}>
                    <textarea
                      name={pregunta.id}
                      rows="3"
                      className="w-full rounded-lg border border-gray-300 p-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:p-2"
                      placeholder={opcion.texto}
                      value={respuestasTexto[pregunta.id] || ''}
                      onChange={(e) => manejarRespuestaTexto(pregunta.id, opcion.id, e.target.value)}
                    ></textarea>
                  </div>
                ) : (
                  <label key={opcion.id} className="flex cursor-pointer items-center rounded-lg border p-2 sm:p-3 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:ring-2 has-[:checked]:ring-blue-500">
                    <input
                      type="radio"
                      name={pregunta.id}
                      value={opcion.id}
                      checked={respuestas[pregunta.id] === opcion.id}
                      onChange={() => manejarSeleccionRadio(pregunta.id, opcion.id)}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 block text-sm font-medium text-gray-800">{opcion.texto}</span>
                  </label>
                )
              )}
            </div>
          </fieldset>
        )}

        {pregunta.type === 'transicion' ? (
          <div className="flex justify-center pt-4">
            <button
              onClick={manejarSiguiente}
              className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer sm:px-8 sm:py-3 sm:text-base"
            >
              Siguiente
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 ">
            {historialPreguntas.length > 1 ? (
              <button
                onClick={manejarAnterior}
                className="rounded-md bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-300 cursor-pointer sm:px-6 sm:py-3 sm:text-base"
              >
                Anterior
              </button>
            ) : <div />}
            <button onClick={manejarSiguiente} disabled={!respuestas[pregunta.id]} className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 cursor-pointer sm:px-6 sm:py-3 sm:text-base">
              {pregunta.siguiente === 'final' ? 'Finalizar Encuesta' : 'Siguiente'}
            </button>
          </div>
        )}
      </div>

      {/* Modal centrado */}
      {mensaje && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <p className="text-base font-semibold sm:text-lg">{mensaje}</p>
            <button
              onClick={() => setMensaje(null)}
              className="mt-4 bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 active:scale-95 transition text-sm sm:px-4 sm:py-2 sm:text-base"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Encuesta
