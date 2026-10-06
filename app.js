/* Router, barra lateral y buscador */
(function () {
  const BW = window.BW, V = BW.V, esc = BW.esc;
  const $ = (s, r = document) => r.querySelector(s);

  function panel() {
    const L = (href, t, extra) => `<li><a href="${href}" ${extra || ''}>${t}</a></li>`;
    $('#panel').innerHTML = `<a class="logo" href="#/"><span class="globe">⛏</span><b>BodegaWiki</b><small>la bodega minera abierta</small></a>
      <div class="portlet"><h3>Navegación</h3><ul>${L('#/', 'Portada')}${L('#/cambios', 'Cambios recientes')}${L('#/azar', 'Página aleatoria')}${L('#/programa', 'Programa de asignatura')}${L('#/paginas', 'Todas las páginas')}</ul></div>
      <div class="portlet"><h3>Consultar</h3><ul>${L('#/fallas', 'Catálogo de fallas')}${L('#/glosario', 'Glosario')}${L('#/indicadores', 'Indicadores')}${L('#/documentos', 'Documentos')}${L('#/roles', 'Roles')}${L('#/incidencias', 'Registro de incidencias')}</ul></div>
      <div class="portlet"><h3>Contribuir</h3><ul>${L('#/nueva', 'Crear una página')}${L('#/nueva-falla', 'Agregar una falla')}${L('#/nuevo-termino', 'Agregar un término')}${L('#/contribuir', 'Importar y exportar')}</ul></div>
      <div class="portlet"><h3>Herramientas</h3><ul><li><a href="#" id="prt">Imprimir esta página</a></li>${L('#/acerca', 'Acerca de BodegaWiki')}</ul></div>`;
    $('#prt').addEventListener('click', e => { e.preventDefault(); window.print(); });
    const u = BW.user();
    $('#personal').innerHTML = `<a href="#/contribuir">${u ? '👤 ' + esc(u) : '👤 Identificarse'}</a><a href="#/cambios">Cambios recientes</a>`;
  }

  function route() {
    const parts = (location.hash || '#/').slice(2).split('?');
    const seg = parts[0].split('/').map(decodeURIComponent);
    const params = Object.fromEntries(new URLSearchParams(parts[1] || ''));
    const [p, a, b] = seg;
    document.body.classList.remove('side-open');
    panel();
    const T = BW.ROUTE_TYPE;
    try {
      if (!p) return V.portada();
      if (p === 'p' || p === 'etapa') return V.page(a);
      if (p === 'editar') return V.editPage(a, b);
      if (p === 'nueva') return a ? V.editPage('__new', null, { titulo: a, cubre: params.cubre }) : V.editPage('__new', null, { cubre: params.cubre });
      if (p === 'discusion') return V.talk(a);
      if (p === 'historial') return V.history(a, b);
      if (p === 'fallas') return V.fallas(a);
      if (p === 'glosario') return V.glosario(a);
      if (p === 'indicadores') return V.indicadores(a);
      if (p === 'roles') return V.roles(a);
      if (T[p]) return V.editGeneric(T[p], a);
      if (p === 'azar') { const ps = BW.S.pages; location.replace('#/p/' + ps[Math.floor(Math.random() * ps.length)].id); return; }
      if (V[p]) return V[p](a);
      V.missing(parts[0]);
    } catch (e) { console.error(e); $('#content').innerHTML = `<div class="mw-body"><h1 class="firstHeading">Error</h1><p>${esc(e.message)}</p><p><a href="#/">Volver a la portada</a></p></div>`; }
  }
  BW.route = route;

  /* Buscador */
  const q = $('#q'), res = $('#results');
  q.addEventListener('input', () => {
    const hits = BW.search(q.value).slice(0, 10);
    if (!q.value.trim()) { res.hidden = true; return; }
    res.innerHTML = (hits.length ? hits.map(h => `<a href="${h.href}"><span class="tag">${esc(h.tag)}</span> <b>${esc(h.t)}</b><small>${esc(h.s.length > 100 ? h.s.slice(0, 100) + '…' : h.s)}</small></a>`).join('') : '<div class="none">Sin coincidencias.</div>') + `<a href="#/buscar/${encodeURIComponent(q.value.trim())}" class="all">Ver todos los resultados para «${esc(q.value.trim())}»</a>`;
    res.hidden = false;
  });
  $('#sf').addEventListener('submit', e => { e.preventDefault(); if (q.value.trim()) { location.hash = '#/buscar/' + encodeURIComponent(q.value.trim()); res.hidden = true; } });
  res.addEventListener('click', () => { res.hidden = true; q.value = ''; });
  document.addEventListener('click', e => { if (!e.target.closest('.search')) res.hidden = true; });
  document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); } if (e.key === 'Escape') res.hidden = true; });
  $('#burger').addEventListener('click', () => document.body.classList.toggle('side-open'));
  $('#panel').addEventListener('click', e => { if (e.target.closest('a')) document.body.classList.remove('side-open'); });

  BW.init();
  window.addEventListener('hashchange', route);
  route();
})();
