import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../services/Firebase.js";
import { collection, onSnapshot } from "firebase/firestore"; 
import TextResponsesCarousel from '../../components/TextResponsesCarousel'; // New import
import TextResponseModal from '../../components/TextResponseModal'; // New import
import { PreguntasEncuesta as preguntas } from "../../data/Preguntas.js"; // Importa el array de preguntas de la encuesta
import { FiAward, FiMeh } from 'react-icons/fi'; // Importa los iconos para los puntos clave

// Convertimos el array de preguntas a un objeto para fácil acceso por ID
const preguntasPorId = preguntas.reduce((acc, p) => {
  acc[p.id] = p; 
  return acc; // Devuelve el acumulador para la siguiente iteración
}, {});

// Componente para mostrar los puntos clave de UNA pregunta
const PuntosClavePregunta = ({ titulo, masVotado, menosVotado }) => {
  const textoMasVotado = masVotado?.texto || 'N/A';
  const textoMenosVotado = menosVotado?.texto || 'N/A';

  // No renderizar si no hay datos
  if (textoMasVotado === 'N/A' && textoMenosVotado === 'N/A') {
    return null;
  } 

  return (
    <div className="mb-6 p-3 border-b-2 border-gray-100 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3 text-center sm:gap-x-4 sm:gap-y-4">
        {/* Más Votado */}
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <FiAward className="mx-auto h-6 w-6 text-green-500 mb-2 sm:h-8 sm:w-8" /> 
          <p className="text-sm font-semibold text-green-800 mb-1 sm:text-base">{titulo.favorito}</p>
          <p className="text-sm font-bold text-green-900 sm:text-base">{textoMasVotado}</p>
        </div>
        {/* Menos Votado */}
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <FiMeh className="mx-auto h-6 w-6 text-orange-500 mb-2 sm:h-8 sm:w-8" />
          <p className="text-sm font-semibold text-orange-800 mb-1 sm:text-base">{titulo.aMejorar}</p>
          <p className="text-sm font-bold text-orange-900 sm:text-base">{textoMenosVotado}</p>
        </div>
      </div>
    </div>
  );
};

// Componente para renderizar los resultados de una pregunta
const BloqueResultados = ({ pregunta, className = '' }) => {
  const totalVotosPregunta = useMemo(
    () => pregunta.opciones.reduce((acc, r) => acc + r.total, 0),
    [pregunta.opciones]
  ); 

  const resultadosOrdenados = useMemo(() => {
    return [...pregunta.opciones]
      .map((r) => ({
        ...r,
        porcentaje: totalVotosPregunta > 0 ? ((r.total / totalVotosPregunta) * 100).toFixed(1) : "0.0", // Calcula el porcentaje de cada opción
      }))
      .sort((a, b) => b.total - a.total); // Ordena las opciones por el número de votos de mayor a menor
  }, [pregunta.opciones, totalVotosPregunta]);

  if (totalVotosPregunta === 0) {
    return (
      <div className={`space-y-2 p-3 border border-gray-200 rounded-lg bg-gray-50/50 ${className} sm:space-y-3 sm:p-4`}>
        <h2 className="text-sm font-semibold text-gray-800 sm:text-base">{pregunta.texto}</h2> 
        <p className="text-xs text-gray-500 sm:text-sm">Aún no hay votos para esta pregunta.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 p-3 border border-gray-200 rounded-lg bg-gray-50/50 ${className} sm:space-y-3 sm:p-4`}>
      <h2 className="text-sm font-semibold text-gray-800 mb-2 sm:text-base">{pregunta.texto}</h2> 
      <div className="space-y-0.5 sm:space-y-1">
        {resultadosOrdenados.map(({ id, texto, total, porcentaje }) => ( // Mapea las opciones ordenadas para mostrar los resultados
          <div key={id} className="text-ms">
            <div className="flex justify-between items-center mb-0.5">
              <p className="font-medium text-gray-700">{texto}</p>
              <p className="font-bold text-gray-800">
                {total} <span className="font-normal text-gray-500">({porcentaje}%)</span>
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full" // Barra de porcentaje
                style={{ width: `${porcentaje}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-right text-xs text-gray-500 pt-1 sm:text-sm">
        Total: {totalVotosPregunta} votos 
      </p>
    </div>
  );
};

function ResultadosPublicos() {
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(0);
  const [subPaginaCarreras, setSubPaginaCarreras] = useState(0);
  const [subPaginaEspecialidad, setSubPaginaEspecialidad] = useState('informatica'); // Estado para la subpágina de especialidad en Carreras
  const [subPaginaWeb, setSubPaginaWeb] = useState(0);
  // const [subPaginaCarrerasSuperior, setSubPaginaCarrerasSuperior] = useState(0); // Removed: Simplified navigation in "Opiniones"
  const [subPaginaExposicion, setSubPaginaExposicion] = useState('informatica');
  // New states for text responses and modal
  const [respuestasTextoLibre, setRespuestasTextoLibre] = useState(new Map()); // Map para almacenar las respuestas de texto libre
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTextResponse, setSelectedTextResponse] = useState(null);

  // --- Lógica de Paginación ---
  const idsPreguntasVisitantes = ['rol_en_escuela']; // Ids de las preguntas para la página de visitantes
  
  // Sub-paginación para la sección Carreras

  // Ids de las preguntas específicas para cada especialidad
  const idsInformatica = ['porque_informatica', 'que_aprender_informatica', 'futuro_informatica'];
  const idsConstruccion = ['porque_construccion', 'que_construir_construccion', 'futuro_construccion'];
  const idsElectromecanica = ['porque_electromecanica', 'area_electromecanica', 'futuro_electromecanica'];
  const idsElectronica = ['porque_electronica', 'dispositivo_electronica', 'futuro_electronica'];
  const idsPorEspecialidad = { informatica: idsInformatica, construccion: idsConstruccion, electromecanica: idsElectromecanica, electronica: idsElectronica }; 

  const idsSubPaginaCarreras0 = ['carrera', ...idsInformatica, ...idsConstruccion, ...idsElectromecanica, ...idsElectronica];

  const idsSubPaginaCarreras1 = ['pertenece_carrera', 'gusta_de_tu_carrera', 'mejorar_de_tu_carrera']; 
  const idsPreguntasCarreras = [...idsSubPaginaCarreras0, ...idsSubPaginaCarreras1];

  const idsExpoInformatica = ['gusto_expo_informatica', 'no_gusto_expo_informatica'];
  const idsExpoConstruccion = ['gusto_expo_construccion', 'no_gusto_expo_construccion'];

  const idsExpoElectromecanica = ['gusto_expo_electromecanica', 'no_gusto_expo_electromecanica'];
  const idsExpoElectronica = ['gusto_expo_electronica', 'no_gusto_expo_electronica'];
  const idsPorExpo = { informatica: idsExpoInformatica, construccion: idsExpoConstruccion, electromecanica: idsExpoElectromecanica, electronica: idsExpoElectronica };

  const idsPreguntasExpos = ['exposicion', ...idsExpoInformatica, ...idsExpoConstruccion, ...idsExpoElectromecanica, ...idsExpoElectronica];
  
  const idsSubPaginaWeb0 = ['calificacion_general_web', 'calificacion_diseño_web', 'calificacion_preguntas', 'calificacion_otros'];
  const idsSubPaginaWeb1 = ['calificacion_no_te_gusto'];
  const idsPreguntasWeb = [...idsSubPaginaWeb0, ...idsSubPaginaWeb1];

  const idsCriticasInformatica = ['porque_eliminar_informatica'];
  const idsCriticasConstruccion = ['porque_eliminar_construccion'];
  const idsCriticasElectromecanica = ['porque_eliminar_electromecanica']; 
  const idsCriticasElectronica = ['porque_eliminar_electronica'];
  const idsCriticasPorEspecialidad = { informatica: idsCriticasInformatica, construccion: idsCriticasConstruccion, electromecanica: idsCriticasElectromecanica, electronica: idsCriticasElectronica };
  const idsCriticasGenerales = ['eliminar_carrera', ...idsCriticasInformatica, ...idsCriticasConstruccion, ...idsCriticasElectromecanica, ...idsCriticasElectronica];
  
  const idsPreguntasOpinionFinal = ['comentario_final'];

  // Helper to get questions with text input options
  const questionsWithTextInput = useMemo(() => {
    return preguntas.filter(p => p.opciones && p.opciones.some(o => o.type === 'text')).map(p => p.id);
  }, []);

  // Suscripción a la colección "votos" para obtener resultados en tiempo real.
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "votos"),
      (snap) => {
        const conteos = {};
        const tempRespuestasTextoLibre = new Map(); // Temporary map for this snapshot

        // Inicializar conteos para todas las preguntas y opciones
        preguntas.filter(p => p.opciones).forEach(pregunta => { // Filtra preguntas que no tienen la propiedad 'opciones'
          conteos[pregunta.id] = {};
          pregunta.opciones.forEach(opcion => {
            if (opcion.id) { // Asegurarse de que la opción tenga un ID válido antes de usarlo como clave
              conteos[pregunta.id][opcion.id] = {
                id: opcion.id,
                texto: opcion.texto,
                total: 0
              };
            }
          });
        });

        // Contar los votos
        snap.docs.forEach((doc) => {
          const voto = doc.data();
          preguntas.filter(p => p.opciones).forEach(pregunta => { // Filtra preguntas que no tienen la propiedad 'opciones'
            const respuestaId = voto[pregunta.id]; // Obtener la respuesta seleccionada
            if (respuestaId && conteos[pregunta.id][respuestaId]) {
              conteos[pregunta.id][respuestaId].total++;
            }
          });
        });
        
        // Process text responses
        snap.docs.forEach((doc) => {
          const voto = doc.data();
          questionsWithTextInput.forEach(qId => {
            const textResponseKey = `${qId}_texto`; // Clave para identificar las respuestas de texto
            if (voto[textResponseKey] && voto[textResponseKey].trim() !== '') {
              if (!tempRespuestasTextoLibre.has(qId)) {
                tempRespuestasTextoLibre.set(qId, []);
              }
              tempRespuestasTextoLibre.get(qId).push({
                id: doc.id + '-' + qId + '-' + Math.random().toString(36).substring(7), // More robust unique ID
                texto: voto[textResponseKey],
                preguntaTexto: preguntasPorId[qId]?.texto || 'Pregunta desconocida'
              });
            }
          });
        });

        // Convertir el objeto de conteos a un array de resultados
        const resultadosProcesados = preguntas.filter(p => p.opciones).map(pregunta => ({ // Filtra preguntas que no tienen la propiedad 'opciones'
          id: pregunta.id,
          texto: pregunta.texto,
          opciones: Object.values(conteos[pregunta.id])
        }));
        setResultados(resultadosProcesados);
        setRespuestasTextoLibre(tempRespuestasTextoLibre); // Set the new text responses
        setCargando(false);
      },
      (err) => {
        console.error(err);
        setError("No se pudieron cargar los resultados.");
        setCargando(false);
      }
    );
    return () => unsub(); // Cleanup on unmount
  }, [questionsWithTextInput]); // Add questionsWithTextInput to dependencies

  const destacados = useMemo(() => {
    if (resultados.length === 0) return [];

    return resultados.map(pregunta => {
      if (pregunta.opciones.length === 0) {
        return { id: pregunta.id, masVotado: null, menosVotado: null };
      }

      const opciones = [...pregunta.opciones];
      
      let masVotado = null;
      let menosVotado = null;

      // Si no hay votos, no hay destacados
      if (opciones.every(o => o.total === 0)) {
        return { id: pregunta.id, masVotado: null, menosVotado: null };
      }

      // Encontrar el más votado
      masVotado = opciones.reduce((max, current) => (current.total > max.total ? current : max), opciones[0]);

      // Encontrar el menos votado (con al menos un voto)
      const opcionesConVotos = opciones.filter(o => o.total > 0);
      if (opcionesConVotos.length > 1) {
        menosVotado = opcionesConVotos.reduce((min, current) => (current.total < min.total ? current : min), opcionesConVotos[0]);
      }
      
      // No mostrar "menos votado" si es el mismo que el "más votado" (caso de un solo votado)
      if (masVotado && menosVotado && masVotado.id === menosVotado.id) {
        menosVotado = null;
      }

      return { id: pregunta.id, masVotado, menosVotado };
    });
  }, [resultados]);


  // Objeto para acceder fácilmente a los destacados por ID
  const destacadosPorId = useMemo(() => 
    destacados.reduce((acc, d) => ({ ...acc, [d.id]: d }), {}),
    [destacados]
  );

  // Functions for modal
  const handleResponseClick = (response) => {
    setSelectedTextResponse(response);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTextResponse(null);
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando resultados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 flex justify-center bg-gray-50">
      <div className="w-full max-w-xl sm:max-w-2xl md:max-w-4xl">
        {/* Contenedor de la "Ventana" de resultados */}
        {/* Render TextResponseModal */}
        <TextResponseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          response={selectedTextResponse}
        />
        <div className="bg-white border-2 border-blue-300 rounded-xl shadow-lg p-6 flex flex-col transition-opacity duration-300">
        <h2 className="text-lg font-bold text-center sm:text-xl md:text-2xl mb-4 sm:mb-6">
          Resultados de la Encuesta
        </h2>

        {/* Botones de Navegación por Pestañas */}
        <div className="border-b-2 border-gray-200 mb-4 sm:mb-6">
          <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-hide">
            <button onClick={() => setPaginaActual(0)} className={`whitespace-nowrap px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-t-lg transition ${paginaActual === 0 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Visitantes</button>
            <button onClick={() => setPaginaActual(1)} className={`whitespace-nowrap px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-t-lg transition ${paginaActual === 1 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Carreras</button>
            <button onClick={() => setPaginaActual(2)} className={`whitespace-nowrap px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-t-lg transition ${paginaActual === 2 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Opiniones</button>
            <button onClick={() => setPaginaActual(3)} className={`whitespace-nowrap px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-t-lg transition ${paginaActual === 3 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Exposiciones</button>
            <button onClick={() => setPaginaActual(4)} className={`whitespace-nowrap px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-t-lg transition ${paginaActual === 4 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Diseño Web</button>
            <button onClick={() => setPaginaActual(5)} className={`whitespace-nowrap px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-t-lg transition ${paginaActual === 5 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Final</button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {resultados.length > 0 && !cargando && !error ? (
          <>
            {/* Página 0: Visitantes */}
            {paginaActual === 0 && (
              <div className="animate-fade-in">
                {/* Puntos Clave para Visitantes */}
                <PuntosClavePregunta
                  titulo={{ favorito: "Rol más común", aMejorar: "Rol menos común" }}
                  masVotado={destacadosPorId.rol_en_escuela?.masVotado}
                  menosVotado={destacadosPorId.rol_en_escuela?.menosVotado}
                /> 
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bloques de resultados para visitantes */}
                  {(() => {
                    const filteredQuestions = resultados.filter(p => idsPreguntasVisitantes.includes(p.id));
                    return filteredQuestions.map((pregunta, index) => {
                      const isLastAndOdd = (index === filteredQuestions.length - 1) && (filteredQuestions.length % 2 !== 0);
                      return (
                        <BloqueResultados
                          key={pregunta.id}
                          pregunta={pregunta}
                          className={isLastAndOdd ? 'md:col-span-full' : ''}
                        />
                      );
                    });
                  })()}
                </div>
              </div>
            )}
            {/* Página 1: Puntos Clave y Carreras */}
            {paginaActual === 1 && (
              <div className="animate-fade-in relative">
                {/* Navegación por Ciclo */}
                <div className="flex justify-center border-b-2 border-gray-200 mb-4 sm:mb-6">
                  <button onClick={() => setSubPaginaCarreras(0)} className={`px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-t-lg transition ${subPaginaCarreras === 0 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>1º a 3º / Otros</button>
                  <button onClick={() => setSubPaginaCarreras(1)} className={`px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-t-lg transition ${subPaginaCarreras === 1 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>4º a 7º año</button> 
                </div>

                {/* Vista para 1ro a 3ro y otros */}
                {subPaginaCarreras === 0 && (
                  <div className="animate-fade-in">
                    <h3 className="text-base sm:text-lg font-bold text-center text-gray-700 mb-4">Estadísticas de "1º a 3º año / Estudiantes de otra escuela"</h3>
                    {/* Puntos Clave para Carrera Favorita */}
                    <PuntosClavePregunta 
                      titulo={{ favorito: "Carrera Favorita", aMejorar: "Carrera Menos Votada" }}
                      masVotado={destacadosPorId.carrera?.masVotado}
                      menosVotado={destacadosPorId.carrera?.menosVotado}
                    /> 
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pregunta general siempre visible */}
                      {(() => {
                        const filteredQuestions = resultados.filter(p => p.id === 'carrera');
                        return filteredQuestions.map((pregunta, index) => {
                          const isLastAndOdd = (index === filteredQuestions.length - 1) && (filteredQuestions.length % 2 !== 0);
                          return (
                            <BloqueResultados
                              key={pregunta.id}
                              pregunta={pregunta}
                              className={isLastAndOdd ? 'md:col-span-full' : ''}
                            />
                          );
                        });
                      })()}

                      {/* Navegación por especialidad para 1º a 3º / Otros */}
                      <div className="md:col-span-full border-b-2 border-gray-200 my-4 sm:my-6">
                        <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-hide">
                          <button onClick={() => setSubPaginaEspecialidad('informatica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'informatica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Informática</button>
                          <button onClick={() => setSubPaginaEspecialidad('construccion')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'construccion' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Construcción</button>
                          <button onClick={() => setSubPaginaEspecialidad('electromecanica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'electromecanica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Electromecánica</button>
                          <button onClick={() => setSubPaginaEspecialidad('electronica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'electronica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Electrónica</button>
                        </div>
                      </div>
                      
                      {/* Preguntas específicas de la especialidad seleccionada */}
                      {(() => {
                        const filteredQuestions = resultados.filter(p => idsPorEspecialidad[subPaginaEspecialidad].includes(p.id));
                        return filteredQuestions.map((pregunta, index) => {
                          const isLastAndOdd = (index === filteredQuestions.length - 1) && (filteredQuestions.length % 2 !== 0);
                          return (
                            <BloqueResultados
                              key={pregunta.id}
                              pregunta={pregunta}
                              className={isLastAndOdd ? 'md:col-span-full' : ''}
                            />
                          );
                        });
                      })()}

                      {/* Carrusel de opiniones detalladas para esta sección */}
                      {(() => {
                        const currentSectionTextResponses = [];
                        if (respuestasTextoLibre.has('mejorar_de_tu_carrera')) {
                          currentSectionTextResponses.push(...respuestasTextoLibre.get('mejorar_de_tu_carrera'));
                        }
                        return currentSectionTextResponses.length > 0 && (
                          <div className="md:col-span-full">
                            <TextResponsesCarousel responses={currentSectionTextResponses} onResponseClick={handleResponseClick} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
                {/* Vista para 4to a 7mo */}
                {subPaginaCarreras === 1 && (
                  <div className="animate-fade-in relative">
                    <h3 className="text-sm sm:text-base font-bold text-center text-gray-700 mb-4 sm:mb-6">Estadísticas de "4º a 7º año"</h3>
                    
                    {/* Navegación por especialidad para ciclo superior */}
                    <div className="border-b-2 border-gray-200 my-6">
                      <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-hide">
                        <button onClick={() => setSubPaginaEspecialidad('informatica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'informatica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Informática</button>
                        <button onClick={() => setSubPaginaEspecialidad('construccion')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'construccion' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Construcción</button>
                        <button onClick={() => setSubPaginaEspecialidad('electromecanica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'electromecanica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Electromecánica</button>
                        <button onClick={() => setSubPaginaEspecialidad('electronica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'electronica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Electrónica</button>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const filteredQuestions = resultados.filter(p => idsSubPaginaCarreras1.includes(p.id));
                        return filteredQuestions.map((pregunta, index) => {
                          const isLastAndOdd = (index === filteredQuestions.length - 1) && (filteredQuestions.length % 2 !== 0);
                          return (
                            <BloqueResultados
                              key={pregunta.id}
                              pregunta={pregunta}
                              className={isLastAndOdd ? 'md:col-span-full' : ''}
                            />
                          );
                        });
                      })()}
                      {/* Carrusel de opiniones detalladas para esta sección */}
                      {(() => {
                        const currentSectionTextResponses = [];
                        if (respuestasTextoLibre.has('gusta_de_tu_carrera')) currentSectionTextResponses.push(...respuestasTextoLibre.get('gusta_de_tu_carrera'));
                        if (respuestasTextoLibre.has('mejorar_de_tu_carrera')) currentSectionTextResponses.push(...respuestasTextoLibre.get('mejorar_de_tu_carrera'));
                        // Agrega otras preguntas de texto libre específicas de esta subpágina si las hubiera
                        return currentSectionTextResponses.length > 0 && (
                          <div className="md:col-span-full">
                            <TextResponsesCarousel responses={currentSectionTextResponses} onResponseClick={handleResponseClick} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )} 

              </div>
            )}

            {/* Página 2: Opiniones */}
            {paginaActual === 2 && (
              <div className="animate-fade-in relative">
                {/* Puntos Clave para Opiniones Críticas */}
                <PuntosClavePregunta
                  titulo={{ favorito: "Carrera con más opiniones", aMejorar: "Carrera con menos opiniones" }}
                  masVotado={destacadosPorId.eliminar_carrera?.masVotado}
                  menosVotado={destacadosPorId.eliminar_carrera?.menosVotado}
                />

                {/* Navegación por especialidad para "Opiniones" */} 
                {/* Se agregó un botón para "General" */}
                {/* Se ajustó el espaciado de los botones */}
                {/* Se ajustó el espaciado de los botones */}
                {/* Se ajustó el espaciado de los botones */}
                {/* Se ajustó el espaciado de los botones */}
                {/* Se ajustó el espaciado de los botones */}
                {/* Se ajustó el espaciado de los botones */}
                <div className="border-b-2 border-gray-200 my-4 sm:my-6">
                  <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-hide">
                    <button onClick={() => setSubPaginaEspecialidad('general')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'general' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>General</button>
                    <button onClick={() => setSubPaginaEspecialidad('informatica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'informatica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Informática</button>
                    <button onClick={() => setSubPaginaEspecialidad('construccion')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'construccion' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Construcción</button>
                    <button onClick={() => setSubPaginaEspecialidad('electromecanica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'electromecanica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Electromecánica</button>
                    <button onClick={() => setSubPaginaEspecialidad('electronica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaEspecialidad === 'electronica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Electrónica</button>
                  </div>
                </div>

                <div className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      let filteredQuestions = [];
                      if (subPaginaEspecialidad === 'general') {
                        filteredQuestions = resultados.filter(p => p.id === 'eliminar_carrera');
                      } else {
                        filteredQuestions = resultados.filter(p => idsCriticasPorEspecialidad[subPaginaEspecialidad]?.includes(p.id));
                      }
                      return filteredQuestions.map((pregunta, index) => {
                        const isLastAndOdd = (index === filteredQuestions.length - 1) && (filteredQuestions.length % 2 !== 0);
                        return (
                          <BloqueResultados 
                            // Fix: Pass the correct question ID for filtering
                            // The previous logic was trying to filter based on idsCriticasPorEspecialidad[subPaginaEspecialidad]
                            // which is undefined when subPaginaEspecialidad is 'general'.
                            // Now, if 'general' is selected, it correctly shows 'eliminar_carrera'.
                            key={pregunta.id}
                            pregunta={pregunta}
                            className={isLastAndOdd ? 'md:col-span-full' : ''}
                          />
                        );
                      });
                    })()}
                    {/* Carrusel de opiniones detalladas para esta sección */}
                    {(() => {
                      const currentSectionTextResponses = [];
                      let criticaQId = null; 
                      // Fix: Handle 'general' case explicitly for text responses
                      if (subPaginaEspecialidad === 'general') {
                        // No specific text input for 'eliminar_carrera' in the carousel, so it remains empty.
                      }
                      if (subPaginaEspecialidad === 'general') {
                        // No hay preguntas de texto libre directamente asociadas a 'eliminar_carrera' en el carrusel
                        // Si hubiera, se añadirían aquí.
                      } else {
                        criticaQId = idsCriticasPorEspecialidad[subPaginaEspecialidad]?.[0];
                      }
                      
                      if (criticaQId && respuestasTextoLibre.has(criticaQId)) {
                        currentSectionTextResponses.push(...respuestasTextoLibre.get(criticaQId));
                      }
                      
                      return currentSectionTextResponses.length > 0 && (
                        <div className="md:col-span-full">
                          <TextResponsesCarousel responses={currentSectionTextResponses} onResponseClick={handleResponseClick} />
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Página 3: Exposiciones */}
            {paginaActual === 3 && ( 
              <div className="animate-fade-in mt-6">
                {/* Puntos Clave para Exposiciones */}
                <PuntosClavePregunta
                  titulo={{ favorito: "Exposición Favorita", aMejorar: "Exposición a Mejorar" }}
                  masVotado={destacadosPorId.exposicion?.masVotado}
                  menosVotado={destacadosPorId.exposicion?.menosVotado}
                /> 
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pregunta general siempre visible */}
                  {(() => {
                    const filteredQuestions = resultados.filter(p => p.id === 'exposicion');
                    return filteredQuestions.map((pregunta, index) => {
                      const isLastAndOdd = (index === filteredQuestions.length - 1) && (filteredQuestions.length % 2 !== 0);
                      return (
                        <BloqueResultados
                          key={pregunta.id}
                          pregunta={pregunta}
                          className={isLastAndOdd ? 'md:col-span-full' : ''}
                        />
                      );
                    });
                  })()}

                  {/* Navegación por especialidad para Exposiciones */}
                  <div className="md:col-span-full border-b-2 border-gray-200 my-4 sm:my-6">
                    <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-hide">
                      <button onClick={() => setSubPaginaExposicion('informatica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaExposicion === 'informatica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Informática</button>
                      <button onClick={() => setSubPaginaExposicion('construccion')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaExposicion === 'construccion' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Construcción</button>
                      <button onClick={() => setSubPaginaExposicion('electromecanica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaExposicion === 'electromecanica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Electromecánica</button>
                      <button onClick={() => setSubPaginaExposicion('electronica')} className={`whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition ${subPaginaExposicion === 'electronica' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Electrónica</button>
                    </div>
                  </div>
                  
                  {/* Preguntas específicas de la exposición seleccionada */}
                  {(() => {
                    const filteredQuestions = resultados.filter(p => idsPorExpo[subPaginaExposicion].includes(p.id));
                    return filteredQuestions.map((pregunta, index) => {
                      const isLastAndOdd = (index === filteredQuestions.length - 1) && (filteredQuestions.length % 2 !== 0);
                      return (
                        <BloqueResultados
                          key={pregunta.id}
                          pregunta={pregunta}
                          className={isLastAndOdd ? 'md:col-span-full' : ''}
                        />
                      );
                    });
                  })()}
                  {/* Carrusel de opiniones detalladas para Exposiciones */}
                  {(() => {
                    const currentSectionTextResponses = [];
                    const gustoQId = idsPorExpo[subPaginaExposicion]?.[0];
                    const noGustoQId = idsPorExpo[subPaginaExposicion]?.[1];
                    if (gustoQId && respuestasTextoLibre.has(gustoQId)) {
                      currentSectionTextResponses.push(...respuestasTextoLibre.get(gustoQId));
                    }
                    if (noGustoQId && respuestasTextoLibre.has(noGustoQId)) {
                      currentSectionTextResponses.push(...respuestasTextoLibre.get(noGustoQId));
                    }
                    return currentSectionTextResponses.length > 0 && (
                      <div className="md:col-span-full">
                        <TextResponsesCarousel responses={currentSectionTextResponses} onResponseClick={handleResponseClick} />
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Página 4: Calificación Web */}
            {paginaActual === 4 && (
              <div className="animate-fade-in mt-6 relative">
                <div className="flex justify-center border-b-2 border-gray-200 mb-4 sm:mb-6"> 
                  <button onClick={() => setSubPaginaWeb(0)} className={`px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-t-lg transition ${subPaginaWeb === 0 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Positivas</button>
                  <button onClick={() => setSubPaginaWeb(1)} className={`px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-t-lg transition ${subPaginaWeb === 1 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>A Mejorar</button>
                </div> 

                {subPaginaWeb === 0 && (
                  <div className="animate-fade-in">
                    {/* Puntos Clave para Calificación Web */}
                    <PuntosClavePregunta
                      titulo={{ favorito: "Lo más valorado", aMejorar: "Calificación de Diseño" }}
                      masVotado={destacadosPorId.calificacion_general_web?.masVotado}
                      menosVotado={destacadosPorId.calificacion_diseño_web?.menosVotado}
                    /> 
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const filteredQuestions = resultados.filter(p => idsSubPaginaWeb0.includes(p.id));
                        return filteredQuestions.map((pregunta, index) => {
                          const isLastAndOdd = (index === filteredQuestions.length - 1) && (filteredQuestions.length % 2 !== 0);
                          return (
                            <BloqueResultados
                              key={pregunta.id}
                              pregunta={pregunta}
                              className={isLastAndOdd ? 'md:col-span-full' : ''}
                            />
                          );
                        });
                      })()}
                      {/* Carrusel de opiniones detalladas para esta sección */}
                      {(() => {
                        const currentSectionTextResponses = [];
                        if (respuestasTextoLibre.has('calificacion_otros')) {
                          currentSectionTextResponses.push(...respuestasTextoLibre.get('calificacion_otros'));
                        }
                        // Agrega otras preguntas de texto libre específicas de esta subpágina si las hubiera
                        return currentSectionTextResponses.length > 0 && (
                          <div className="md:col-span-full">
                            <TextResponsesCarousel responses={currentSectionTextResponses} onResponseClick={handleResponseClick} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {subPaginaWeb === 1 && (
                  <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const filteredQuestions = resultados.filter(p => idsSubPaginaWeb1.includes(p.id));
                        return filteredQuestions.map((pregunta, index) => {
                          const isLastAndOdd = (index === filteredQuestions.length - 1) && (filteredQuestions.length % 2 !== 0);
                          return (
                            <BloqueResultados
                              key={pregunta.id}
                              pregunta={pregunta}
                              className={isLastAndOdd ? 'md:col-span-full' : ''}
                            />
                          );
                        });
                      })()}
                      {/* Carrusel de opiniones detalladas para esta sección */}
                      {(() => {
                        const currentSectionTextResponses = [];
                        // Agrega otras preguntas de texto libre específicas de esta subpágina si las hubiera
                        return currentSectionTextResponses.length > 0 && (
                          <div className="md:col-span-full">
                            <TextResponsesCarousel responses={currentSectionTextResponses} onResponseClick={handleResponseClick} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Página 5: Opinión Final */}
            {paginaActual === 5 && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const filteredQuestions = resultados.filter(p => idsPreguntasOpinionFinal.includes(p.id));
                    return filteredQuestions.map((pregunta, index) => (
                      <BloqueResultados
                        key={pregunta.id}
                        pregunta={pregunta}
                        className="md:col-span-full"
                      />
                    ));
                  })()}
                  {/* Carrusel de opiniones detalladas para esta sección */}
                  {(() => {
                    const currentSectionTextResponses = [];
                    if (respuestasTextoLibre.has('comentario_final')) {
                      currentSectionTextResponses.push(...respuestasTextoLibre.get('comentario_final'));
                    }
                    return currentSectionTextResponses.length > 0 && (
                      <div className="md:col-span-full">
                        <TextResponsesCarousel responses={currentSectionTextResponses} onResponseClick={handleResponseClick} />
                      </div>
                    );
                  })()}
                </div>
              </div>)}

            <div className="mt-6 pt-3 border-t text-center text-gray-700 sm:mt-8 sm:pt-4">
              <p className="text-sm sm:text-base">Los resultados se actualizan en tiempo real.</p>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600 py-6 text-sm sm:py-10 sm:text-base">
            Aún no se han registrado votos para esta sección.
          </p>
        )}

        {/* Botón de Volver al Inicio */}
        <div className="flex justify-center items-center mt-6">
          <Link
            to="/" 
            className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition text-sm sm:px-4 sm:py-2 sm:text-base"
          >
            Volver al Inicio
          </Link>
        </div>
        </div>
      </div>
    
    </div>
  );
}

export default ResultadosPublicos;
