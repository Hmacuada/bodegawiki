/* Programa de la asignatura «Administración de Bodegas e Inventarios» (PMI2ADBIN, 2025)
   Carrera: Administración de Procesos Mineros.
   Cada contenido tiene un estado base (cubierto / parcial / pendiente) según el manual actual.
   Cuando se crea una página y se marca «cubre este contenido», el estado sube solo. */

WIKI.programa = [
  { u: 1, nombre: 'Recepción y clasificación de materiales', horas: 25, items: [
    { id: 'u1-recepcion', t: 'Recepción física y documental', est: 'cubierto', pags: ['preparacion', 'documentacion', 'descarga'] },
    { id: 'u1-guias', t: 'Guías de despacho y órdenes internas', est: 'cubierto', pags: ['documentacion'] },
    { id: 'u1-verif', t: 'Verificación de cantidades y condiciones', est: 'cubierto', pags: ['verificacion'] },
    { id: 'u1-clasif', t: 'Clasificación por tipo, uso y criticidad', est: 'parcial', pags: ['tipo-uso', 'familia'], nota: 'Falta el criterio de criticidad.' },
    { id: 'u1-cod', t: 'Codificación interna de materiales', est: 'cubierto', pags: ['etiquetar', 'identificar'] },
    { id: 'u1-reg', t: 'Registro inicial de ingresos', est: 'cubierto', pags: ['registro-ingreso'] },
    { id: 'u1-traz', t: 'Trazabilidad de materiales', est: 'parcial', pags: ['identificar'], nota: 'Se menciona en varias etapas pero no tiene página propia.' },
    { id: 'u1-nc', t: 'No conformidades de recepción', est: 'cubierto', pags: ['discrepancias'] }
  ] },
  { u: 2, nombre: 'Almacenamiento y organización de bodega', horas: 20, items: [
    { id: 'u2-sistemas', t: 'Sistemas de almacenamiento', est: 'pendiente', pags: [] },
    { id: 'u2-estiba', t: 'Estiba y apilamiento seguro', est: 'pendiente', pags: [] },
    { id: 'u2-ubic', t: 'Ubicación física de materiales', est: 'cubierto', pags: ['ubicar'] },
    { id: 'u2-layout', t: 'Layout básico de bodega', est: 'parcial', pags: ['ubicar'], nota: 'Solo clasificación ABC y posición fija/caótica.' },
    { id: 'u2-zonif', t: 'Zonificación de áreas internas', est: 'parcial', pags: ['identificar'], nota: 'Solo la zona de identificación pendiente.' },
    { id: 'u2-rotacion', t: 'Rotación de materiales', est: 'pendiente', pags: [] },
    { id: 'u2-orden', t: 'Orden y limpieza operacional', est: 'pendiente', pags: [] },
    { id: 'u2-seguridad', t: 'Seguridad en bodegas', est: 'pendiente', pags: [] },
    { id: 'u2-senal', t: 'Señalización básica y control visual de orden', est: 'pendiente', pags: [] }
  ] },
  { u: 3, nombre: 'Control de inventarios y exactitud de existencias', horas: 20, items: [
    { id: 'u3-concepto', t: 'Conceptos generales de inventario', est: 'pendiente', pags: [] },
    { id: 'u3-tipos', t: 'Tipos de inventario: operativo, cíclico y general', est: 'pendiente', pags: [] },
    { id: 'u3-conteos', t: 'Conteos programados y conteos físicos', est: 'pendiente', pags: [] },
    { id: 'u3-ajustes', t: 'Ajustes de existencias', est: 'pendiente', pags: [] },
    { id: 'u3-difs', t: 'Diferencias físico-sistémicas', est: 'parcial', pags: [], nota: 'Hay una falla sobre diferencia de cantidad, pero no el tema completo.' },
    { id: 'u3-exactitud', t: 'Exactitud de inventario', est: 'parcial', pags: ['identificar', 'homologar'], nota: 'Hay indicadores de exactitud de identificación y atributos, no de existencias.' },
    { id: 'u3-stock', t: 'Stock mínimo y reposición interna', est: 'pendiente', pags: [] },
    { id: 'u3-concil', t: 'Conciliación básica y reportabilidad de existencias', est: 'pendiente', pags: [] }
  ] },
  { u: 4, nombre: 'Sistemas de registro y distribución interna', horas: 25, items: [
    { id: 'u4-wms', t: 'Sistemas WMS básicos', est: 'pendiente', pags: [] },
    { id: 'u4-erp', t: 'ERP aplicado a bodegas', est: 'parcial', pags: ['registro-ingreso', 'registrar-derivar'], nota: 'El ERP se usa en todo el manual, pero no se explican sus funciones.' },
    { id: 'u4-solic', t: 'Solicitudes internas de materiales', est: 'pendiente', pags: [] },
    { id: 'u4-vale', t: 'Vale de salida', est: 'parcial', pags: ['registrar-derivar'], nota: 'Solo se nombra como documento.' },
    { id: 'u4-mov', t: 'Registro de movimientos internos', est: 'parcial', pags: ['registrar-derivar'] },
    { id: 'u4-picking', t: 'Picking interno', est: 'pendiente', pags: [] },
    { id: 'u4-entrega', t: 'Entrega a áreas usuarias', est: 'pendiente', pags: [] },
    { id: 'u4-ind', t: 'Indicadores de despacho interno', est: 'pendiente', pags: [] },
    { id: 'u4-mejora', t: 'Mejora continua en operaciones internas', est: 'pendiente', pags: [] }
  ] }
];

WIKI.programaMeta = {
  asignatura: 'Administración de Bodegas e Inventarios',
  codigo: 'PMI2ADBIN',
  carrera: 'Administración de Procesos Mineros',
  horas: 90
};

/* Contenido de la portada */
WIKI.portada = {
  destacado: 'homologar',
  sabias: [
    '… que un repuesto que parece correcto puede no ser compatible con el equipo minero? Por eso se [[Repuesto incompatible|separa y no se almacena como disponible]] hasta consultar a mantenimiento.',
    '… que a un material sin código \'\'\'no se le debe asignar un código arbitrario\'\'\'? Se deja en la [[Zona de identificación pendiente]] y se solicita la creación de uno nuevo.',
    '… que en la [[Clasificación ABC]] los productos de mayor rotación se ubican cerca de las puertas de salida?',
    '… que «Filtro aceite», «Filtre de aceite» y «Oil filter» pueden ser el mismo producto? [[Homologar|Homologarlos]] evita comprarlo dos veces.',
    '… que dos filtros que se ven iguales pueden tener distinta capacidad? En ese caso [[Producto similar, pero técnicamente diferente|no se homologan]] y mantienen códigos independientes.',
    '… que si la guía dice 100 unidades y llegan 95, lo primero es hacer [[Diferencia entre cantidad física y documentación|un segundo conteo]]?',
    '… que una guía de despacho se firma «conforme» o «con observaciones», y que el material observado se registra aparte para no confundirlo con el aceptado?',
    '… que si falta la orden de compra \'\'\'no se hace el ingreso definitivo\'\'\' al inventario? Se mantiene el material en observación mientras Compras entrega una copia.'
  ]
};


