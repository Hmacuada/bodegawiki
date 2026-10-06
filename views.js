/* Vistas del wiki (solo lectura y páginas especiales). Los editores están en editors.js */
(function () {
  const BW = window.BW, W = window.WIKI, esc = BW.esc, norm = BW.norm;
  const $ = (s, r = document) => r.querySelector(s);
  const V = (BW.V = {});

  /* ---------- Marco de página ---------- */
  function show(o) {
    const tabs = o.tabs || [];
    const t = (list, cls) => `<div class="tabgrp ${cls || ''}">${list.map(x => `<a class="tab ${x.sel ? 'sel' : ''}" href="${x.href}">${esc(x.t)}</a>`).join('')}</div>`;
    $('#tabs').innerHTML = t(tabs.filter(x => !x.r)) + t(tabs.filter(x => x.r), 'right');
    $('#content').innerHTML = o.html;
    $('#foot').innerHTML = o.foot || 'BodegaWiki · prototipo académico de Operaciones Mineras. Contenido original: «Manual de administración de bodega e inventario 2026».';
    document.title = (o.title ? o.title + ' – ' : '') + 'BodegaWiki';
    const body = $('#content');
    if (o.autolink !== false) BW.autolink($('.mw-body', body));
    BW.bindContent(body, o.pageId);
    if (o.after) o.after(body);
    if (!o.keepScroll) window.scrollTo(0, 0);
  }
  BW.show = show;
  const head = (title, sub) => `<h1 class="firstHeading">${title}</h1><div class="siteSub">${sub || 'De BodegaWiki, la bodega minera abierta'}</div>`;
  const faseChip = f => `<a class="faseChip" style="background:${f.color}" href="#/categoria/${f.id}">${esc(f.nombre)}</a>`;
  const editLinks = (type, id) => `<span class="editsec">[<a href="#/${{ falla: 'editar-falla', gloss: 'editar-termino', ind: 'editar-indicador', role: 'editar-rol' }[type]}/${id}">editar</a> · <a href="#/historial/${type}/${id}">historial</a>]</span>`;

  /* ---------- Widgets de wikitexto ---------- */
  BW.labelHTML = function (v) {
    let bars = '', seed = 7;
    for (const ch of (v.cod || 'X') + 'END') seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
    for (let i = 0; i < 46; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; bars += `<i style="width:${1 + (seed % 3)}px;margin-right:${1 + ((seed >> 3) % 3)}px"></i>`; }
    return `<div class="label-prev"><div class="code">${esc(v.cod || '—')}</div><div>${esc(v.desc || 'Descripción')}</div><div class="bars">${bars}</div>
      <div class="row"><span>U.M.: ${esc(v.um || '—')}</span><span>Lote/Serie: ${esc(v.ls || '—')}</span></div>
      <div class="row"><span>Ingreso: ${esc(v.fi || '—')}</span><span>Ubic.: ${esc(v.ub || '—')}</span></div></div>`;
  };
  BW.widget = function (name) {
    if (name === 'incidencias-link') return `<p>Toda falla debe quedar registrada con fecha, material, problema, acción, responsable y estado. → <a href="#/incidencias">Abrir el registro de incidencias</a></p>`;
    if (name === 'abc') return `<div class="abc-door">⬇ Puerta de salida / despacho</div><div class="abc"><div class="a"><b>A</b>Rotación alta<br>cerca de la salida</div><div class="b"><b>B</b>Rotación media<br>al centro</div><div class="c"><b>C</b>Rotación baja<br>al fondo</div></div>`;
    if (name === 'etiqueta') {
      const d = { cod: 'FH-0452', desc: 'FILTRO HIDRÁULICO 10 MICRAS', um: 'UN', ls: 'L2026-09', fi: '01/09/2026', ub: 'A-03-2' };
      return `<p>Prueba con los campos que exige el manual. Vista previa ilustrativa (las barras no son un código real).</p><div class="two"><div class="form noauto">${[['cod', 'Código'], ['desc', 'Descripción'], ['um', 'Unidad de medida'], ['ls', 'Lote o serie'], ['fi', 'Fecha de ingreso'], ['ub', 'Ubicación']].map(([k, l]) => `<label>${l}<input class="field" data-lab="${k}" value="${esc(d[k])}"></label>`).join('')}</div><div id="labprev">${BW.labelHTML(d)}</div></div>`;
    }
    return `<div class="ambox note">Widget desconocido: ${esc(name)}</div>`;
  };

  /* ---------- Categorías ---------- */
  function categories() {
    const cats = {};
    W.fases.forEach(f => (cats[f.id] = { id: f.id, name: f.nombre, pages: [] }));
    BW.S.pages.forEach(p => {
      if (p.fase && cats[p.fase]) cats[p.fase].pages.push(p);
      (p.cats || []).forEach(c => { const id = BW.slug(c); (cats[id] = cats[id] || { id, name: c, pages: [] }).pages.push(p); });
    });
    return cats;
  }
  const sortPages = l => l.slice().sort((a, b) => (a.n || 999) - (b.n || 999) || a.t.localeCompare(b.t, 'es'));

  /* ---------- Artículo ---------- */
  function pageTabs(id, mode) {
    return [
      { t: 'Artículo', href: '#/p/' + id, sel: mode === 'read' },
      { t: 'Discusión', href: '#/discusion/' + id, sel: mode === 'talk' },
      { t: 'Leer', href: '#/p/' + id, sel: mode === 'read', r: true },
      { t: 'Editar', href: '#/editar/' + id, sel: mode === 'edit', r: true },
      { t: 'Ver historial', href: '#/historial/page/' + id, sel: mode === 'hist', r: true }
    ];
  }
  BW.pageTabs = pageTabs;

  function navbox(cur) {
    const rows = W.fases.map(f => {
      const ps = sortPages(BW.S.pages.filter(p => p.fase === f.id));
      return ps.length ? `<tr><th style="background:${f.color}">${esc(f.nombre)}</th><td>${ps.map(p => p.id === cur ? `<b>${p.n ? p.n + '. ' : ''}${esc(p.t)}</b>` : `<a href="#/p/${p.id}" class="${p.stub ? 'stubl' : ''}">${p.n ? p.n + '. ' : ''}${esc(p.t)}</a>`).join(' · ')}</td></tr>` : '';
    }).join('');
    const others = sortPages(BW.S.pages.filter(p => !p.fase || !BW.fase(p.fase)));
    const orow = others.length ? `<tr><th style="background:#6b7280">Otras páginas</th><td>${others.map(p => p.id === cur ? `<b>${esc(p.t)}</b>` : `<a href="#/p/${p.id}">${esc(p.t)}</a>`).join(' · ')}</td></tr>` : '';
    return `<table class="navbox"><caption>Proceso de administración de bodega</caption>${rows}${orow}</table>`;
  }

  V.page = function (id) {
    const p = BW.page(id); if (!p) return V.missing(id);
    const f = p.fase ? BW.fase(p.fase) : null;
    const r = BW.render(p.texto, { pageId: id, editable: true });
    const roles = (p.roles || []).map(x => BW.get('role', x)).filter(Boolean);
    const fallas = (p.fallas || []).map(x => BW.get('falla', x)).filter(Boolean);
    const inds = (p.indicadores || []).map(x => BW.get('ind', x)).filter(Boolean);
    const col = f ? f.color : '#6b7280';
    const row = (k, v) => v ? `<tr><th>${k}</th><td>${v}</td></tr>` : '';
    const ul = a => (a && a.length ? '<ul>' + a.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : '');
    const info = `<table class="infobox"><caption style="background:${col}">${p.n ? 'Etapa ' + p.n + ' · ' : ''}${esc(p.t)}</caption>
      ${row('Fase', f ? `<a href="#/categoria/${f.id}">${esc(f.nombre)}</a>` : '')}
      ${row('Responsables', roles.map(x => `<a href="#/roles/${x.id}">${esc(x.n)}</a>`).join('<br>'))}
      ${row('Documentos', ul(p.docs))}
      ${row('Recursos', ul(p.recursos))}
      ${row('Programa', (() => { const hit = BW.coverage().flatMap(u => u.items.filter(i => i.pags.includes(p.id)).map(i => `U${u.u}: ${esc(i.t)}`)); return hit.length ? '<ul>' + hit.slice(0, 4).map(x => `<li>${x}</li>`).join('') + '</ul>' : ''; })())}
    </table>`;
    const ambox = p.stub ? `<div class="ambox stub"><b>Esta página está incompleta.</b> ${esc(p.aviso || 'Necesita contenido.')} <a href="#/editar/${id}">Puedes ayudar editándola.</a></div>`
      : p.aviso ? `<div class="ambox note"><b>Nota del equipo editor.</b> ${esc(p.aviso)}</div>` : '';
    const toc = r.toc.length >= 3 ? `<div class="toc"><div class="toctitle">Contenido</div><ul>${r.toc.map(t => `<li class="l${t.lvl}"><a href="#/p/${id}" data-jump="${t.id}"><span class="tn">${t.num}</span> ${esc(t.txt)}</a></li>`).join('')}</ul></div>` : '';
    let see = '';
    if (fallas.length || inds.length) {
      see = '<h2>Véase también</h2>';
      if (fallas.length) see += `<p><b>Fallas y acciones correctivas</b></p><ul>${fallas.map(x => `<li><a href="#/fallas/${x.id}">${esc(x.t)}</a></li>`).join('')}</ul>`;
      if (inds.length) see += `<p><b>Indicadores de control</b></p><ul>${inds.map(x => `<li><a href="#/indicadores/${x.id}">${esc(x.n)}</a> — ${esc(x.num)} ÷ ${esc(x.den)} × 100</li>`).join('')}</ul>`;
    }
    const cats = [f && `<a href="#/categoria/${f.id}">${esc(f.nombre)}</a>`, ...(p.cats || []).map(c => `<a href="#/categoria/${BW.slug(c)}">${esc(c)}</a>`)].filter(Boolean);
    const catHtml = `<div class="catlinks"><b>Categorías:</b> ${cats.length ? cats.join(' | ') : '<i>sin categoría</i>'}</div>`;
    const last = BW.lastEdit('page', id);
    const foot = last ? `Esta página se editó por última vez el ${BW.fmt(last.ts)} por ${esc(last.user)}.` : 'Contenido original del «Manual de administración de bodega e inventario 2026».';
    show({
      tabs: pageTabs(id, 'read'), title: p.t, pageId: id, foot,
      html: `${head(esc(p.t))}<div class="mw-body">${ambox}${info}<p class="lead">${BW.inline(p.resumen)}</p>${toc}${r.html}${see}${catHtml}${navbox(id)}</div>`,
      after: c => c.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); const t = document.getElementById(a.dataset.jump); if (t) t.scrollIntoView({ behavior: 'smooth' }); }))
    });
  };

  V.missing = function (id) {
    show({ tabs: [{ t: 'Página', href: '#/', sel: true }], title: 'No existe', html: `${head('Esta página no existe')}<div class="mw-body"><p>No hay una página llamada «${esc(id)}».</p><p><a class="btn" href="#/nueva/${encodeURIComponent(id)}">Crearla ahora</a> · <a href="#/">Ir a la portada</a></p></div>` });
  };

  /* ---------- Discusión ---------- */
  V.talk = function (id) {
    const p = BW.page(id); if (!p) return V.missing(id);
    const list = BW.talk(id);
    show({
      tabs: pageTabs(id, 'talk'), title: 'Discusión: ' + p.t,
      html: `${head('Discusión: ' + esc(p.t))}<div class="mw-body"><p>Espacio para dudas, observaciones y propuestas sobre esta página. Firma tu comentario con tu nombre.</p>
        ${list.length ? list.map(t => `<div class="talk"><div class="th"><b>${esc(t.user)}</b> · ${BW.fmt(t.ts)}</div><div>${esc(t.text).replace(/\n/g, '<br>')}</div></div>`).join('') : '<p><i>Todavía no hay comentarios.</i></p>'}
        <h2>Agregar comentario</h2><form id="tf" class="form"><label>Tu nombre<input class="field" name="u" value="${esc(BW.user())}" required></label><label>Comentario<textarea class="field" name="x" rows="4" required></textarea></label><div><button class="btn" type="submit">Publicar</button></div></form></div>`,
      after: c => $('#tf', c).addEventListener('submit', ev => { ev.preventDefault(); const f = ev.target; BW.setUser(f.u.value.trim()); BW.addTalk(id, f.x.value.trim()); V.talk(id); })
    });
  };

  /* ---------- Historial ---------- */
  V.history = function (type, key) {
    const hs = BW.history(type, key);
    const title = BW.titleOf(type, key, hs[0]);
    const tabs = type === 'page' ? pageTabs(key, 'hist') : [{ t: BW.TYPE_LABEL[type], href: BW.hrefOf(type, key) }, { t: 'Ver historial', href: '#/historial/' + type + '/' + key, sel: true, r: true }];
    show({
      tabs, title: 'Historial: ' + title,
      html: `${head('Historial de «' + esc(title) + '»')}<div class="mw-body">${hs.length ? `<p>Cada versión guardada se puede restaurar. Los cambios se guardan en este navegador (ver <a href="#/contribuir">Importar y exportar</a>).</p><ul class="histlist">${hs.map((h, i) => { const d = BW.size(h); return `<li><span class="hd">${BW.fmt(h.ts)}</span> <b>${esc(h.user)}</b> <span class="delta ${d < 0 ? 'neg' : 'pos'}">${d >= 0 ? '+' : ''}${d}</span> <i>${esc(h.summary || 'sin resumen')}</i> ${h.next ? `<a href="#" data-rv="${h.id}">${i === 0 ? '(versión actual)' : 'restaurar esta versión'}</a>` : '<span class="del">(eliminada)</span>'}</li>`; }).join('')}</ul>` : '<p>Esta página no se ha editado: es el contenido original del manual.</p>'}</div>`,
      after: c => c.querySelectorAll('[data-rv]').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); if (a.textContent.includes('actual')) return; if (confirm('¿Restaurar esta versión?')) { BW.revert(a.dataset.rv); location.hash = BW.hrefOf(type, key); BW.route(); } }))
    });
  };

  /* ---------- Portada ---------- */
  const box = (cls, title, inner) => `<section class="mp-box ${cls}"><h2>${title}</h2><div class="mpb">${inner}</div></section>`;
  V.portada = function () {
    const S = BW.S, cov = BW.coverage();
    const items = cov.flatMap(u => u.items);
    const totalItems = items.length, covered = items.filter(i => i.est === 'cubierto').length;
    const feat = BW.page(W.portada.destacado) || S.pages[0];
    const sab = W.portada.sabias.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    const rec = BW.allHist().slice(0, 5);
    const pend = S.pages.filter(p => p.stub);
    const pendProg = items.filter(i => i.est === 'pendiente').slice(0, 6);
    const flow = W.fases.map(f => { const ps = sortPages(S.pages.filter(p => p.fase === f.id)); return `<div class="flowrow"><span class="flowlbl" style="background:${f.color}">${esc(f.nombre)}</span><span>${ps.map(p => `<a href="#/p/${p.id}" class="${p.stub ? 'stubl' : ''}"><small>${p.n || ''}</small> ${esc(p.t)}</a>`).join('')}</span></div>`; }).join('');
    show({
      tabs: [{ t: 'Portada', href: '#/', sel: true }], title: 'Portada', autolink: false,
      html: `<div class="mw-body mainpage">
        <div class="mp-banner"><div class="mp-welcome"><h1>Te damos la bienvenida a <span>BodegaWiki</span></h1><p>el wiki de la bodega minera, que cualquier estudiante puede editar.</p></div>
          <div class="mp-count"><b>${S.pages.length}</b> páginas · <b>${S.fallas.length}</b> fallas · <b>${S.gloss.length}</b> términos · <b>${S.ind.length}</b> indicadores</div></div>
        <form class="mp-search" id="mpsearch"><input class="field" id="mpq" placeholder="Buscar en BodegaWiki: «código ilegible», «homologar», «guía de despacho»…"><button class="btn" type="submit">Buscar</button></form>
        <div class="mp-portals">${W.fases.map(f => `<a href="#/categoria/${f.id}" style="border-top-color:${f.color}"><b>${esc(f.nombre)}</b><small>${S.pages.filter(p => p.fase === f.id).length} páginas</small></a>`).join('')}<a href="#/glosario" style="border-top-color:#6b7280"><b>Glosario</b><small>${S.gloss.length} términos</small></a><a href="#/fallas" style="border-top-color:#b3382c"><b>Fallas</b><small>${S.fallas.length} casos</small></a><a href="#/indicadores" style="border-top-color:#2f6f90"><b>Indicadores</b><small>calculadora</small></a></div>
        <div class="mp-grid"><div class="mp-col">
          ${box('c-blue', 'Página destacada', `<h3><a href="#/p/${feat.id}">${esc(feat.t)}</a></h3><p>${BW.inline(feat.resumen)}</p><p>${esc((feat.texto.match(/== Objetivo ==\n([^\n]+)/) || [])[1] || '')}</p><p><a href="#/p/${feat.id}">Leer la página completa →</a></p>`)}
          ${box('c-amber', 'El recorrido de un material', flow)}
          ${box('c-green', 'Cobertura del programa de asignatura', `<p>El wiki se alinea con las 4 unidades de <i>${esc(W.programaMeta.asignatura)}</i>. <b>${covered} de ${totalItems}</b> contenidos están cubiertos.</p>${cov.map(u => { const c = u.items.filter(i => i.est === 'cubierto').length, pa = u.items.filter(i => i.est === 'parcial').length; return `<div class="covrow"><span>U${u.u} · ${esc(u.nombre)}</span><span class="covbar"><i class="ok" style="width:${c / u.items.length * 100}%"></i><i class="part" style="width:${pa / u.items.length * 100}%"></i></span></div>`; }).join('')}<p><a href="#/programa">Ver el detalle de la cobertura →</a></p>`)}
        </div><div class="mp-col">
          ${box('c-gold', '¿Sabías que…?', `<ul>${sab.map(s => `<li>${BW.inline(s)}</li>`).join('')}</ul>`)}
          ${box('c-red', 'Fallas frecuentes', `<ul>${S.fallas.slice(0, 7).map(f => `<li><a href="#/fallas/${f.id}">${esc(f.t)}</a></li>`).join('')}</ul><p><a href="#/fallas">Ver las ${S.fallas.length} fallas →</a></p>`)}
          ${box('c-gray', 'Cambios recientes', rec.length ? `<ul>${rec.map(h => `<li><a href="${BW.hrefOf(h.type, h.key)}">${esc(BW.titleOf(h.type, h.key, h))}</a> <small>por ${esc(h.user)} · ${BW.fmt(h.ts)}</small></li>`).join('')}</ul><p><a href="#/cambios">Todos los cambios →</a></p>` : '<p>Aún no hay ediciones. ¡Sé el primero en editar una página!</p>')}
          ${box('c-help', 'Se necesita ayuda', `<p>Páginas incompletas y temas del programa que aún no tienen artículo:</p><ul>${pend.map(p => `<li><a class="new" href="#/p/${p.id}">${esc(p.t)}</a> <small>(incompleta)</small></li>`).join('')}${pendProg.map(i => `<li><a class="new" href="#/nueva/${encodeURIComponent(i.t)}?cubre=${i.id}">${esc(i.t)}</a></li>`).join('')}</ul><p><a href="#/programa">Ver todos los pendientes →</a></p>`)}
        </div></div>
        ${box('c-contrib', 'Cómo contribuir', `<p>BodegaWiki se construye entre todos. Puedes <a href="#/nueva">crear una página</a>, <a href="#/nueva-falla">agregar una falla</a>, <a href="#/nuevo-termino">sumar un término al glosario</a> o corregir cualquier artículo con el botón <b>Editar</b>. Cada cambio queda en el historial y se puede restaurar. Mira <a href="#/contribuir">cómo compartir tus cambios</a>.</p>`)}
      </div>`,
      after: c => $('#mpsearch', c).addEventListener('submit', ev => { ev.preventDefault(); const q = $('#mpq', c).value.trim(); if (q) location.hash = '#/buscar/' + encodeURIComponent(q); })
    });
  };

  /* ---------- Programa de asignatura ---------- */
  V.programa = function () {
    const cov = BW.coverage();
    const lbl = { cubierto: 'Cubierto', parcial: 'Parcial', pendiente: 'Pendiente' };
    show({
      tabs: [{ t: 'Programa de asignatura', href: '#/programa', sel: true }, { t: 'Crear página', href: '#/nueva', r: true }], title: 'Programa de asignatura', autolink: false,
      html: `${head('Cobertura del programa de asignatura')}<div class="mw-body"><p>Programa de <b>${esc(W.programaMeta.asignatura)}</b> (${W.programaMeta.codigo}, ${esc(W.programaMeta.carrera)}, ${W.programaMeta.horas} horas). Cada contenido declarado se compara con las páginas del wiki.</p>
        <p>Los temas <span class="chip pendiente">pendientes</span> se muestran como enlaces rojos: al crear una página desde ahí, el contenido pasa solo a «cubierto».</p>
        ${cov.map(u => `<h2>Unidad ${u.u}: ${esc(u.nombre)} <small>(${u.horas} h)</small></h2><div class="tablewrap"><table class="wikitable"><tr><th>Contenido</th><th>Estado</th><th>Páginas del wiki</th></tr>${u.items.map(i => `<tr><td>${esc(i.t)}${i.nota ? `<br><small>${esc(i.nota)}</small>` : ''}</td><td><span class="chip ${i.est}">${lbl[i.est]}</span></td><td>${i.pags.map(id => `<a href="#/p/${id}">${esc(BW.page(id).t)}</a>`).join(', ') || (i.est === 'pendiente' ? `<a class="new" href="#/nueva/${encodeURIComponent(i.t)}?cubre=${i.id}">crear página</a>` : '—')}${i.est === 'parcial' ? ` · <a class="new" href="#/nueva/${encodeURIComponent(i.t)}?cubre=${i.id}">ampliar</a>` : ''}</td></tr>`).join('')}</table></div>`).join('')}</div>`
    });
  };

  /* ---------- Fallas ---------- */
  V.fallas = function (focus) {
    const cats = Object.entries(W.catFallas);
    show({
      tabs: [{ t: 'Catálogo de fallas', href: '#/fallas', sel: true }, { t: 'Agregar falla', href: '#/nueva-falla', r: true }], title: 'Catálogo de fallas', autolink: false, keepScroll: !!focus,
      html: `${head('Catálogo de fallas: ¿qué hago si…?')}<div class="mw-body"><p>${BW.S.fallas.length} situaciones frecuentes consolidadas desde las secciones del manual. Abre un caso para ver los pasos en orden.</p>
        <div class="filters" id="chips"><button class="chip on" data-c="">Todas</button>${cats.map(([k, v]) => `<button class="chip" data-c="${k}">${v}</button>`).join('')}</div>
        <input class="field" id="ff" placeholder="Filtrar por palabra (etiqueta, serie, duplicado…)"><div id="flist"></div></div>`,
      after: c => {
        let cat = '', txt = '', fc = focus;
        const draw = () => {
          const list = BW.S.fallas.filter(f => (!cat || f.cat === cat) && (!txt || norm([f.t, f.sit, (f.acc || []).join(' ')].join(' ')).includes(norm(txt))));
          $('#flist', c).innerHTML = list.length ? list.map(f => `<details class="falla" id="f-${f.id}" ${fc === f.id ? 'open' : ''}><summary><b>${esc(f.t)}</b><span class="cat">${esc(W.catFallas[f.cat] || f.cat)}</span></summary><div class="body">
            <p>${esc(f.sit)} ${editLinks('falla', f.id)}</p>${f.no ? `<div class="no">⛔ ${esc(f.no)}</div>` : ''}
            <ol class="plain">${(f.acc || []).map(a => `<li>${esc(a)}</li>`).join('')}</ol>
            <div class="meta"><span><b>Responsable:</b> ${esc(f.resp || '—')}</span><span><b>Registro:</b> ${esc(f.reg || '—')}</span><span><b>Etapas:</b> ${(f.etapas || []).map(id => BW.page(id)).filter(Boolean).map(p => `<a href="#/p/${p.id}">${esc(p.t)}</a>`).join(' · ') || '—'}</span></div></div></details>`).join('') : '<p>No hay casos con ese filtro.</p>';
          if (fc) { const t = $('#f-' + fc, c); if (t) t.scrollIntoView({ block: 'center' }); fc = null; }
        };
        $('#chips', c).addEventListener('click', ev => { const b = ev.target.closest('.chip'); if (!b) return; cat = b.dataset.c; c.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); draw(); });
        $('#ff', c).addEventListener('input', ev => { txt = ev.target.value; draw(); });
        draw();
      }
    });
  };

  /* ---------- Glosario ---------- */
  V.glosario = function (focus) {
    const g = BW.S.gloss.slice().sort((a, b) => a.t.localeCompare(b.t, 'es'));
    const letters = [...new Set(g.map(x => norm(x.t)[0].toUpperCase()))];
    show({
      tabs: [{ t: 'Glosario', href: '#/glosario', sel: true }, { t: 'Agregar término', href: '#/nuevo-termino', r: true }], title: 'Glosario', autolink: false, keepScroll: !!focus,
      html: `${head('Glosario')}<div class="mw-body"><p>${g.length} términos de bodega e inventario. En los artículos, la primera vez que aparece uno de estos términos queda subrayado con puntos: pasa el cursor para ver su definición. <a href="#/nuevo-termino">Agregar un término</a>.</p>
        <input class="field" id="gf" placeholder="Filtrar términos…"><div class="azbar" id="az">${letters.map(l => `<a href="#/glosario" data-l="${l}">${l}</a>`).join('')}</div><div id="gl"></div></div>`,
      after: c => {
        const draw = t => {
          const list = g.filter(x => !t || norm(x.t + ' ' + x.d).includes(norm(t)));
          let cur = '', h = '';
          list.forEach(x => { const l = norm(x.t)[0].toUpperCase(); if (l !== cur) { if (cur) h += '</dl>'; cur = l; h += `<h2 id="L-${l}">${l}</h2><dl>`; } h += `<dt id="g-${x.id}"><b>${esc(x.t)}</b> ${editLinks('gloss', x.id)}</dt><dd>${esc(x.d)}</dd>`; });
          $('#gl', c).innerHTML = (h ? h + '</dl>' : '<p>Sin resultados. <a class="new" href="#/nuevo-termino">¿Agregar este término?</a></p>');
        };
        $('#gf', c).addEventListener('input', e => draw(e.target.value));
        $('#az', c).addEventListener('click', e => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); const t = document.getElementById('L-' + a.dataset.l); if (t) t.scrollIntoView({ behavior: 'smooth' }); });
        draw('');
        if (focus) { const t = document.getElementById('g-' + focus); if (t) { t.scrollIntoView({ block: 'center' }); t.classList.add('flash'); } }
      }
    });
  };

  /* ---------- Indicadores ---------- */
  V.indicadores = function (focus) {
    show({
      tabs: [{ t: 'Indicadores', href: '#/indicadores', sel: true }, { t: 'Agregar indicador', href: '#/nuevo-indicador', r: true }], title: 'Indicadores', autolink: false, keepScroll: !!focus,
      html: `${head('Indicadores de control')}<div class="mw-body"><p>Permiten detectar problemas y tomar acciones de mejora. Ingresa los datos del período y se calcula (numerador ÷ denominador) × 100. El manual no define metas; interpretar el resultado queda a criterio de la bodega.</p>
        ${BW.S.ind.map(i => { const p = BW.page(i.etapa); return `<div class="ind" id="i-${i.id}"><h3>${esc(i.n)} ${editLinks('ind', i.id)}</h3><div class="muted">${esc(i.uso || '')}${p ? ` · Etapa: <a href="#/p/${p.id}">${esc(p.t)}</a>` : ''}</div>
          <div class="formula">${esc(i.num)} ÷ ${esc(i.den)} × 100</div><div class="calc"><div><label>${esc(i.num)}</label><input class="field" type="number" min="0" data-n placeholder="0"></div><div><label>${esc(i.den)}</label><input class="field" type="number" min="0" data-d placeholder="0"></div></div>
          <div class="calcout"><span class="bigval" data-out>—</span><div class="bar"><i data-bar style="width:0"></i></div></div></div>`; }).join('')}</div>`,
      after: c => {
        c.querySelectorAll('.ind').forEach(box => {
          const n = $('[data-n]', box), d = $('[data-d]', box), out = $('[data-out]', box), bar = $('[data-bar]', box);
          const up = () => { const dv = +d.value; if (!dv || dv < 0 || n.value === '') { out.textContent = '—'; bar.style.width = 0; return; } const p = +n.value / dv * 100; out.textContent = p.toFixed(1) + '%'; bar.style.width = Math.min(100, p) + '%'; };
          n.addEventListener('input', up); d.addEventListener('input', up);
        });
        if (focus) { const t = $('#i-' + focus, c); if (t) { t.scrollIntoView({ block: 'center' }); t.classList.add('flash'); } }
      }
    });
  };

  /* ---------- Documentos ---------- */
  const DOCFUN = { 'Orden de compra': 'Identifica lo que fue solicitado', 'Guía de despacho': 'Permite comprobar lo enviado por el proveedor', 'Factura': 'Respalda la adquisición', 'Registro de recepción': 'Deja evidencia del ingreso', 'Ficha técnica': 'Verifica las características del producto', 'Catálogo del fabricante': 'Confirma la información técnica', 'HDS/SDS': 'Identifica y controla sustancias químicas', 'Registro de inventario': 'Controla las existencias', 'Solicitud de creación de código': 'Incorpora productos nuevos', 'Registro de incidencia': 'Deja evidencia de problemas detectados', 'Orden de almacenamiento': 'Indica código y coordenada exacta donde guardar', 'Matriz de clasificación': 'Registra tipo funcional y uso del material', 'Acta o registro de discrepancia': 'Formaliza una diferencia detectada', 'Orden interna': 'Solicitud interna que se reúne con la OC', 'Check list de equipos': 'Comprueba que los equipos de descarga estén aptos' };
  V.documentos = function () {
    const map = {};
    BW.S.pages.forEach(p => (p.docs || []).forEach(d => { const k = d.replace(/ \(si aplica\)/, ''); (map[k] = map[k] || []).push(p); }));
    const keys = Object.keys(map).sort((a, b) => a.localeCompare(b, 'es'));
    show({
      tabs: [{ t: 'Documentos', href: '#/documentos', sel: true }], title: 'Documentos',
      html: `${head('Documentos')}<div class="mw-body"><p>Los documentos que aparecen en las páginas y dónde se usan. Para agregar uno, edita la página correspondiente (campo «Documentos»).</p>
        <div class="tablewrap"><table class="wikitable"><tr><th>Documento</th><th>Función</th><th>Se usa en</th></tr>${keys.map(k => `<tr><td><b>${esc(k)}</b></td><td>${esc(DOCFUN[k] || '—')}</td><td>${map[k].map(p => `<a href="#/p/${p.id}">${p.n ? p.n + '. ' : ''}${esc(p.t)}</a>`).join(', ')}</td></tr>`).join('')}</table></div></div>`
    });
  };

  /* ---------- Roles ---------- */
  V.roles = function (focus) {
    show({
      tabs: [{ t: 'Roles', href: '#/roles', sel: true }, { t: 'Agregar rol', href: '#/nuevo-rol', r: true }], title: 'Roles y responsables', keepScroll: !!focus,
      html: `${head('Roles y responsables')}<div class="mw-body"><div class="ambox note"><b>Observación.</b> El manual usa «Jefe de bodega», «Supervisor de bodega» y «Encargado de bodega» de forma intercambiable; aquí se agrupan como un rol.</div>
        <div class="tablewrap"><table class="wikitable"><tr><th>Rol</th><th>Responsabilidades</th><th>Participa en</th></tr>${BW.S.roles.map(r => `<tr id="r-${r.id}"><td><b>${esc(r.n)}</b> ${editLinks('role', r.id)}</td><td>${esc(r.d)}</td><td>${BW.S.pages.filter(p => (p.roles || []).includes(r.id)).map(p => `<a href="#/p/${p.id}">${p.n || esc(p.t)}</a>`).join(', ') || '—'}</td></tr>`).join('')}</table></div></div>`,
      after: c => { if (focus) { const t = $('#r-' + focus, c); if (t) { t.scrollIntoView({ block: 'center' }); t.classList.add('flash'); } } }
    });
  };

  /* ---------- Incidencias ---------- */
  V.incidencias = function () {
    const rows = BW.incs().map(r => ({ ...r, own: true })).concat(W.incidenciasEjemplo.map(r => ({ ...r, own: false })));
    const states = ['Pendiente', 'En revisión', 'Cerrado'];
    show({
      tabs: [{ t: 'Registro de incidencias', href: '#/incidencias', sel: true }], title: 'Registro de incidencias', autolink: false,
      html: `${head('Registro de incidencias')}<div class="mw-body"><p>Toda falla debe quedar registrada. Las tres últimas filas son el ejemplo del manual; lo que agregues se guarda en tu navegador y se incluye al exportar.</p>
        <h2>Nuevo registro</h2><form id="incf" class="calc"><div><label>Fecha</label><input class="field" name="fecha" required></div><div><label>Material</label><input class="field" name="material" required placeholder="Ej.: Manguera hidráulica"></div>
        <div><label>Problema</label><select class="field" name="problema">${BW.S.fallas.map(f => `<option>${esc(f.t)}</option>`).join('')}</select></div><div><label>Acción realizada</label><input class="field" name="accion" required></div>
        <div><label>Responsable</label><select class="field" name="resp">${BW.S.roles.map(r => `<option>${esc(r.n)}</option>`).join('')}</select></div><div><label>Estado</label><select class="field" name="estado">${states.map(s => `<option>${s}</option>`).join('')}</select></div>
        <div style="grid-column:1/-1"><button class="btn" type="submit">Agregar al registro</button></div></form>
        <h2>Registro</h2><div class="tablewrap"><table class="wikitable"><tr><th>Fecha</th><th>Material</th><th>Problema</th><th>Acción realizada</th><th>Responsable</th><th>Estado</th><th></th></tr>${rows.map(r => `<tr><td>${esc(r.fecha)}</td><td>${esc(r.material)}</td><td>${esc(r.problema)}</td><td>${esc(r.accion)}</td><td>${esc(r.resp)}</td><td>${r.own ? `<select class="field mini" data-st="${r.id}">${states.map(s => `<option ${s === r.estado ? 'selected' : ''}>${s}</option>`).join('')}</select>` : `<span class="chip st-${esc(r.estado.split(' ')[0])}">${esc(r.estado)}</span>`}</td><td>${r.own ? `<a href="#" data-del="${r.id}">eliminar</a>` : '<small>ejemplo</small>'}</td></tr>`).join('')}</table></div></div>`,
      after: c => {
        const f = $('#incf', c); f.fecha.value = new Date().toLocaleDateString('es-CL');
        f.addEventListener('submit', ev => { ev.preventDefault(); BW.addInc(Object.fromEntries(new FormData(f))); V.incidencias(); });
        c.querySelectorAll('[data-st]').forEach(s => s.addEventListener('change', () => BW.setInc(s.dataset.st, { estado: s.value })));
        c.querySelectorAll('[data-del]').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); if (confirm('¿Eliminar este registro?')) { BW.delInc(a.dataset.del); V.incidencias(); } }));
      }
    });
  };

  /* ---------- Listados especiales ---------- */
  V.cambios = function () {
    const hs = BW.allHist();
    show({
      tabs: [{ t: 'Cambios recientes', href: '#/cambios', sel: true }], title: 'Cambios recientes', autolink: false,
      html: `${head('Cambios recientes')}<div class="mw-body">${hs.length ? `<ul class="histlist">${hs.slice(0, 100).map(h => { const d = BW.size(h); return `<li><span class="hd">${BW.fmt(h.ts)}</span> <span class="chip pendiente">${BW.TYPE_LABEL[h.type]}</span> <a href="${BW.hrefOf(h.type, h.key)}">${esc(BW.titleOf(h.type, h.key, h))}</a> <span class="delta ${d < 0 ? 'neg' : 'pos'}">${d >= 0 ? '+' : ''}${d}</span> · ${esc(h.user)} · <i>${esc(h.summary || 'sin resumen')}</i> (<a href="#/historial/${h.type}/${h.key}">hist</a>)</li>`; }).join('')}</ul>` : '<p>Todavía no hay cambios. Todo el contenido es el original del manual.</p>'}</div>`
    });
  };

  V.paginas = function () {
    show({
      tabs: [{ t: 'Todas las páginas', href: '#/paginas', sel: true }, { t: 'Crear página', href: '#/nueva', r: true }], title: 'Todas las páginas', autolink: false,
      html: `${head('Todas las páginas')}<div class="mw-body"><div class="tablewrap"><table class="wikitable"><tr><th>N.º</th><th>Página</th><th>Fase</th><th>Estado</th><th>Última edición</th></tr>${sortPages(BW.S.pages).map(p => { const l = BW.lastEdit('page', p.id), f = p.fase ? BW.fase(p.fase) : null; return `<tr><td>${p.n || ''}</td><td><a href="#/p/${p.id}">${esc(p.t)}</a></td><td>${f ? esc(f.nombre) : '—'}</td><td>${p.stub ? '<span class="chip pendiente">Incompleta</span>' : '<span class="chip cubierto">Completa</span>'}</td><td>${l ? BW.fmt(l.ts) + ' · ' + esc(l.user) : 'original'}</td></tr>`; }).join('')}</table></div></div>`
    });
  };

  V.categoria = function (id) {
    const c = categories()[id];
    if (!c) return V.missing('Categoría:' + id);
    show({
      tabs: [{ t: 'Categoría', href: '#/categoria/' + id, sel: true }], title: 'Categoría: ' + c.name,
      html: `${head('Categoría: ' + esc(c.name))}<div class="mw-body">${(BW.fase(id) || {}).desc ? `<p>${esc(BW.fase(id).desc)}</p>` : ''}<p>${c.pages.length} página(s):</p><ul>${sortPages(c.pages).map(p => `<li><a href="#/p/${p.id}">${p.n ? p.n + '. ' : ''}${esc(p.t)}</a> — ${esc(p.resumen)}</li>`).join('')}</ul></div>`
    });
  };

  V.buscar = function (q) {
    const hits = BW.search(q);
    show({
      tabs: [{ t: 'Resultados de búsqueda', href: '#/buscar/' + encodeURIComponent(q), sel: true }], title: 'Buscar: ' + q, autolink: false,
      html: `${head('Resultados de búsqueda')}<div class="mw-body"><p>${hits.length} resultado(s) para «<b>${esc(q)}</b>».</p>${hits.length ? hits.slice(0, 60).map(h => `<div class="sr"><a href="${h.href}"><b>${esc(h.t)}</b></a> <span class="chip pendiente">${esc(h.tag)}</span><div class="muted">${esc(h.s.length > 180 ? h.s.slice(0, 180) + '…' : h.s)}</div></div>`).join('') : `<p>No hay coincidencias. <a class="new" href="#/nueva/${encodeURIComponent(q)}">Crear la página «${esc(q)}»</a>.</p>`}</div>`
    });
  };

  /* ---------- Importar / exportar ---------- */
  function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.append(a); a.click(); a.remove(); }
  V.contribuir = function () {
    show({
      tabs: [{ t: 'Importar y exportar', href: '#/contribuir', sel: true }], title: 'Importar y exportar', autolink: false,
      html: `${head('Importar y exportar cambios')}<div class="mw-body">
        <div class="ambox note"><b>Cómo se guardan las ediciones.</b> Lo que editas se guarda en <b>tu navegador</b> (${BW.localCount()} elemento(s) modificados). Para compartirlo con el curso: exporta tu archivo y entrégalo; quien coordina los junta aquí y publica uno solo.</div>
        <h2>Tu nombre</h2><p>Se firma en el historial de cada cambio.</p><form id="uf" class="form inline"><input class="field" name="u" value="${esc(BW.user())}" placeholder="Nombre y apellido"><button class="btn small" type="submit">Guardar nombre</button></form>
        <h2>1. Exportar mis cambios</h2><p>Descarga un archivo con tus ediciones, comentarios e incidencias.</p><button class="btn" id="ex1">Descargar mis cambios (.json)</button>
        <h2>2. Importar cambios de otra persona</h2><p>Se combinan con los tuyos; si ambos editaron lo mismo, prevalece el archivo importado.</p><input type="file" id="imp" accept=".json,application/json">
        <h2>3. Publicar para todos</h2><p>Genera <code>contribuciones.js</code> con todo lo combinado. Reemplaza ese archivo en la carpeta del sitio y vuelve a publicarlo: todos verán esos cambios como base.</p><button class="btn" id="ex2">Preparar para publicar (contribuciones.js)</button>
        <h2>Restablecer</h2><p>Borra solo las ediciones de este navegador (no toca el contenido original ni el publicado).</p><button class="btn danger" id="rst">Descartar mis cambios locales</button><div id="msg" class="muted" style="margin-top:12px"></div></div>`,
      after: c => {
        const msg = t => ($('#msg', c).textContent = t);
        $('#uf', c).addEventListener('submit', ev => { ev.preventDefault(); BW.setUser(ev.target.u.value.trim()); msg('Nombre guardado.'); });
        $('#ex1', c).addEventListener('click', () => download('bodegawiki-mis-cambios.json', JSON.stringify(BW.exportData(false), null, 1), 'application/json'));
        $('#ex2', c).addEventListener('click', () => download('contribuciones.js', '/* Generado por BodegaWiki el ' + new Date().toLocaleString('es-CL') + ' */\nwindow.WIKI_CONTRIB = ' + JSON.stringify(BW.exportData(true)) + ';\n', 'text/javascript'));
        $('#imp', c).addEventListener('change', ev => { const f = ev.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const n = BW.importData(JSON.parse(r.result)); msg('Importados ' + n + ' elementos.'); V.contribuir(); } catch (e) { msg('No se pudo importar: ' + e.message); } }; r.readAsText(f); });
        $('#rst', c).addEventListener('click', () => { if (confirm('¿Descartar todas las ediciones locales? Esto no se puede deshacer (a menos que las hayas exportado).')) { BW.resetLocal(); V.contribuir(); } });
      }
    });
  };

  /* ---------- Acerca ---------- */
  V.acerca = function () {
    const stubs = BW.S.pages.filter(p => p.stub);
    show({
      tabs: [{ t: 'Acerca de BodegaWiki', href: '#/acerca', sel: true }], title: 'Acerca de',
      html: `${head('Acerca de BodegaWiki')}<div class="mw-body"><p><b>BodegaWiki</b> es un prototipo académico para la carrera de ${esc(W.programaMeta.carrera)}: convierte el «Manual de administración de bodega e inventario 2026» en una consulta rápida y editable.</p>
        <h2>Origen del contenido</h2><p>Manual elaborado por estudiantes de la asignatura ${esc(W.programaMeta.asignatura)}, bajo la guía de su docente. Se reordenó en una plantilla común y se corrigieron errores evidentes (anotados en cada página).</p>
        <h2>Brechas del manual respecto del programa</h2><p>El programa de la asignatura tiene 4 unidades. El manual cubre bien la <b>Unidad 1</b> (recepción y clasificación) y parte de la 2 y la 4. Faltan, entre otras, estiba, rotación, seguridad en bodegas, tipos y conteos de inventario, stock mínimo, WMS, picking y entrega a áreas usuarias. Ver <a href="#/programa">la cobertura completa</a>.</p>
        <h2>Observaciones sobre el manual</h2><ul><li>«Reconocer la familia» está vacío (copia de otra sección).</li><li>«Consultar atributos de control» repite casi por completo «Identificar».</li><li>«Explosivos» aparece en el alcance sin tratamiento especial.</li></ul>
        <h2>Páginas incompletas</h2><p>${stubs.map(p => `<a href="#/p/${p.id}" class="new">${esc(p.t)}</a>`).join(', ') || 'Ninguna.'}</p></div>`
    });
  };
})();
