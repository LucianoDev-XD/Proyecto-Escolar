export const PreguntasEncuesta = [
  {
    id: 'rol_en_escuela',
    texto: 'Para comenzar, ¿cuál es tu rol o en qué año estás cursando?',
    opciones: [
      { id: 'primero_a_tercero', texto: 'Estoy en 1º, 2º o 3º año', siguiente: 'carrera' },
      { id: 'cuarto_a_septimo', texto: 'Estoy en 4º, 5º, 6º o 7º año', siguiente: 'pertenece_carrera' },
      { id: 'estudiante_otra_escuela', texto: 'Soy estudiante de otra escuela', siguiente: 'carrera' },
      { id: 'visitante', texto: 'Soy un visitante (padre, familiar, etc.)', siguiente: 'transicion_directa_a_exposicion' },
      { id: 'docente', texto: 'Soy Docente / Directivo', siguiente: 'transicion_directa_a_exposicion' },
      { id: 'egresado', texto: 'Soy Egresado/a', siguiente: 'transicion_directa_a_exposicion' },
    ],
  },
  // --- Preguntas para alumnos de 4to a 7mo ---
  {
    id: 'pertenece_carrera',
    texto: 'Actualmente estás cursando una de las carreras, ¿a cuál perteneces?',
    siguiente: 'gusta_de_tu_carrera',
    opciones: [
      { id: 'pertenece_informatica', texto: 'Informática' },
      { id: 'pertenece_construccion', texto: 'Construcción' },
      { id: 'pertenece_electromecanica', texto: 'Electromecánica' },
      { id: 'pertenece_electronica', texto: 'Electrónica' },
    ],
  },
  {
    id: 'carrera',
    texto: '¿Qué carrera te gusta más?',
    // Después de esta pregunta, el flujo se bifurca.
    // La siguiente pregunta se define en la opción elegida.
    opciones: [
      { id: 'informatica', texto: 'Informática', siguiente: 'porque_informatica' },
      { id: 'construccion', texto: 'Construcción', siguiente: 'porque_construccion' },
      { id: 'electromecanica', texto: 'Electromecánica', siguiente: 'porque_electromecanica' },
      { id: 'electronica', texto: 'Electrónica', siguiente: 'porque_electronica' },
    ],
  },
  {
    id: 'gusta_de_tu_carrera',
    texto: '¿Qué es lo que más valoras de la carrera que estás cursando?',
    siguiente: 'mejorar_de_tu_carrera',
    opciones: [
      { id: 'profesores', texto: 'La calidad de los profesores y las clases.' },
      { id: 'practicas', texto: 'Las prácticas en el taller y los proyectos reales.' },
      { id: 'compañeros', texto: 'El ambiente y el trabajo con mis compañeros.' },
      { id: 'salida_laboral_propia', texto: 'Las oportunidades laborales que me dará a futuro.' },
      { id: 'no_opina_gusta', texto: 'Prefiero no opinar.' },
    ],
  },
  {
    id: 'mejorar_de_tu_carrera',
    texto: '¿Qué aspecto crees que se podría mejorar en tu carrera?',
    siguiente: 'eliminar_carrera', // Continúa hacia la nueva pregunta
    opciones: [
      { id: 'mas_practicas', texto: 'Tener más horas de prácticas y taller.' },
      { id: 'actualizar_temas', texto: 'Actualizar algunos contenidos y tecnologías.' },
      { id: 'recursos_equipos', texto: 'Mejorar los recursos y equipamiento.' },
      { id: 'nada_que_mejorar_propia', texto: 'Por ahora, nada. Estoy conforme.' },
      { id: 'otro_mejorar_carrera', texto: 'Otro aspecto (escribe aquí)...', type: 'text' },
    ],
  },
  // --- Preguntas para Informática ---
  {
    id: 'porque_informatica',
    texto: 'Elegiste Informática. ¿Cuál es la razón principal?',
    siguiente: 'que_aprender_informatica',
    opciones: [
      { id: 'programacion', texto: 'Me atrae la programación y crear software.' },
      { id: 'hardware', texto: 'Me interesa el funcionamiento de las computadoras.' },
      { id: 'salida_laboral_info', texto: 'Creo que tiene muchas oportunidades de trabajo.' },
      { id: 'creatividad_digital', texto: 'Me gusta el diseño y la creatividad digital.' },
      { id: 'no_responder_info1', texto: 'Prefiero no responder.' },
    ],
  },
  {
    id: 'que_aprender_informatica',
    texto: '¿Qué área de la informática te gustaría explorar más?',
    siguiente: 'futuro_informatica',
    opciones: [
      { id: 'desarrollo_web', texto: 'Desarrollo Web (páginas y aplicaciones).' },
      { id: 'ciberseguridad', texto: 'Ciberseguridad.' },
      { id: 'videojuegos', texto: 'Desarrollo de videojuegos.' },
      { id: 'ia_datos', texto: 'Inteligencia Artificial y ciencia de datos.' },
      { id: 'no_responder_info2', texto: 'No estoy seguro/a.' },
    ],
  },
  {
    id: 'futuro_informatica',
    texto: '¿Cómo crees que la informática impactará tu futuro?',
    siguiente: 'eliminar_carrera', // Va a la nueva pregunta
    opciones: [
      { id: 'trabajo_remoto', texto: 'Me permitirá trabajar desde cualquier lugar.' },
      { id: 'crear_proyectos', texto: 'Podré crear mis propios proyectos y empresas.' },
      { id: 'resolver_problemas', texto: 'Será una herramienta para resolver problemas complejos.' },
      { id: 'mejora_continua', texto: 'Me obligará a estar en constante aprendizaje.' },
      { id: 'no_responder_info3', texto: 'Prefiero no responder.' },
    ],
  },
  // --- Preguntas para Construcción ---
  {
    id: 'porque_construccion',
    texto: 'Elegiste Construcción. ¿Cuál es la razón principal?',
    siguiente: 'que_construir_construccion',
    opciones: [
      { id: 'diseño_planos', texto: 'Me gusta el diseño y la creación de planos.' },
      { id: 'trabajo_obra', texto: 'Disfruto del trabajo práctico y en obras.' },
      { id: 'impacto_ciudad', texto: 'Quiero construir y mejorar la ciudad.' },
      { id: 'maquinaria', texto: 'Me atrae el manejo de maquinaria pesada.' },
      { id: 'no_responder_const1', texto: 'Prefiero no responder.' },
    ],
  },
  {
    id: 'que_construir_construccion',
    texto: '¿Qué tipo de proyectos te gustaría liderar?',
    siguiente: 'futuro_construccion',
    opciones: [
      { id: 'viviendas', texto: 'Edificios de viviendas y casas.' },
      { id: 'infraestructura', texto: 'Puentes, rutas y obras públicas.' },
      { id: 'diseño_interiores', texto: 'Diseño y remodelación de interiores.' },
      { id: 'construccion_sostenible', texto: 'Construcción ecológica y sostenible.' },
      { id: 'no_responder_const2', texto: 'No estoy seguro/a.' },
    ],
  },
  {
    id: 'futuro_construccion',
    texto: '¿Qué habilidad consideras más importante para un profesional de la construcción?',
    siguiente: 'eliminar_carrera', // Va a la nueva pregunta
    opciones: [
      { id: 'liderazgo', texto: 'Liderazgo y gestión de equipos.' },
      { id: 'precision', texto: 'Precisión y atención al detalle.' },
      { id: 'creatividad_soluciones', texto: 'Creatividad para solucionar problemas.' },
      { id: 'conocimiento_materiales', texto: 'Conocimiento de nuevos materiales y tecnologías.' },
      { id: 'no_responder_const3', texto: 'Prefiero no responder.' },
    ],
  },
  // --- Preguntas para Electromecánica ---
  {
    id: 'porque_electromecanica',
    texto: 'Elegiste Electromecánica. ¿Cuál es la razón principal?',
    siguiente: 'area_electromecanica',
    opciones: [
      { id: 'motores_maquinas', texto: 'Me fascinan los motores y las máquinas.' },
      { id: 'combinacion_meca_elec', texto: 'La combinación de mecánica y electricidad.' },
      { id: 'automatizacion', texto: 'El control y la automatización de procesos.' },
      { id: 'energias_renovables', texto: 'El potencial en energías renovables.' },
      { id: 'no_responder_electromeca1', texto: 'Prefiero no responder.' },
    ],
  },
  {
    id: 'area_electromecanica',
    texto: '¿En qué sector industrial te gustaría aplicar tus conocimientos?',
    siguiente: 'futuro_electromecanica',
    opciones: [
      { id: 'automotriz', texto: 'Industria automotriz.' },
      { id: 'aeroespacial', texto: 'Industria aeroespacial.' },
      { id: 'produccion_industrial', texto: 'Líneas de producción y manufactura.' },
      { id: 'robotica', texto: 'Robótica industrial.' },
      { id: 'no_responder_electromeca2', texto: 'No estoy seguro/a.' },
    ],
  },
  {
    id: 'futuro_electromecanica',
    texto: '¿Qué avance tecnológico en electromecánica te parece más prometedor?',
    siguiente: 'eliminar_carrera', // Va a la nueva pregunta
    opciones: [
      { id: 'vehiculos_electricos', texto: 'Los vehículos eléctricos y autónomos.' },
      { id: 'impresion_3d_metal', texto: 'La impresión 3D de metales.' },
      { id: 'fabricas_inteligentes', texto: 'Las fábricas totalmente automatizadas (Industria 4.0).' },
      { id: 'generacion_energia', texto: 'Nuevas formas de generación de energía.' },
      { id: 'no_responder_electromeca3', texto: 'Prefiero no responder.' },
    ],
  },
  // --- Preguntas para Electrónica ---
  {
    id: 'porque_electronica',
    texto: 'Elegiste Electrónica. ¿Cuál es la razón principal?',
    siguiente: 'dispositivo_electronica',
    opciones: [
      { id: 'circuitos', texto: 'El diseño y armado de circuitos.' },
      { id: 'microcontroladores', texto: 'La programación de microcontroladores (Arduino, etc.).' },
      { id: 'telecomunicaciones', texto: 'Las telecomunicaciones y las señales.' },
      { id: 'reparacion', texto: 'Me gusta entender y reparar dispositivos.' },
      { id: 'no_responder_electro1', texto: 'Prefiero no responder.' },
    ],
  },
  {
    id: 'dispositivo_electronica',
    texto: '¿Qué tipo de dispositivo electrónico te gustaría crear?',
    siguiente: 'futuro_electronica',
    opciones: [
      { id: 'drones', texto: 'Drones o robots.' },
      { id: 'wearables', texto: 'Dispositivos vestibles (wearables) como relojes inteligentes.' },
      { id: 'iot', texto: 'Equipos para el Internet de las Cosas (IoT).' },
      { id: 'audio_video', texto: 'Equipos de audio o video.' },
      { id: 'no_responder_electro2', texto: 'No estoy seguro/a.' },
    ],
  },
  {
    id: 'futuro_electronica',
    texto: '¿Cuál crees que es el mayor desafío de la electrónica moderna?',
    siguiente: 'eliminar_carrera', // Va a la nueva pregunta
    opciones: [
      { id: 'miniaturizacion', texto: 'Hacer componentes cada vez más pequeños.' },
      { id: 'consumo_energia', texto: 'Reducir el consumo de energía.' },
      { id: 'seguridad_hardware', texto: 'La seguridad a nivel de hardware.' },
      { id: 'reciclaje', texto: 'El reciclaje de los desechos electrónicos.' },
      { id: 'no_responder_electro3', texto: 'Prefiero no responder.' },
    ],
  },
  // --- NUEVAS PREGUNTAS SOBRE ELIMINAR CARRERAS ---
  {
    id: 'eliminar_carrera',
    texto: 'Si tuvieras que eliminar una carrera, ¿cuál sería?',
    subtexto: 'Esta es una pregunta hipotética para entender mejor las percepciones sobre cada especialidad.',
    opciones: [
      { id: 'eliminar_informatica', texto: 'Informática', siguiente: 'porque_eliminar_informatica' },
      { id: 'eliminar_construccion', texto: 'Construcción', siguiente: 'porque_eliminar_construccion' },
      { id: 'eliminar_electromecanica', texto: 'Electromecánica', siguiente: 'porque_eliminar_electromecanica' },
      { id: 'eliminar_electronica', texto: 'Electrónica', siguiente: 'porque_eliminar_electronica' },
      { id: 'ninguna_eliminar', texto: 'Ninguna', siguiente: 'transicion_a_exposicion' },
    ],
  },
  // --- Preguntas condicionales sobre por qué eliminar ---
  {
    id: 'porque_eliminar_informatica',
    texto: '¿Por qué sacarías Informática?',
    siguiente: 'transicion_a_exposicion',
    opciones: [
      { id: 'poca_salida_laboral_info', texto: 'Porque no tiene salida (o poca) laboral.' },
      { id: 'reemplazo_ia', texto: 'Los desarrolladores serán reemplazados por la IA.' },
      { id: 'contenidos_desactualizados_info', texto: 'Los contenidos están desactualizados.' },
      { id: 'demasiado_dificil_info', texto: 'Es demasiado difícil.' },
      { id: 'otro_eliminar_info', texto: 'Otro motivo (escribe aquí)...', type: 'text' },
    ],
  },
  {
    id: 'porque_eliminar_construccion',
    texto: '¿Por qué sacarías Construcción?',
    siguiente: 'transicion_a_exposicion',
    opciones: [
      { id: 'sector_inestable', texto: 'El sector de la construcción es muy inestable.' },
      { id: 'trabajo_demandante', texto: 'Es un trabajo físicamente muy demandante.' },
      { id: 'pocas_oportunidades_mujeres', texto: 'Hay pocas oportunidades para mujeres.' },
      { id: 'tecnologia_cambiante', texto: 'La tecnología está cambiando mucho el rubro.' },
      { id: 'otro_eliminar_const', texto: 'Otro motivo (escribe aquí)...', type: 'text' },
    ],
  },
  {
    id: 'porque_eliminar_electromecanica',
    texto: '¿Por qué sacarías Electromecánica?',
    siguiente: 'transicion_a_exposicion',
    opciones: [
      { id: 'enfocada_industria_pesada', texto: 'Es una carrera muy enfocada a la industria pesada.' },
      { id: 'poca_salida_fuera_fabricas', texto: 'Poca salida laboral fuera de fábricas.' },
      { id: 'es_peligrosa', texto: 'Es peligrosa.' },
      { id: 'talleres_no_equipados', texto: 'Los talleres no están bien equipados.' },
      { id: 'otro_eliminar_emec', texto: 'Otro motivo (escribe aquí)...', type: 'text' },
    ],
  },
  {
    id: 'porque_eliminar_electronica',
    texto: '¿Por qué sacarías Electrónica?',
    siguiente: 'transicion_a_exposicion',
    opciones: [
      { id: 'poca_salida_laboral_zona', texto: 'Poca salida laboral en la zona.' },
      { id: 'similar_a_electromecanica', texto: 'Es muy similar a Electromecánica.' },
      { id: 'base_matematica_fuerte', texto: 'Requiere una base matemática muy fuerte.' },
      { id: 'proyectos_poco_interesantes', texto: 'Los proyectos son poco interesantes.' },
      { id: 'otro_eliminar_electro', texto: 'Otro motivo (escribe aquí)...', type: 'text' },
    ],
  },
  // --- Pantalla de Transición ---
  {
    id: 'transicion_a_exposicion',
    type: 'transicion',
    icon: 'FiCheckCircle', // Ícono de sección completada
    texto: '¡Excelente! Has completado la sección sobre las carreras.',
    subtexto: 'Ahora, pasaremos a las preguntas sobre las exposiciones de cada especialidad. Te recomendamos haberlas recorrido para dar una opinión más completa.',
    siguiente: 'exposicion'
  },
  // --- Pantalla de Transición (Directa) ---
  {
    id: 'transicion_directa_a_exposicion',
    type: 'transicion',
    icon: 'FiPlayCircle', // Ícono de inicio
    texto: '¡Comencemos!',
    subtexto: 'A continuación, encontrarás preguntas sobre las exposiciones de cada especialidad. Tu perspectiva es muy valiosa para nosotros.',
    siguiente: 'exposicion'
  },
  {
    id: 'exposicion',
    texto: '¿Qué exposición te gustó más?',
    subtexto: 'Lamentamos no haber podido incluir las exposiciones de los talleres por falta de información sobre sus trabajos.',
    // El flujo se bifurca según la opción elegida
    opciones: [
      { id: 'expo_informatica', texto: 'Los trabajos de Informática', siguiente: 'gusto_expo_informatica' },
      { id: 'expo_construccion', texto: 'Los de Construcción', siguiente: 'gusto_expo_construccion' },
      { id: 'expo_electromecanica', texto: 'Los de Electromecánica', siguiente: 'gusto_expo_electromecanica' },
      { id: 'expo_electronica', texto: 'Los de Electrónica', siguiente: 'gusto_expo_electronica' },
    ],
  },
  // --- Preguntas de seguimiento para Exposición de Informática ---
  {
    id: 'gusto_expo_informatica',
    texto: '¿Qué te gustó de la exposición de Informática?',
    siguiente: 'no_gusto_expo_informatica',
    opciones: [
      { id: 'proyectos_software', texto: 'Los proyectos de software y programación.' },
      { id: 'demostraciones_hardware', texto: 'Las demostraciones de hardware y redes.' },
      { id: 'creatividad_videojuegos', texto: 'La creatividad de los videojuegos.' },
      { id: 'todo_bien_gusto_info', texto: 'Todo en general estuvo bien.' },
      { id: 'otro_gusto_info', texto: 'Otra cosa (escribe aquí)...', type: 'text' },
    ],
  },
  {
    id: 'no_gusto_expo_informatica',
    texto: '¿Qué no te gustó o crees que podría mejorar en la exposición de Informática?',
    siguiente: 'transicion_a_diseno', // Va a la pantalla de transición
    opciones: [
      { id: 'falto_interaccion_info', texto: 'Faltó más interacción con los proyectos.' },
      { id: 'explicaciones_tecnicas_info', texto: 'Las explicaciones eran muy técnicas.' },
      { id: 'pocos_proyectos_info', texto: 'Había pocos proyectos para ver.' },
      { id: 'trato_irrespetuoso_info', texto: 'El trato de los expositores no fue respetuoso.' },
      { id: 'nada_que_mejorar_info', texto: 'Nada, todo me pareció correcto.' },
      { id: 'otro_no_gusto_info', texto: 'Otra cosa (escribe aquí)...', type: 'text' },
    ],
  },
  // --- Preguntas de seguimiento para Exposición de Construcción ---
  {
    id: 'gusto_expo_construccion',
    texto: '¿Qué te gustó de la exposición de Construcción?',
    siguiente: 'no_gusto_expo_construccion',
    opciones: [
      { id: 'maquetas', texto: 'Las maquetas y planos.' },
      { id: 'proceso_constructivo', texto: 'La explicación del proceso constructivo.' },
      { id: 'materiales_usados', texto: 'La demostración de los materiales.' },
      { id: 'todo_bien_gusto_const', texto: 'Todo en general estuvo bien.' },
      { id: 'otro_gusto_const', texto: 'Otra cosa (escribe aquí)...', type: 'text' },
    ],
  },
  {
    id: 'no_gusto_expo_construccion',
    texto: '¿Qué no te gustó o crees que podría mejorar en la exposición de Construcción?',
    siguiente: 'transicion_a_diseno', // Va a la pantalla de transición
    opciones: [
      { id: 'mas_ejemplos_practicos_const', texto: 'Me hubiera gustado ver más ejemplos prácticos.' },
      { id: 'espacio_reducido_const', texto: 'El espacio para ver los proyectos era reducido.' },
      { id: 'trato_irrespetuoso_const', texto: 'El trato de los expositores no fue respetuoso.' },
      { id: 'poca_info_visual_const', texto: 'Faltaba más información visual (videos, fotos).' },
      { id: 'nada_que_mejorar_const', texto: 'Nada, todo me pareció correcto.' },
      { id: 'otro_no_gusto_const', texto: 'Otra cosa (escribe aquí)...', type: 'text' },
    ],
  },
  // --- Preguntas de seguimiento para Exposición de Electromecánica ---
  {
    id: 'gusto_expo_electromecanica',
    texto: '¿Qué te gustó de la exposición de Electromecánica?',
    siguiente: 'no_gusto_expo_electromecanica',
    opciones: [
      { id: 'maquinas_funcionando', texto: 'Ver las máquinas y motores en funcionamiento.' },
      { id: 'proyectos_automatizacion', texto: 'Los proyectos de automatización y robótica.' },
      { id: 'soldadura_torno', texto: 'Las demostraciones de soldadura y torno.' },
      { id: 'todo_bien_gusto_emec', texto: 'Todo en general estuvo bien.' },
      { id: 'otro_gusto_emec', texto: 'Otra cosa (escribe aquí)...', type: 'text' },
    ],
  },
  {
    id: 'no_gusto_expo_electromecanica',
    texto: '¿Qué no te gustó o crees que podría mejorar en la exposición de Electromecánica?',
    siguiente: 'transicion_a_diseno', // Va a la pantalla de transición
    opciones: [
      { id: 'mas_seguridad_emec', texto: 'Se podría mejorar la seguridad para los visitantes.' },
      { id: 'ruido_excesivo_emec', texto: 'Había mucho ruido, costaba escuchar.' },
      { id: 'trato_irrespetuoso_emec', texto: 'El trato de los expositores no fue respetuoso.' },
      { id: 'pocas_demostraciones_emec', texto: 'Me hubiera gustado ver más demostraciones en vivo.' },
      { id: 'nada_que_mejorar_emec', texto: 'Nada, todo me pareció correcto.' },
      { id: 'otro_no_gusto_emec', texto: 'Otra cosa (escribe aquí)...', type: 'text' },
    ],
  },
  // --- Preguntas de seguimiento para Exposición de Electrónica ---
  {
    id: 'gusto_expo_electronica',
    texto: '¿Qué te gustó de la exposición de Electrónica?',
    siguiente: 'no_gusto_expo_electronica',
    opciones: [
      { id: 'proyectos_iot_electronica', texto: 'Los proyectos con Arduino e Internet de las Cosas (IoT).' },
      { id: 'circuitos_impresos', texto: 'El diseño y la explicación de los circuitos.' },
      { id: 'luces_sonido', texto: 'Los proyectos de luces y sonido.' },
      { id: 'todo_bien_gusto_electro', texto: 'Todo en general estuvo bien.' },
      { id: 'otro_gusto_electro', texto: 'Otra cosa (escribe aquí)...', type: 'text' },
    ],
  },
  {
    id: 'no_gusto_expo_electronica',
    texto: '¿Qué no te gustó o crees que podría mejorar en la exposición de Electrónica?',
    siguiente: 'transicion_a_diseno', // Va a la pantalla de transición
    opciones: [
      { id: 'proyectos_similares_electro', texto: 'Los proyectos eran muy similares entre sí.' },
      { id: 'explicaciones_confusas_electro', texto: 'Algunas explicaciones eran confusas.' },
      { id: 'trato_irrespetuoso_electro', texto: 'El trato de los expositores no fue respetuoso.' },
      { id: 'proyectos_no_funcionaban_electro', texto: 'Algunos proyectos no funcionaban bien.' },
      { id: 'nada_que_mejorar_electro', texto: 'Nada, todo me pareció correcto.' },
      { id: 'otro_no_gusto_electro', texto: 'Otra cosa (escribe aquí)...', type: 'text' },
    ],
  },
  // --- Pantalla de Transición al Diseño ---
  {
    id: 'transicion_a_diseno',
    type: 'transicion',
    icon: 'FiPenTool', // Ícono relacionado con diseño/opinión
    texto: '¡Ya casi terminamos!',
    subtexto: 'Para finalizar, nos gustaría saber tu opinión sobre el diseño y funcionamiento de esta página de encuestas.',
    siguiente: 'calificacion_general_web'
  },
  {
    id: 'calificacion_general_web',
    texto: '¿Qué es lo que más te gustó?',
    opciones: [
      // Si eligen 'diseño', saltamos a la pregunta 'calificacion_diseño_web'
      { id: 'diseño', texto: 'El diseño web', siguiente: 'calificacion_diseño_web' },
      { id: 'preguntas', texto: 'Las Preguntas', siguiente: 'calificacion_preguntas' },
      { id: 'otros', texto: 'Otros', siguiente: 'calificacion_otros' },
    ],
  },
  {
    id: 'calificacion_diseño_web',
    texto: '¿Cuánto calificarías el diseño web?',
    // Después de esta, saltamos a 'calificacion_no_te_gusto'
    siguiente: 'calificacion_no_te_gusto',
    opciones: [
      { id: 'excelente', texto: 'Excelente' },
      { id: 'bueno', texto: 'Bueno' },
      { id: 'regular', texto: 'Regular' },
      { id: 'malo', texto: 'Malo' },
      { id: 'pesimo', texto: 'Pésimo' },
    ],
  },
  {
    id: 'calificacion_preguntas',
    texto: '¿Cuánto calificarías las preguntas?',
    siguiente: 'calificacion_no_te_gusto',
    opciones: [
      { id: 'excelente', texto: 'Excelente (Fáciles)' },
      { id: 'bueno', texto: 'Bueno' },
      { id: 'regular', texto: 'Regular' },
      { id: 'malo', texto: 'Malo' },
      { id: 'pesimo', texto: 'Pésimo (Difíciles)' },
    ],
  },
  {
    id: 'calificacion_otros',
    texto: '¿Qué es lo que más te gustó? (has respondido "Otros" en la pregunta anterior)',
    siguiente: 'calificacion_no_te_gusto',
    opciones: [
      { id: 'respuesta', texto: 'Por favor, escribe acá tu respuesta...', type: 'text' },
      { id: 'salteado', texto: 'No, gracias' },
    ],
  },  {
    id: 'calificacion_no_te_gusto',
    texto: '¿Qué cosa no te gustó de la web?',
    // Después de esta, vamos a la pregunta de comentario final
    siguiente: 'comentario_final',
    opciones: [
      { id: 'preguntas_dificiles', texto: 'Preguntas difíciles' },
      { id: 'diseño_feo', texto: 'Diseño feo' },
      { id: 'muchas_preguntas', texto: 'Muchas Preguntas' },
      { id: 'sin_respuestas', texto: 'No Responder' },
    ],
  },
  {
    id: 'comentario_final',
    type: 'final', // Tipo especial para la última pregunta
    icon: 'FiGift', // Ícono de agradecimiento
    texto: '¡Gracias por tu tiempo!',
    subtexto: 'Si tienes algún comentario o sugerencia final, nos encantaría escucharlo.',
    siguiente: 'final', // Ahora sí, esta es la última y apunta a 'final' para terminar.
    opciones: [
      { id: 'comentario_adicional', texto: 'Escribe tu comentario aquí...', type: 'text' },
      { id: 'sin-respuesta', texto: 'No, gracias' },
    ],
  },
];