/* Contenido del wiki — extraído y reordenado desde:
   "Manual de administración de bodega e inventario 2026".
   Cada página sigue la misma plantilla. Lo marcado como `nota` es una observación del equipo editor. */

window.WIKI = {};

WIKI.fases = [
  { id: 'recepcion',  nombre: 'Recepción',                    color: '#d98a00', desc: 'Desde que el proveedor avisa hasta que la mercadería queda registrada en el sistema.' },
  { id: 'catalogo',   nombre: 'Identificación y catalogación', color: '#3f7f9e', desc: 'Cada material con un código único, una descripción estándar, una clasificación y una etiqueta.' },
  { id: 'control',    nombre: 'Almacenamiento y control',     color: '#5a8a4a', desc: 'Dónde se guarda, cómo se registra su movimiento y qué hacer cuando algo no cuadra.' }
];

WIKI.roles = {
  jefe:        { n: 'Jefe / Supervisor de bodega', d: 'Supervisa el orden del inventario, aprueba movimientos, resuelve diferencias, coordina con abastecimiento, mantenimiento y operaciones, y autoriza el cierre de los casos.' },
  inventario:  { n: 'Encargado de inventario / Analista', d: 'Valida códigos y descripciones, crea o solicita códigos, detecta duplicados, controla diferencias y mantiene la trazabilidad de materiales críticos.' },
  bodeguero:   { n: 'Bodeguero', d: 'Recibe y revisa físicamente los materiales, los compara con la documentación, verifica y pega etiquetas, escanea, informa diferencias y ubica el material en su posición.' },
  admin:       { n: 'Administrativo de bodega', d: 'Registra la información en el ERP, revisa y archiva la documentación y apoya la actualización de datos maestros.' },
  mant:        { n: 'Área de mantenimiento', d: 'Apoya la identificación técnica de repuestos, confirma compatibilidad con los equipos y valida números de parte y especificaciones.' },
  abast:       { n: 'Abastecimiento / Compras', d: 'Coordina con el proveedor día y hora de llegada, gestiona reclamos, reposiciones, devoluciones y notas de crédito, y evita compras duplicadas.' },
  operador:    { n: 'Operador de equipos', d: 'Operador autorizado de grúa horquilla o transpaleta, con equipos con mantención al día.' },
  transp:      { n: 'Transportista', d: 'Entrega la carga y la documentación y sigue las indicaciones de zona de descarga y seguridad.' },
  prev:        { n: 'Prevención de riesgos', d: 'Verifica las condiciones de seguridad de la descarga, el uso de EPP y la demarcación del área.' },
  porteria:    { n: 'Portería / Control de acceso', d: 'Registra la llegada del vehículo y del proveedor y la hora de ingreso.' },
  solicitante: { n: 'Usuarios solicitantes', d: 'Quienes pidieron el material; participan en la verificación de lo recibido.' },
  espec:       { n: 'Especialista técnico de material', d: 'Confirma que el material cumple la ficha técnica cuando la verificación lo requiere.' },
  conta:       { n: 'Contabilidad', d: 'Recibe el respaldo del ingreso (factura, nota de entrada) para el registro contable.' }
};

WIKI.catFallas = {
  doc:   'Documentación',
  cod:   'Código y etiqueta',
  tec:   'Información técnica',
  cant:  'Cantidad',
  fis:   'Estado físico',
  comp:  'Compatibilidad'
};

/* ---------- Catálogo de fallas (consolidado desde las 3 secciones del manual) ---------- */
WIKI.fallas = [
  { id: 'sin-codigo', t: 'Material sin código', cat: 'cod', etapas: ['identificar', 'atributos', 'discrepancias'],
    sit: 'El material llega sin código de identificación o no tiene código en el sistema.',
    no: 'No asignar un código arbitrario.',
    acc: ['Separar el material en la zona de identificación pendiente (rotulado «SIN CÓDIGO»)', 'Revisar orden de compra y documentación', 'Buscar la información del fabricante y en el ERP por descripción/marca', 'Verificar número de parte, modelo y características', 'Consultar al encargado de inventario', 'Solicitar la creación del código', 'Registrar el nuevo código en el sistema', 'Etiquetar el material', 'Trasladarlo a su ubicación definitiva'],
    resp: 'Encargado de inventario', reg: 'Solicitud de creación de código' },
  { id: 'codigo-no-erp', t: 'El código no aparece en el ERP', cat: 'cod', etapas: ['identificar', 'atributos'],
    sit: 'El material tiene código físico, pero no existe en el sistema.',
    no: 'No usar otro código para registrarlo.',
    acc: ['Verificar que el código haya sido digitado correctamente', 'Revisar la documentación', 'Informar al encargado de inventario', 'Solicitar activación o creación del registro', 'Registrar el material una vez solucionado el problema'],
    resp: 'Encargado de inventario', reg: 'Registro de incidencia' },
  { id: 'codigo-ilegible', t: 'Código ilegible', cat: 'cod', etapas: ['identificar', 'atributos', 'etiquetar'],
    sit: 'La etiqueta está dañada, mojada, rota o no puede ser leída.',
    acc: ['Revisar la documentación', 'Identificar el material mediante descripción y características', 'Confirmar el código', 'Reimprimir la etiqueta', 'Colocar la nueva etiqueta', 'Verificar que pueda ser leída correctamente'],
    resp: 'Bodeguero', reg: 'Registro de incidencia' },
  { id: 'sin-etiqueta', t: 'Producto sin etiqueta', cat: 'cod', etapas: ['identificar', 'atributos', 'etiquetar'],
    sit: 'El material debe permanecer en la zona de identificación pendiente hasta confirmar su información.',
    acc: ['Identificar el producto', 'Confirmar el código', 'Generar la etiqueta', 'Colocar la etiqueta', 'Registrar en el ERP', 'Almacenar'],
    resp: 'Bodeguero', reg: 'Registro de incidencia' },
  { id: 'desc-incorrecta', t: 'Descripción incorrecta', cat: 'tec', etapas: ['identificar', 'atributos'],
    sit: 'El sistema dice «Filtro», pero el producto es específicamente un filtro hidráulico para un determinado equipo.',
    acc: ['Comparar la información física y documental', 'Verificar características técnicas', 'Consultar al área de mantenimiento', 'Solicitar la modificación de la descripción', 'Actualizar la etiqueta', 'Registrar la modificación'],
    resp: 'Encargado de inventario', reg: 'Registro de modificación' },
  { id: 'desc-incompleta', t: 'Descripción incompleta', cat: 'tec', etapas: ['homologar'],
    sit: 'El sistema indica solo «manguera»; esa descripción no permite diferenciarla de otras mangueras.',
    acc: ['Incorporar las características relevantes. Ejemplo: MANGUERA HIDRÁULICA ½" – 3000 PSI – 2 METROS', 'Validar la información', 'Actualizar el registro'],
    resp: 'Encargado de inventario', reg: 'Registro de modificación' },
  { id: 'codigo-duplicado', t: 'Código duplicado (dos materiales, un mismo código)', cat: 'cod', etapas: ['identificar', 'atributos'],
    sit: 'Dos materiales diferentes tienen el mismo código.',
    acc: ['Detener el registro', 'Separar los materiales', 'Comparar sus características', 'Revisar registros anteriores', 'Informar al encargado de inventario', 'Solicitar un código independiente si son productos diferentes', 'Corregir los registros'],
    resp: 'Encargado de inventario', reg: 'Solicitud de regularización' },
  { id: 'dos-codigos', t: 'Dos códigos para el mismo producto', cat: 'cod', etapas: ['homologar'],
    sit: 'Un mismo producto existe en el sistema con dos códigos distintos.',
    acc: ['Revisar ambos registros', 'Confirmar que realmente sean equivalentes', 'Consultar al encargado de inventario', 'Validar técnicamente cuando corresponda', 'Determinar cuál será el código oficial', 'Bloquear o eliminar el registro duplicado según las políticas de la empresa', 'Transferir correctamente el stock al código válido', 'Actualizar las etiquetas'],
    resp: 'Encargado de inventario', reg: 'Solicitud de regularización' },
  { id: 'nombres-distintos', t: 'El mismo producto con diferentes nombres', cat: 'tec', etapas: ['homologar'],
    sit: 'Ejemplo: «Filtro aceite», «Filtre de aceite», «Filtro aceite motor», «Oil filter».',
    acc: ['Revisar las características técnicas', 'Comparar número de parte', 'Comparar marca y modelo', 'Confirmar con mantenimiento', 'Determinar si corresponde al mismo producto', 'Seleccionar una descripción estándar', 'Consolidar los registros cuando corresponda', 'Actualizar el sistema', 'Actualizar etiquetas'],
    resp: 'Encargado de inventario', reg: 'Registro de modificación' },
  { id: 'similar-distinto', t: 'Producto similar, pero técnicamente diferente', cat: 'comp', etapas: ['homologar'],
    sit: 'Dos filtros visualmente similares tienen distinta capacidad o especificaciones. Un repuesto incorrecto puede provocar fallas en los equipos y afectar la continuidad operacional.',
    no: 'No deben homologarse como un mismo producto.',
    acc: ['Comparar especificaciones técnicas', 'Verificar número de parte', 'Confirmar equipo asociado', 'Consultar al área de mantenimiento', 'Mantener códigos independientes', 'Diferenciar claramente las descripciones'],
    resp: 'Mantenimiento / Inventario', reg: 'Registro de incidencia' },
  { id: 'sin-info-tecnica', t: 'No existe información técnica suficiente', cat: 'tec', etapas: ['homologar'],
    sit: 'Un repuesto sin marca, modelo, número de parte ni medidas.',
    no: 'No homologar basándose solo en su apariencia.',
    acc: ['Separar el material si existe riesgo de confusión', 'Revisar documentación de compra', 'Consultar al proveedor', 'Consultar al área de mantenimiento', 'Revisar manuales y catálogos', 'Obtener las especificaciones necesarias', 'Realizar la homologación', 'Registrar la información validada'],
    resp: 'Mantenimiento / Abastecimiento', reg: 'Registro de incidencia' },
  { id: 'unidad-incorrecta', t: 'Unidad de medida incorrecta', cat: 'tec', etapas: ['homologar', 'atributos'],
    sit: 'Un producto está registrado como «1 caja», pero el inventario físico se controla por «10 unidades».',
    acc: ['Revisar cómo se compra el producto', 'Revisar cómo se almacena', 'Determinar la unidad de control correcta', 'Validar con inventario y abastecimiento', 'Corregir la unidad de medida', 'Ajustar el stock si corresponde', 'Actualizar el sistema'],
    resp: 'Inventario', reg: 'Registro de modificación' },
  { id: 'marca-incorrecta', t: 'Marca, modelo o N° de parte incorrecto', cat: 'tec', etapas: ['homologar', 'atributos'],
    sit: 'El sistema registra marca SKF, pero el producto físico corresponde a otra marca.',
    acc: ['Verificar físicamente el producto', 'Revisar la documentación', 'Comparar el número de parte', 'Informar la diferencia', 'Corregir el registro', 'Actualizar la etiqueta', 'Registrar la incidencia'],
    resp: 'Inventario', reg: 'Registro de incidencia' },
  { id: 'sin-equipo', t: 'Repuesto sin equipo asociado', cat: 'comp', etapas: ['homologar', 'atributos'],
    sit: 'En una bodega minera es importante saber para qué equipo se usa un repuesto, sobre todo cuando existen componentes similares.',
    acc: ['Revisar el número de parte', 'Consultar el catálogo del fabricante', 'Consultar al área de mantenimiento', 'Identificar el equipo compatible', 'Registrar el equipo asociado', 'Actualizar la ficha del material'],
    resp: 'Mantenimiento', reg: 'Ficha técnica' },
  { id: 'homologado-mal', t: 'Producto homologado incorrectamente', cat: 'comp', etapas: ['homologar'],
    sit: 'Un material fue homologado como equivalente de otro, pero mantenimiento determina después que no son compatibles.',
    acc: ['Bloquear temporalmente el material para evitar su entrega incorrecta', 'Informar al jefe de bodega y a mantenimiento', 'Revisar la información técnica', 'Corregir la homologación', 'Separar los códigos si corresponde', 'Actualizar el ERP', 'Revisar si hubo movimientos anteriores', 'Registrar la incidencia', 'Comunicar el cambio a las áreas involucradas'],
    resp: 'Inventario / Mantenimiento', reg: 'Informe de incidencia' },
  { id: 'cantidad-distinta', t: 'Diferencia entre cantidad física y documentación', cat: 'cant', etapas: ['identificar', 'verificacion', 'discrepancias'],
    sit: 'La guía indica 100 unidades, pero físicamente se reciben 95.',
    acc: ['Realizar un segundo conteo', 'Revisar embalajes', 'Comparar nuevamente con la documentación', 'Registrar la diferencia (faltante o sobrante)', 'Informar al jefe de bodega', 'Informar a Compras / al proveedor para regularizar', 'Registrar la cantidad validada según el procedimiento establecido'],
    resp: 'Jefe de bodega', reg: 'Acta de discrepancia' },
  { id: 'incompatible', t: 'Repuesto incompatible', cat: 'comp', etapas: ['identificar', 'atributos'],
    sit: 'Se recibe un repuesto que parece correcto, pero no corresponde al equipo minero solicitado.',
    no: 'No almacenar como material disponible.',
    acc: ['Separar el repuesto', 'Revisar número de parte y especificaciones', 'Consultar al área de mantenimiento', 'Verificar la orden de compra', 'Registrar la incidencia', 'Gestionar devolución o cambio si corresponde'],
    resp: 'Mantenimiento / Abastecimiento', reg: 'Registro de incidencia' },
  { id: 'serie-incorrecto', t: 'Número de serie incorrecto', cat: 'cod', etapas: ['identificar'],
    sit: 'El número de serie físico no coincide con el documentado.',
    acc: ['Detener el registro', 'Comparar el número físico con la documentación', 'Verificar con el fabricante o proveedor cuando corresponda', 'Informar al encargado de inventario', 'Registrar el número correcto', 'Mantener la trazabilidad del componente'],
    resp: 'Encargado de inventario', reg: 'Registro de incidencia' },
  { id: 'danado', t: 'Material dañado', cat: 'fis', etapas: ['descarga', 'verificacion', 'identificar', 'atributos', 'discrepancias'],
    sit: 'El material presenta golpes, roturas, corrosión, humedad u otro daño.',
    acc: ['Separar inmediatamente el material', 'Identificarlo como «Material dañado»', 'Registrar evidencia fotográfica', 'Informar al jefe de bodega', 'Revisar la documentación', 'Determinar si corresponde devolución, reparación o baja', 'Actualizar el estado en el sistema', 'Gestionar el reclamo correspondiente con el proveedor'],
    resp: 'Jefe de bodega', reg: 'Acta de discrepancia + fotos' },
  { id: 'sin-oc', t: 'Falta la orden de compra', cat: 'doc', etapas: ['discrepancias', 'documentacion'],
    sit: 'Llega mercadería y no hay orden de compra que la respalde.',
    no: 'No realizar el ingreso definitivo al inventario.',
    acc: ['Solicitar copia al área de Compras', 'Mantener el material en observación hasta contar con el respaldo'],
    resp: 'Abastecimiento / Compras', reg: 'Acta de discrepancia' },
  { id: 'doc-incompleta', t: 'Documentación incompleta', cat: 'doc', etapas: ['descarga', 'discrepancias', 'documentacion'],
    sit: 'Falta la guía de despacho, la orden de compra, una solicitud u otro documento de respaldo.',
    acc: ['Registrar la observación', 'Solicitar los antecedentes faltantes antes de cerrar la recepción'],
    resp: 'Bodeguero / Supervisor', reg: 'Acta de observaciones' }
];

/* ---------- Indicadores ---------- */
WIKI.indicadores = [
  { id: 'exac-ident',  n: 'Exactitud de identificación', num: 'Materiales correctamente identificados', den: 'Total de materiales revisados', etapa: 'identificar', uso: 'Qué porcentaje de los materiales fue correctamente identificado.' },
  { id: 'sin-cod',     n: 'Porcentaje de materiales sin código', num: 'Materiales sin código', den: 'Total de materiales recibidos', etapa: 'identificar', uso: 'Qué tanto ingresa sin código y obliga a crear registros nuevos.' },
  { id: 'err-ident',   n: 'Tasa de errores de identificación', num: 'Errores detectados', den: 'Total de materiales identificados', etapa: 'identificar', uso: 'Frecuencia de errores en la etapa de identificación.' },
  { id: 'homolog',     n: 'Porcentaje de materiales homologados', num: 'Materiales homologados', den: 'Total de materiales revisados', etapa: 'homologar', uso: 'Avance de la estandarización del catálogo.' },
  { id: 'dupl',        n: 'Porcentaje de duplicidad de códigos', num: 'Códigos duplicados', den: 'Total de códigos revisados', etapa: 'homologar', uso: 'Calidad de la base de datos de materiales.' },
  { id: 'err-homol',   n: 'Tasa de errores de homologación', num: 'Errores detectados', den: 'Total de materiales homologados', etapa: 'homologar', uso: 'Qué tan confiable es la homologación realizada.' },
  { id: 'reg-comp',    n: 'Porcentaje de registros completos', num: 'Materiales con información completa', den: 'Total de materiales revisados', etapa: 'homologar', uso: 'Qué parte del inventario tiene todos sus datos.' },
  { id: 'exac-attr',   n: 'Exactitud de atributos', num: 'Materiales con atributos correctos', den: 'Total de materiales revisados', etapa: 'atributos', uso: 'Materiales cuyos atributos de control están bien.' },
  { id: 'err-attr',    n: 'Tasa de errores de consulta de atributos', num: 'Errores detectados', den: 'Total de materiales consultados', etapa: 'atributos', uso: 'Frecuencia de errores al consultar atributos.' }
];

/* ---------- Glosario ---------- */
WIKI.glosario = [
  ['Acta de discrepancia', 'Registro formal de una diferencia entre lo solicitado, lo documentado y lo recibido: producto, cantidad, fecha y motivo.'],
  ['Atributo de control', 'Dato que permite verificar un material: código, descripción, unidad, marca, modelo, serie/lote, cantidad, estado, equipo asociado y ubicación.'],
  ['Clasificación ABC', 'Método de ubicación: los productos de rotación alta (A) van cerca de las salidas, los de rotación media (B) al centro y los de baja rotación (C) al fondo.'],
  ['Código de barras', 'Etiqueta ideal para lectura rápida con pistola láser.'],
  ['Código QR', 'Etiqueta útil para almacenar más información en poco espacio.'],
  ['Cuarentena (área de)', 'Zona donde se mantiene el material rechazado o no conforme, separado del stock disponible.'],
  ['EPP', 'Elementos de protección personal.'],
  ['ERP', 'Sistema informático donde se gestionan el inventario, los códigos y las ubicaciones.'],
  ['Eslinga', 'Elemento de izaje usado en la descarga de mercadería.'],
  ['Familia', 'Clasificación del material dentro del catálogo.'],
  ['Grúa horquilla', 'Equipo de descarga y de ubicación del material en altura. Requiere operador autorizado y mantención al día.'],
  ['Guía de despacho', 'Documento del proveedor con lo enviado; se compara con lo físico y con la orden de compra.'],
  ['HDS / SDS', 'Hoja de datos de seguridad; sirve para identificar y controlar sustancias químicas.'],
  ['Homologar', 'Establecer una forma única y estandarizada de identificar y describir un producto, aunque llegue con distintos nombres o códigos.'],
  ['Lote', 'Identificador que permite la trazabilidad de materiales fabricados en un mismo proceso.'],
  ['Material no conforme', 'Material con observaciones (dañado, equivocado, vencido, incompleto). Se segrega y no se usa.'],
  ['Matriz de clasificación', 'Registro donde queda obligatoriamente el tipo funcional y el uso de cada material.'],
  ['N° de parte', 'Identificación entregada por el fabricante; clave en repuestos y componentes mineros.'],
  ['N° de serie', 'Identificación individual de un componente; se registra cuando existe.'],
  ['Nota de entrada al inventario', 'Documento que respalda el ingreso de material al inventario.'],
  ['Orden de compra (OC)', 'Documento que indica lo que fue solicitado al proveedor.'],
  ['Orden interna', 'Documento interno de solicitud que se reúne con la OC al preparar la recepción.'],
  ['Orden de almacenamiento', 'Documento que indica al operario el código del producto y la coordenada exacta donde guardarlo.'],
  ['Posición fija / caótica', 'Fija: cada producto tiene un lugar único. Caótica o variable: se asigna el espacio libre disponible mediante software.'],
  ['RFID', 'Etiqueta de lectura por radiofrecuencia a distancia (tecnología avanzada).'],
  ['Segregar', 'Separar físicamente un material del resto para que no se confunda ni se use.'],
  ['Tarjeta de existencia', 'Registro de las existencias de un material, parte del respaldo del ingreso.'],
  ['Tipo funcional', 'Finalidad del material: consumo, repuesto, herramienta, EPP, lubricante o reactivo.'],
  ['Trazabilidad', 'Capacidad de seguir un material desde su recepción hasta su uso, mediante registros y documentos.'],
  ['Transpaleta', 'Equipo para mover pallets; requiere mantención al día.'],
  ['Zona de identificación pendiente', 'Espacio señalizado, ordenado, separado del material disponible y bajo control del encargado, donde esperan los materiales que no pueden identificarse o validarse de inmediato.']
];

/* ---------- Etapas (páginas del manual) ---------- */
WIKI.etapas = [
  /* ===== RECEPCIÓN ===== */
  { id: 'preparacion', n: 1, fase: 'recepcion', t: 'Preparar la recepción',
    resumen: 'Coordinar con el proveedor y dejar listos el área, los equipos y el sistema antes de que llegue la carga.',
    roles: ['jefe', 'bodeguero', 'abast', 'operador', 'transp', 'prev'],
    docs: ['Orden de compra', 'Orden interna', 'Aviso de despacho', 'Programa de recepción', 'Check list de equipos'],
    recursos: ['Grúa horquilla', 'Transpaleta', 'EPP', 'Pesa', 'Huincha', 'Sistema habilitado'],
    blocks: [
      { type: 'steps', title: 'Funciones', items: ['Coordinar con el proveedor día y hora de llegada', 'Reunir orden de compra y orden interna', 'Segregar el área de descarga', 'Preparar equipos de descarga y seguridad: grúa horquilla o transpaleta con mantención al día, EPP y sistema de inventario habilitado'] }
    ],
    resultado: 'Área segregada, equipos revisados, documentos reunidos y sistema listo cuando llega el camión.' },

  { id: 'documentacion', n: 2, fase: 'recepcion', t: 'Recibir y revisar la documentación',
    resumen: 'Registrar al transportista, revisar la carga a simple vista y verificar que los documentos respalden lo que llega.',
    objetivo: 'Verificar y registrar correctamente la documentación asociada a la recepción, para asegurar la trazabilidad del material, equipo o repuesto.',
    roles: ['bodeguero', 'porteria', 'transp', 'jefe', 'prev'],
    docs: ['Guía de despacho', 'Factura', 'Orden de compra', 'Registro de ingreso de vehículo', 'Acta de observaciones'],
    recursos: ['Portería o control de acceso', 'Andén asignado', 'Señalización de recinto', 'Sistema de registro de llegada'],
    blocks: [
      { type: 'steps', title: 'Funciones', items: ['Recepción, registro y verificación del vehículo transportista y del proveedor', 'Inspección visual de la carga', 'Indicar al conductor la zona de descarga y las medidas de seguridad', 'Registrar hora de llegada y cualquier observación'] }
    ],
    fallas: ['sin-oc', 'doc-incompleta'],
    nota: 'En el manual original, el objetivo de esta etapa hablaba de «una falla» (texto copiado de otra sección). Aquí se corrigió a «recepción».',
    resultado: 'Llegada registrada y documentos revisados, listos para iniciar la descarga.' },

  { id: 'descarga', n: 3, fase: 'recepcion', t: 'Descargar la mercadería',
    resumen: 'Descargar con operador autorizado, área delimitada y EPP, sin mezclar lo nuevo con lo anterior.',
    roles: ['operador', 'bodeguero', 'transp', 'jefe', 'prev'],
    docs: ['Permiso de maniobra', 'Check list de equipos', 'Hojas de bultos descargados', 'Registro de incidentes'],
    recursos: ['Grúa horquilla', 'Transpaleta', 'Pallet', 'Eslingas', 'Conos de demarcación', 'EPP'],
    blocks: [
      { type: 'steps', title: 'Funciones', items: ['Delimitar el área y utilizar EPP', 'Operador autorizado y equipos con mantención al día', 'Verificar peso, volumen y tipo de material para aplicar el método de descarga correspondiente', 'Dejar la mercadería en la zona de recepción sin mezclarla con la anterior', 'Ordenar la mercadería por ítem y separar lo dañado'] },
      { type: 'list', title: 'Fallas que pueden aparecer en esta etapa', items: ['Documentación incompleta: falta guía de despacho, orden de compra, solicitud o documento de respaldo', 'Datos incorrectos', 'Cantidad diferente', 'Código de material incorrecto', 'Material dañado', 'Material equivocado', 'Documento vencido o no válido', 'Falta de registro en el ERP', 'Falta de trazabilidad', 'Falta de comunicación'] }
    ],
    fallas: ['doc-incompleta', 'danado', 'cantidad-distinta'],
    resultado: 'Mercadería en zona de recepción, ordenada por ítem, con lo dañado separado.' },

  { id: 'verificacion', n: 4, fase: 'recepcion', t: 'Verificar cantidad y condiciones',
    resumen: 'Contar, pesar y medir; revisar estado y datos del producto; separar lo conforme de lo observado y firmar la guía.',
    roles: ['bodeguero', 'jefe', 'solicitante', 'espec'],
    docs: ['Guía firmada conforme o con observaciones', 'Pauta de verificación', 'Informe de inspección', 'Respaldo fotográfico'],
    recursos: ['Pesa', 'Huincha o pie de metro', 'Lector de códigos', 'Ficha técnica del material', 'Zona demarcada para material no conforme'],
    blocks: [
      { type: 'steps', title: 'Funciones', items: ['Contar, pesar o medir para verificar si lo físico corresponde con la guía de despacho', 'Revisar información del producto: marca, modelo, dimensión, grado o ficha técnica', 'Revisar el estado del material: daños, vencimiento, corrosión, humedad, accesorios', 'Revisar que la cantidad recibida cuadre con la guía de despacho, la orden de compra y la orden interna', 'Separar el material conforme del material con observaciones', 'Firmar la guía indicando si la entrega está conforme o con observaciones'] }
    ],
    fallas: ['cantidad-distinta', 'danado'],
    resultado: 'Guía firmada y material separado en conforme / con observaciones.' },

  { id: 'registro-ingreso', n: 5, fase: 'recepcion', t: 'Registrar el ingreso en el sistema',
    resumen: 'Dejar en el sistema solo lo conforme, con su lote, serie y vencimiento; lo observado se registra aparte.',
    roles: ['bodeguero', 'admin', 'jefe', 'abast', 'conta'],
    docs: ['Nota de entrada al inventario', 'Guía de despacho', 'Factura', 'Tarjeta de existencia'],
    recursos: ['Sistema de inventario', 'Computador', 'Lector de códigos', 'Archivos de la documentación'],
    blocks: [
      { type: 'steps', title: 'Funciones', items: ['Registrar en el sistema la cantidad conforme, unidad y documentación de respaldo', 'Registrar información del material: lote, N° de serie, fecha de vencimiento', 'Recepcionar según orden de compra y orden interna', 'Registrar aparte el material observado para no confundirlo con el aceptado', 'Archivar la documentación como respaldo', 'Informar sobre el material aceptado y el que está en observación'] }
    ],
    resultado: 'Stock actualizado con material aceptado; el material en observación queda registrado por separado.' },

  /* ===== IDENTIFICACIÓN Y CATALOGACIÓN ===== */
  { id: 'identificar', n: 6, fase: 'catalogo', t: 'Identificar',
    resumen: 'Dar a cada artículo una identidad única y rápida de reconocer; ningún material entra al inventario sin ella.',
    objetivo: 'Establecer un procedimiento estandarizado para la correcta identificación de materiales, repuestos, herramientas, equipos, EPP y otros insumos que ingresan, permanecen o salen de la bodega. Una buena identificación mantiene el inventario confiable, facilita ubicar materiales, evita errores en las entregas y asegura la trazabilidad.',
    roles: ['jefe', 'inventario', 'bodeguero', 'admin', 'mant'],
    docs: ['Orden de compra', 'Guía de despacho', 'Factura', 'Registro de recepción', 'Ficha técnica', 'Catálogo del fabricante', 'HDS/SDS', 'Registro de inventario', 'Solicitud de creación de código', 'Registro de incidencia'],
    recursos: ['Etiquetas', 'Marcadores', 'Estanterías', 'Pallets', 'Contenedores', 'Zona de identificación pendiente', 'EPP', 'Señalización', 'Computador', 'Sistema ERP', 'Lector de código de barras', 'Impresora de etiquetas', 'Cámara para evidencias'],
    blocks: [
      { type: 'list', title: 'Alcance', intro: 'Todo material que ingrese a la bodega minera, para el personal de recepción, bodegueros, encargados de inventario, supervisores y administrativos de abastecimiento. Incluye:', items: ['Repuestos para maquinaria y equipos mineros', 'Herramientas', 'Elementos de protección personal (EPP)', 'Lubricantes y productos de mantenimiento', 'Materiales eléctricos y mecánicos', 'Insumos de operación', 'Componentes hidráulicos', 'Materiales de construcción y mantenimiento', 'Sustancias químicas, cuando corresponda', 'Componentes críticos con número de serie o lote', 'Explosivos'] },
      { type: 'table', title: 'Información que se debe identificar', head: ['Dato', 'Para qué sirve'], rows: [
        ['Código del producto', 'Identificador único dentro del sistema de inventario'],
        ['Descripción', 'Nombre claro y estandarizado'],
        ['Unidad de medida', 'Cómo se controla: unidad, par, caja, kg, litro, metro…'],
        ['Marca / fabricante', 'Origen del producto cuando sea necesario'],
        ['Modelo o N° de parte', 'Especialmente importante en repuestos y componentes mineros'],
        ['N° de serie', 'Cuando el componente tiene identificación individual'],
        ['Lote', 'Trazabilidad de materiales fabricados en un mismo proceso'],
        ['Fecha de fabricación', 'Cuando corresponda'],
        ['Fecha de vencimiento', 'Químicos, algunos EPP, reactivos y otros con vida útil'],
        ['Cantidad', 'Unidades recibidas'],
        ['Ubicación', 'Lugar específico de almacenamiento'],
        ['Estado', 'Conforme, pendiente de revisión, dañado, rechazado, vencido o disponible']
      ] },
      { type: 'steps', title: 'Procedimiento de identificación', items: [
        'Recepción del material: el bodeguero lo recibe del proveedor u otra área y verifica que exista documentación asociada antes de incorporarlo al inventario',
        'Revisión de documentos: orden de compra, guía de despacho, factura, solicitud de compra, documento de traslado interno y documentación técnica',
        'Inspección física: código, descripción, marca, modelo, N° de parte, N° de serie, lote, cantidad, unidad de medida y estado. En repuestos mineros, verificar además que corresponda al equipo para el que fue comprado',
        'Comparación: la información física se compara con la documental y con la del ERP',
        'Etiquetado: legible y resistente a las condiciones de la bodega, con código, descripción, unidad de medida, lote o serie, fecha de ingreso y ubicación',
        'Registro: validada la información, se registra en el sistema de inventario',
        'Almacenamiento: se traslada a su ubicación correspondiente'
      ] },
      { type: 'text', title: 'Zona de identificación pendiente', html: 'Espacio temporal para materiales que no pueden ser identificados o validados de inmediato. Debe estar <b>señalizada, ordenada, separada de los materiales disponibles, registrada en el sistema cuando corresponda y bajo control del encargado de bodega</b>.' },
      { type: 'widget', name: 'incidencias-link', title: 'Registro de incidencias' }
    ],
    fallas: ['sin-codigo', 'codigo-no-erp', 'codigo-ilegible', 'sin-etiqueta', 'desc-incorrecta', 'codigo-duplicado', 'cantidad-distinta', 'incompatible', 'serie-incorrecto', 'danado'],
    indicadores: ['exac-ident', 'sin-cod', 'err-ident'],
    resultado: 'Cada material correctamente identificado, etiquetado, registrado y asociado a una ubicación. Si hay diferencias o información incompleta, el material permanece separado hasta que su identificación sea válida.',
    nota: '«Explosivos» figura en el alcance, pero el manual no define un tratamiento especial para ellos. Se recomienda que el grupo lo aclare (almacenamiento y control suelen tener normativa propia).' },

  { id: 'homologar', n: 7, fase: 'catalogo', t: 'Homologar',
    resumen: 'Que un mismo producto tenga un solo nombre, un solo código y una sola ficha, validada técnicamente.',
    objetivo: 'Establecer un procedimiento estandarizado para homologar y estandarizar la información de materiales, repuestos, herramientas, EPP e insumos, evitando que un mismo producto sea registrado con diferentes nombres, códigos o características. Reduce duplicidades, facilita las compras, mejora el control del inventario y asegura que lo solicitado corresponda a la necesidad de la operación.',
    roles: ['jefe', 'inventario', 'bodeguero', 'mant', 'abast'],
    docs: ['Catálogos', 'Fichas técnicas', 'Manuales del fabricante', 'Órdenes de compra', 'Guías de despacho', 'Registros anteriores', 'Registro de modificación'],
    recursos: ['Sistema ERP', 'Computador', 'Etiquetas actualizadas'],
    blocks: [
      { type: 'text', title: 'Qué significa homologar', html: 'Establecer <b>una forma única y estandarizada</b> de identificar y describir un producto dentro del sistema. Un mismo producto puede llegar con nombres distintos: <i>Filtro aceite</i>, <i>Filtre de aceite</i>, <i>Filtro aceite motor</i>, <i>Oil filter</i>.' },
      { type: 'table', title: 'Información que se debe homologar', head: ['Información', '¿Qué se debe verificar?'], rows: [
        ['Código', 'Que sea único y no esté duplicado'],
        ['Descripción', 'Que sea clara, completa y estandarizada'],
        ['Unidad de medida', 'Unidad, par, caja, litro, kg, metro…'],
        ['Marca', 'Fabricante o marca correspondiente'],
        ['Modelo', 'Modelo específico del producto'],
        ['N° de parte', 'Identificación entregada por el fabricante'],
        ['Dimensiones', 'Largo, ancho, diámetro, etc., cuando corresponda'],
        ['Material', 'Tipo de material de fabricación'],
        ['Capacidad', 'Capacidad o resistencia cuando sea relevante'],
        ['Lote / N° de serie', 'Cuando corresponda o para componentes individualizados'],
        ['Equipo asociado', 'Equipo minero en el que se utiliza'],
        ['Familia', 'Clasificación del material'],
        ['Ubicación', 'Lugar donde será almacenado']
      ] },
      { type: 'steps', title: 'Procedimiento de homologación', items: [
        'Recopilar información: catálogos, fichas técnicas, manuales del fabricante, órdenes de compra, guías, registros anteriores, ERP, información de mantenimiento y de proveedores',
        'Revisar si el producto ya existe, buscando por código, descripción, N° de parte, marca, modelo y características técnicas. Objetivo: no crear un código nuevo para un producto que ya existe',
        'Comparar productos similares (ej.: «Rodamiento 6205 SKF», «Rodamiento SKF 6205», «Rodamiento 6205-2RS») y verificar técnicamente si son exactamente el mismo producto. Ojo: productos que se parecen no necesariamente son iguales',
        'Estandarizar la descripción con el formato de la empresa: Tipo de producto + características principales + medida + marca/modelo. Ej.: «Manguera hidráulica 1/2 3000 PSI»',
        'Validación técnica por el área correspondiente cuando sea repuesto o componente crítico: mantenimiento mecánico/eléctrico/mina, operaciones, prevención de riesgos, abastecimiento',
        'Asignación o actualización del código: si existe, se usa el existente; si no, se solicita uno nuevo; si hay información incorrecta, se solicita su modificación; si hay duplicados, se regulariza',
        'Registro en el ERP, de manera uniforme para todos los usuarios',
        'Etiquetado: se actualizan las etiquetas físicas para que coincidan con la información homologada'
      ] },
      { type: 'list', title: 'Criterios para homologar correctamente', items: ['Código único', 'Descripción estandarizada', 'Unidad de medida correcta', 'Marca, modelo y N° de parte validados', 'Características técnicas registradas', 'Equipo asociado identificado cuando corresponda', 'Lote o serie registrado cuando sea necesario', 'Información validada por el área correspondiente', 'Registro actualizado en el ERP', 'La etiqueta física coincide con el sistema'] }
    ],
    fallas: ['nombres-distintos', 'dos-codigos', 'sin-info-tecnica', 'similar-distinto', 'unidad-incorrecta', 'desc-incompleta', 'marca-incorrecta', 'sin-equipo', 'homologado-mal'],
    indicadores: ['homolog', 'dupl', 'err-homol', 'reg-comp'],
    resultado: 'Identificación estandarizada, única y técnicamente validada. Cualquier trabajador autorizado debe poder buscar un material y encontrar información clara y confiable: características, código, unidad, ubicación y aplicación.' },

  { id: 'familia', n: 8, fase: 'catalogo', t: 'Reconocer la familia',
    resumen: 'Ubicar el material dentro de una familia del catálogo.',
    roles: [], docs: [], recursos: [],
    stub: true,
    blocks: [
      { type: 'text', title: 'Lo que se sabe', html: 'En la etapa de homologación la <b>familia</b> se define como la «clasificación del material» dentro de la información que se debe homologar.' }
    ],
    nota: 'PÁGINA PENDIENTE. En el manual original esta sección repite el contenido de «Verificar cantidad y condiciones» (copia por error). El grupo responsable debe definir qué familias existen en la bodega (ej.: repuestos mecánicos, eléctricos, hidráulicos, lubricantes, EPP, herramientas) y cómo se reconoce cada una.' },

  { id: 'tipo-uso', n: 9, fase: 'catalogo', t: 'Asignar tipo y uso',
    resumen: 'Registrar para qué sirve el material (tipo funcional) y dónde se va a usar (uso) en la matriz de clasificación.',
    roles: [], docs: ['Matriz de clasificación', 'Catálogo o registro maestro de materiales', 'Ficha técnica del fabricante'],
    recursos: [],
    blocks: [
      { type: 'table', title: 'Clasificación', head: ['Campo', 'Valores posibles'], rows: [
        ['Tipo funcional', 'Material de consumo · Repuesto · Herramienta · EPP · Lubricante · Reactivo'],
        ['Uso principal', 'Mantención · Operación · Seguridad']
      ] },
      { type: 'steps', title: 'Qué hacer', items: ['Identificar y registrar el tipo funcional según la finalidad del material en la empresa', 'Determinar el uso principal según la actividad en la que será utilizado', 'Verificar que la clasificación sea coherente con las características y la función del material, evitando asignaciones incorrectas que afecten el almacenamiento, control o utilización', 'Registrar directamente en la matriz de clasificación, en los campos de tipo y uso'] },
      { type: 'callout', title: 'Regla', text: 'El tipo funcional y el uso deben quedar registrados obligatoriamente en la matriz de clasificación, de forma clara, precisa y relacionada con la función real del artículo en la operación.' },
      { type: 'list', title: 'Evidencia', items: ['Registro del tipo y uso en la matriz de clasificación', 'Catálogo o registro maestro de materiales', 'Ficha técnica o documentación del fabricante, cuando corresponda', 'Información visible del material que justifique su función'] },
      { type: 'example', title: 'Ejemplo práctico', rows: [['Material', 'Guantes de seguridad anticorte'], ['Tipo funcional', 'EPP'], ['Uso', 'Seguridad'], ['Justificación', 'Elemento destinado a proteger al trabajador frente a riesgos de corte en actividades operacionales o de mantenimiento']] }
    ],
    resultado: 'Material clasificado por tipo funcional y uso operacional, con ambos datos en la matriz. Puede avanzar a la consulta de atributos de control.',
    nota: 'El manual dice «Etapa 5: Consulta de atributos»; en este wiki corresponde a la etapa 10.' },

  { id: 'atributos', n: 10, fase: 'catalogo', t: 'Consultar atributos de control',
    resumen: 'Revisar que cada atributo del material sea correcto antes de almacenarlo.',
    objetivo: 'Establecer un procedimiento estandarizado para consultar, verificar y validar la información de la mercadería que ingresa a bodega, manteniendo un inventario confiable y asegurando la trazabilidad.',
    roles: ['jefe', 'inventario', 'bodeguero', 'admin', 'mant'],
    docs: ['Orden de compra', 'Guía de despacho', 'Factura', 'Registro de recepción', 'Ficha técnica / catálogo', 'Solicitud de creación del código', 'Registro de incidencia'],
    recursos: ['Etiquetas', 'Marcadores', 'Estanterías', 'Pallets', 'Contenedores', 'Zona de identificación pendiente', 'EPP', 'Señalización', 'Computador', 'Sistema ERP', 'Lector de código de barras', 'Impresora de etiquetas', 'Cámara para evidencia'],
    blocks: [
      { type: 'list', title: 'Atributos de control', items: ['Código del producto', 'Descripción estandarizada', 'Unidad de medida (unidad, par, caja, kg, litro, metro)', 'Marca / fabricante', 'Modelo o número de parte', 'Número de serie / lote', 'Cantidad', 'Estado: conforme, pendiente, dañado, rechazado', 'Equipo asociado', 'Ubicación'] },
      { type: 'steps', title: 'Procedimiento', items: ['Recepción del material', 'Revisión de documentos: orden de compra, guía de despacho, factura, ficha técnica', 'Inspección física: código, marca, modelo, N° de parte, serie, lote, cantidad y estado', 'Comparación: lo físico contra lo documental y lo del ERP', 'Etiquetado: código, descripción, unidad, lote/serie, fecha de ingreso y ubicación', 'Registro en el sistema', 'Almacenamiento definitivo, o traslado a la zona de identificación pendiente si hay falla'] }
    ],
    fallas: ['sin-codigo', 'codigo-no-erp', 'codigo-ilegible', 'sin-etiqueta', 'desc-incorrecta', 'codigo-duplicado', 'unidad-incorrecta', 'marca-incorrecta', 'sin-equipo', 'danado', 'incompatible'],
    indicadores: ['exac-attr', 'sin-cod', 'err-attr'],
    resultado: 'Cada material validado en todos sus atributos, etiquetado, registrado y asociado a una ubicación. Si hay diferencia, permanece separado hasta validar el atributo.',
    nota: 'Esta sección repite en gran parte el procedimiento de «Identificar» (mismos 7 pasos, mismas fallas y mismos roles). El grupo debería decidir qué las diferencia.' },

  { id: 'etiquetar', n: 11, fase: 'catalogo', t: 'Etiquetar y codificar',
    resumen: 'Poner a cada material una etiqueta legible, con un código que se pueda leer rápido y que coincida con el sistema.',
    roles: ['jefe', 'bodeguero', 'inventario'],
    docs: ['Orden de compra', 'Guía de despacho', 'Factura', 'Registro de recepción de materiales', 'Ficha de material', 'Registro de inventario', 'Procedimiento de identificación y etiquetado', 'Registro de códigos de barra o código interno'],
    recursos: ['Etiquetas adhesivas', 'Impresora de etiquetas', 'Lector de código de barras/QR', 'Computador o tablet', 'Marcadores permanentes', 'Cintas adhesivas', 'Fundas protectoras para etiquetas', 'EPP según las condiciones del área'],
    blocks: [
      { type: 'text', title: 'Sistema de codificación', html: 'Se recomienda el <b>sistema alfanumérico</b>: combinación de letras y números que permite identificar la categoría, el tipo de producto y sus características.' },
      { type: 'table', title: 'Tipos de etiqueta', head: ['Tipo', 'Cuándo conviene'], rows: [
        ['Código de barras', 'Lectura rápida con pistolas láser'],
        ['Código QR', 'Guardar más información en poco espacio'],
        ['RFID', 'Lectura por radiofrecuencia a distancia (tecnología avanzada)']
      ] },
      { type: 'steps', title: 'Funciones', items: ['Identificar cada material recibido', 'Verificar que la información de la etiqueta coincida con la documentación', 'Asignar código interno, código de barras o QR', 'Registrar el material en el sistema de inventario/ERP', 'Colocar la etiqueta en un lugar visible y seguro', 'Indicar código, descripción, cantidad, unidad de medida y ubicación', 'Reemplazar etiquetas dañadas o ilegibles', 'Verificar que los materiales peligrosos tengan su identificación y señalización correspondiente'] },
      { type: 'widget', name: 'etiqueta', title: 'Prueba: diseñar una etiqueta' }
    ],
    fallas: ['codigo-ilegible', 'sin-etiqueta'],
    resultado: 'Material con etiqueta legible, visible y coherente con el ERP.' },

  /* ===== ALMACENAMIENTO Y CONTROL ===== */
  { id: 'ubicar', n: 12, fase: 'control', t: 'Ubicar el material en la bodega',
    resumen: 'Definir dónde se guarda cada cosa para optimizar el espacio y los tiempos de búsqueda.',
    roles: ['jefe', 'bodeguero', 'inventario'],
    docs: ['Guía de recepción', 'Orden de almacenamiento', 'Registro de inventario'],
    recursos: ['Sistema de información (ERP)', 'Lectores de códigos portátiles (PDA) con red inalámbrica', 'Transpaletas, grúas horquilla o apiladores'],
    blocks: [
      { type: 'text', title: 'Métodos de distribución (layout)', html: '<b>Clasificación ABC:</b> alta rotación (A) cerca de las puertas de salida, rotación media (B) al centro, baja rotación (C) al fondo.<br><b>Posición fija o caótica:</b> fija = cada producto tiene un lugar único; variable = se asigna el espacio libre disponible mediante software.<br><b>Codificación de ubicaciones:</b> divide la bodega en coordenadas.' },
      { type: 'widget', name: 'abc', title: 'Esquema: clasificación ABC' },
      { type: 'table', title: 'Quién hace qué', head: ['Rol', 'Responsabilidad'], rows: [
        ['Jefe de bodega', 'Supervisa el orden del inventario, aprueba los movimientos y valida que se respete el sistema de ubicación'],
        ['Bodeguero', 'Recibe la mercancía, pega las etiquetas, escanea los códigos y coloca los materiales en la posición asignada'],
        ['Digitador / analista de inventario', 'Registra los códigos en el sistema y actualiza los cambios de ubicación']
      ] },
      { type: 'table', title: 'Documentación', head: ['Documento', 'Función'], rows: [
        ['Guía de recepción', 'Registro de que lo que entra fue verificado y se le asigna su nueva etiqueta'],
        ['Orden de almacenamiento', 'Indica al operario el código del producto y la coordenada exacta donde guardarlo'],
        ['Registro de inventario', 'Historial digital o físico de entradas, salidas y ubicaciones actuales de cada código']
      ] }
    ],
    resultado: 'Cada material en su posición asignada, con la ubicación actualizada en el sistema.' },

  { id: 'registrar-derivar', n: 13, fase: 'control', t: 'Registrar y derivar',
    resumen: 'Registrar formalmente cada movimiento (ingreso, salida, traslado interno) para tener trazabilidad.',
    objetivo: 'El registro es el ingreso formal de los datos de la mercancía al sistema de la empresa (generalmente un software). Su objetivo es la trazabilidad.',
    roles: ['bodeguero', 'inventario', 'admin'],
    docs: ['Orden de compra', 'Guía de despacho', 'Factura', 'Registro de ingreso o recepción de mercadería', 'Vale de salida o solicitud de materiales', 'Registro de inventario', 'Documento de derivación o traslado interno'],
    recursos: ['Computador', 'Sistema ERP o software de inventario', 'Lector de código de barra', 'Etiquetas y códigos de identificación', 'Impresora', 'Formularios de registro', 'Transpaleta o carro para traslado'],
    blocks: [
      { type: 'steps', title: 'Funciones', items: ['Registrar correctamente el ingreso o salida de los materiales en el sistema', 'Verificar que la información registrada coincida con la documentación', 'Actualizar las existencias del inventario', 'Identificar y etiquetar los materiales', 'Derivar los materiales al área correspondiente', 'Registrar los movimientos internos de materiales', 'Informar diferencias, materiales faltantes o errores detectados', 'Mantener la documentación ordenada y disponible para su control'] }
    ],
    resultado: 'Movimientos registrados, existencias actualizadas y documentación disponible.',
    nota: 'El manual menciona «vale de salida», pero no tiene una etapa de despacho/salida. Ver brechas en la página «Acerca».' },

  { id: 'discrepancias', n: 14, fase: 'control', t: 'Gestionar discrepancias',
    resumen: 'Resolver cualquier diferencia entre lo solicitado, lo documentado y lo recibido, y evitar que el material no conforme se use.',
    objetivo: 'Identificar, registrar y resolver cualquier diferencia detectada entre lo solicitado, lo documentado y lo recibido, asegurando que el inventario refleje la realidad y que el material no conforme no sea utilizado.',
    roles: ['bodeguero', 'jefe', 'abast'],
    docs: ['Orden de compra', 'Guía de despacho', 'Factura (si aplica)', 'Acta o registro de discrepancia', 'Evidencia fotográfica', 'Correos o registros de comunicación con el proveedor'],
    recursos: ['Computador con acceso al sistema', 'Teléfono o correo corporativo', 'Cámara o dispositivo móvil', 'Etiquetas de «Material No Conforme»', 'Área de cuarentena o rechazo'],
    blocks: [
      { type: 'table', title: 'Quién hace qué', head: ['Rol', 'Responsabilidades'], rows: [
        ['Bodeguero', 'Detectar la discrepancia en la recepción · Registrar la observación · Tomar evidencia fotográfica · Informar al supervisor · Segregar el material observado'],
        ['Supervisor de bodega', 'Validar la discrepancia · Coordinar acciones correctivas · Autorizar el cierre del caso una vez resuelto'],
        ['Abastecimiento / Compras', 'Gestionar el reclamo con el proveedor · Coordinar reposiciones, devoluciones o notas de crédito']
      ] },
      { type: 'steps', title: 'Actividades', items: ['Detectar la diferencia entre lo solicitado y lo recibido', 'Registrar la discrepancia indicando producto, cantidad, fecha y motivo', 'Tomar evidencia fotográfica cuando corresponda', 'Separar el material no conforme del stock disponible', 'Informar al supervisor de bodega y al área de Compras', 'Gestionar la solución con el proveedor', 'Actualizar los registros y cerrar el caso una vez resuelto'] },
      { type: 'widget', name: 'incidencias-link', title: 'Registro de incidencias' }
    ],
    fallas: ['sin-codigo', 'sin-oc', 'danado', 'cantidad-distinta', 'doc-incompleta'],
    resultado: 'Caso cerrado con registro, solución con el proveedor y material no conforme fuera del stock disponible.' }
];

/* Registro de incidencias de ejemplo (tomado del manual) */
WIKI.incidenciasEjemplo = [
  { fecha: '01/09/2026', material: 'Repuesto hidráulico', problema: 'Sin código', accion: 'Solicitar creación de código', resp: 'Encargado de inventario', estado: 'Pendiente' },
  { fecha: '01/09/2026', material: 'Filtro', problema: 'Código ilegible', accion: 'Reimpresión de etiqueta', resp: 'Bodeguero', estado: 'Cerrado' },
  { fecha: '01/09/2026', material: 'Rodamiento', problema: 'Cantidad diferente', accion: 'Realizar un nuevo conteo', resp: 'Jefe de bodega', estado: 'En revisión' }
];
