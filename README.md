# BodegaWiki

Wiki de administración de bodega e inventario minero. Prototipo académico de la carrera
**Administración de Procesos Mineros** (asignatura *Administración de Bodegas e Inventarios*).

Convierte el «Manual de administración de bodega e inventario 2026», elaborado por estudiantes,
en una consulta rápida y editable: 14 etapas, catálogo de fallas, glosario, indicadores y una
página que compara el contenido con el programa de la asignatura.

## Cómo se usa

Es un sitio estático: no necesita servidor ni instalación. Abre `index.html` o visita la versión publicada.

## Cómo se edita

- Cualquier página tiene el botón **Editar**; también se pueden crear páginas, fallas, términos, indicadores y roles.
- Los cambios se guardan en el navegador de cada persona y quedan en el historial.
- Para compartirlos: **Importar y exportar** → cada persona exporta su archivo, quien coordina los importa,
  genera `contribuciones.js` con «Preparar para publicar» y reemplaza ese archivo en el repositorio.

## Estructura

| Archivo | Contenido |
|---|---|
| `data.js` | Contenido original del manual (etapas, fallas, glosario, indicadores, roles) |
| `data-programa.js` | Contenidos del programa de la asignatura y datos de la portada |
| `contribuciones.js` | Cambios publicados por el curso (reemplazar al publicar) |
| `store.js`, `wikitext.js`, `views.js`, `editors.js`, `app.js` | Lógica del wiki |
| `styles.css`, `index.html` | Diseño |
