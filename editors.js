/* Editores: página (wikitexto + opciones) y formularios genéricos */
(function () {
  const BW = window.BW, W = window.WIKI, esc = BW.esc, V = BW.V;
  const $ = (s, r = document) => r.querySelector(s);
  const head = (title, sub) => `<h1 class="firstHeading">${title}</h1><div class="siteSub">${sub || 'Los cambios se guardan en este navegador y quedan en el historial'}</div>`;

  const TEMPLATE = `== Objetivo ==
Explica en una o dos frases para qué sirve este tema.

== Procedimiento ==
# Primer paso
# Segundo paso
# Tercer paso

== Responsables ==
* Rol 1: qué hace
* Rol 2: qué hace

== Errores frecuentes ==
Describe qué puede salir mal y enlaza a una falla del catálogo, por ejemplo [[Material dañado]].

== Resultado esperado ==
Qué debe quedar hecho al terminar.
`;

  /* ---------- Editor de páginas ---------- */
  V.editPage = function (id, sec, params) {
    const isNew = id === '__new';
    const orig = isNew ? null : BW.page(id);
    if (!isNew && !orig) return V.missing(id);
    const p = isNew ? { t: (params && params.titulo) || '', fase: '', resumen: '', aviso: '', stub: false, roles: [], docs: [], recursos: [], texto: TEMPLATE, fallas: [], indicadores: [], cats: [], cubre: params && params.cubre ? [params.cubre] : [] } : BW.clone(orig);
    const secN = sec ? +sec : 0;
    const txt = secN ? BW.getSection(p.texto, secN) : p.texto;
    const chk = (name, list, sel, label) => `<div class="chkgrid">${list.map(x => `<label class="chk"><input type="checkbox" name="${name}" value="${esc(x.id)}" ${sel.includes(x.id) ? 'checked' : ''}> ${esc(label(x))}</label>`).join('')}</div>`;
    const progOpts = BW.coverage().map(u => `<div class="chkunit"><b>Unidad ${u.u}</b>${u.items.map(i => `<label class="chk"><input type="checkbox" name="cubre" value="${i.id}" ${(p.cubre || []).includes(i.id) ? 'checked' : ''}> ${esc(i.t)}</label>`).join('')}</div>`).join('');
    const tools = [['B', "'''", "'''", 'negrita'], ['I', "''", "''", 'cursiva'], ['[[ ]]', '[[', ']]', 'enlace a otra página'], ['H2', '\n== ', ' ==\n', 'sección'], ['H3', '\n=== ', ' ===\n', 'subsección'], ['• lista', '\n* ', '', 'viñeta'], ['1. pasos', '\n# ', '', 'paso con casilla'], ['Tabla', '\n{|\n! Columna 1 !! Columna 2\n|-\n| dato 1 || dato 2\n|}\n', '', 'tabla'], ['Aviso', '\n{{aviso|', '}}\n', 'cuadro destacado']];
    BW.show({
      tabs: isNew ? [{ t: 'Crear página', href: '#/nueva', sel: true }] : BW.pageTabs(id, 'edit'), title: isNew ? 'Crear página' : 'Editando ' + orig.t, autolink: false,
      html: `${head(isNew ? 'Crear una página nueva' : (secN ? 'Editando una sección de «' + esc(orig.t) + '»' : 'Editando «' + esc(orig.t) + '»'))}
      <div class="mw-body"><form id="ef">
        ${!secN ? `<label class="lbl">Título de la página<input class="field" name="t" value="${esc(p.t)}" required></label>` : ''}
        <div class="toolbar">${tools.map((t, i) => `<button type="button" class="tb" data-t="${i}" title="${t[3]}">${esc(t[0])}</button>`).join('')}${!secN ? '<button type="button" class="tb" id="tplb" title="Reemplazar por una plantilla de página">Plantilla</button>' : ''}</div>
        <textarea class="field wt" name="texto" rows="${secN ? 12 : 22}" spellcheck="true">${esc(txt)}</textarea>
        <details class="help"><summary>Ayuda de formato</summary><pre>== Sección ==            === Subsección ===
'''negrita'''   ''cursiva''   [[Otra página]]   [[Página|texto]]
* viñeta                  # paso (con casilla)
{|  ! A !! B  |-  | 1 || 2  |}   tabla
{{aviso|texto}}         {{widget|abc}}  (también: etiqueta)
Los [[enlaces]] a páginas que no existen salen en rojo y sirven para crearlas.</pre></details>
        ${!secN ? `<details class="opts" ${isNew ? 'open' : ''}><summary>Opciones de la página (cuadro lateral, categorías y programa)</summary>
          <label class="lbl">Resumen (frase de entrada)<textarea class="field" name="resumen" rows="2">${esc(p.resumen)}</textarea></label>
          <div class="two"><label class="lbl">Fase<select class="field" name="fase"><option value="">— ninguna —</option>${W.fases.map(f => `<option value="${f.id}" ${p.fase === f.id ? 'selected' : ''}>${esc(f.nombre)}</option>`).join('')}</select></label>
          <label class="lbl">Categorías extra (separadas por coma)<input class="field" name="cats" value="${esc((p.cats || []).join(', '))}"></label></div>
          <label class="lbl">Aviso o nota para lectores<textarea class="field" name="aviso" rows="2">${esc(p.aviso)}</textarea></label>
          <label class="chk"><input type="checkbox" name="stub" ${p.stub ? 'checked' : ''}> Marcar como <b>página incompleta</b></label>
          <h4>Responsables</h4>${chk('roles', BW.S.roles, p.roles || [], x => x.n)}
          <div class="two"><label class="lbl">Documentos (uno por línea)<textarea class="field" name="docs" rows="5">${esc((p.docs || []).join('\n'))}</textarea></label>
          <label class="lbl">Recursos (uno por línea)<textarea class="field" name="recursos" rows="5">${esc((p.recursos || []).join('\n'))}</textarea></label></div>
          <h4>Fallas relacionadas</h4>${chk('fallas', BW.S.fallas, p.fallas || [], x => x.t)}
          <h4>Indicadores relacionados</h4>${chk('indicadores', BW.S.ind, p.indicadores || [], x => x.n)}
          <h4>Contenidos del programa que cubre esta página</h4><div class="progbox">${progOpts}</div>
        </details>` : ''}
        <div class="savebar"><label class="lbl">Tu nombre<input class="field" name="user" value="${esc(BW.user())}" placeholder="Nombre y apellido" required></label>
          <label class="lbl grow">Resumen de la edición<input class="field" name="summary" placeholder="Ej.: agregué el paso de segundo conteo"></label></div>
        <div class="btnrow"><button class="btn" type="submit">Guardar cambios</button><button class="btn ghost" type="button" id="pv">Vista previa</button><a class="btn ghost" href="${isNew ? '#/' : '#/p/' + id}">Cancelar</a>${!isNew && !secN ? '<button class="btn danger" type="button" id="del">Eliminar página</button>' : ''}</div>
        <div id="err" class="formerr"></div></form><div id="pvbox"></div></div>`,
      after: c => {
        const f = $('#ef', c), ta = f.texto, err = $('#err', c);
        c.querySelectorAll('.tb[data-t]').forEach(b => b.addEventListener('click', () => {
          const [, a, z] = tools[+b.dataset.t]; const s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || '';
          ta.setRangeText(a + sel + z, s, e, 'end'); ta.focus();
        }));
        const tpl = $('#tplb', c); if (tpl) tpl.addEventListener('click', () => { if (!ta.value.trim() || confirm('Se reemplazará el texto actual por la plantilla. ¿Continuar?')) ta.value = TEMPLATE; });
        $('#pv', c).addEventListener('click', () => { const r = BW.render(ta.value, { pageId: isNew ? null : id }); $('#pvbox', c).innerHTML = '<h2>Vista previa</h2><div class="ambox note">Así se verá el texto. Aún no se ha guardado.</div>' + r.html; BW.autolink($('#pvbox', c)); $('#pvbox', c).scrollIntoView({ behavior: 'smooth' }); });
        const del = $('#del', c); if (del) del.addEventListener('click', () => { if (confirm('¿Eliminar esta página? Podrás restaurarla desde el historial.')) { BW.setUser(f.user.value.trim() || BW.user()); BW.save('page', id, null, f.summary.value || 'Página eliminada'); location.hash = '#/'; BW.route(); } });
        f.addEventListener('submit', ev => {
          ev.preventDefault(); err.textContent = '';
          const g = n => Array.from(f.querySelectorAll(`[name="${n}"]:checked`)).map(x => x.value);
          const lines = n => (f[n] ? f[n].value.split('\n').map(s => s.trim()).filter(Boolean) : []);
          let obj = BW.clone(p), nid = id;
          if (secN) obj.texto = BW.replaceSection(p.texto, secN, ta.value);
          else {
            const title = f.t.value.trim();
            if (!title) { err.textContent = 'Falta el título.'; return; }
            const clash = BW.S.byName.page[BW.norm(title)];
            if (clash && clash.id !== id) { err.textContent = 'Ya existe una página con ese título: ' + clash.t; return; }
            Object.assign(obj, { t: title, texto: ta.value, resumen: f.resumen.value.trim(), fase: f.fase.value, aviso: f.aviso.value.trim(), stub: f.stub.checked, cats: f.cats.value.split(',').map(s => s.trim()).filter(Boolean), roles: g('roles'), docs: lines('docs'), recursos: lines('recursos'), fallas: g('fallas'), indicadores: g('indicadores'), cubre: g('cubre') });
            if (isNew) { nid = BW.uniqueId('page', title); obj.n = undefined; }
          }
          BW.setUser(f.user.value.trim());
          BW.save('page', nid, obj, f.summary.value.trim() || (isNew ? 'Página creada' : secN ? 'Edición de sección' : 'Edición'));
          location.hash = '#/p/' + nid; BW.route();
        });
      }
    });
  };

  /* ---------- Editor genérico (falla, término, indicador, rol) ---------- */
  const pagesOpts = () => BW.S.pages.map(p => ({ v: p.id, l: (p.n ? p.n + '. ' : '') + p.t }));
  const SPECS = {
    falla: { label: 'falla', list: '#/fallas', home: '#/fallas/', title: o => o.t, blank: () => ({ t: '', cat: 'doc', sit: '', no: '', acc: [], resp: '', reg: '', etapas: [] }),
      fields: () => [{ k: 't', l: 'Nombre de la falla', type: 'text', req: 1 }, { k: 'cat', l: 'Tipo', type: 'select', opts: Object.entries(W.catFallas).map(([v, l]) => ({ v, l })) }, { k: 'sit', l: 'Situación (qué pasa)', type: 'area', rows: 3 }, { k: 'no', l: 'Qué NO hacer (opcional)', type: 'text' }, { k: 'acc', l: 'Pasos a seguir (uno por línea, en orden)', type: 'lines', rows: 8 }, { k: 'resp', l: 'Responsable', type: 'text' }, { k: 'reg', l: 'Registro / documento', type: 'text' }, { k: 'etapas', l: 'Etapas donde puede aparecer', type: 'multi', opts: pagesOpts() }] },
    gloss: { label: 'término', list: '#/glosario', home: '#/glosario/', title: o => o.t, blank: () => ({ t: '', d: '' }),
      fields: () => [{ k: 't', l: 'Término', type: 'text', req: 1 }, { k: 'd', l: 'Definición', type: 'area', rows: 4, req: 1 }] },
    ind: { label: 'indicador', list: '#/indicadores', home: '#/indicadores/', title: o => o.n, blank: () => ({ n: '', num: '', den: '', etapa: '', uso: '' }),
      fields: () => [{ k: 'n', l: 'Nombre del indicador', type: 'text', req: 1 }, { k: 'num', l: 'Numerador (qué se cuenta)', type: 'text', req: 1 }, { k: 'den', l: 'Denominador (contra qué se compara)', type: 'text', req: 1 }, { k: 'etapa', l: 'Página relacionada', type: 'select', opts: [{ v: '', l: '— ninguna —' }].concat(pagesOpts()) }, { k: 'uso', l: 'Para qué sirve', type: 'area', rows: 2 }] },
    role: { label: 'rol', list: '#/roles', home: '#/roles/', title: o => o.n, blank: () => ({ n: '', d: '' }),
      fields: () => [{ k: 'n', l: 'Nombre del rol', type: 'text', req: 1 }, { k: 'd', l: 'Responsabilidades', type: 'area', rows: 4, req: 1 }] }
  };
  const ROUTE_TYPE = { 'editar-falla': 'falla', 'nueva-falla': 'falla', 'editar-termino': 'gloss', 'nuevo-termino': 'gloss', 'editar-indicador': 'ind', 'nuevo-indicador': 'ind', 'editar-rol': 'role', 'nuevo-rol': 'role' };
  BW.ROUTE_TYPE = ROUTE_TYPE;

  V.editGeneric = function (type, id) {
    const sp = SPECS[type], isNew = !id;
    const orig = isNew ? null : BW.get(type, id);
    if (!isNew && !orig) return V.missing(id);
    const o = isNew ? sp.blank() : BW.clone(orig);
    const fields = sp.fields();
    const input = fl => {
      const v = o[fl.k]; const nm = `name="${fl.k}"`;
      if (fl.type === 'text') return `<input class="field" ${nm} value="${esc(v || '')}" ${fl.req ? 'required' : ''}>`;
      if (fl.type === 'area') return `<textarea class="field" ${nm} rows="${fl.rows || 3}" ${fl.req ? 'required' : ''}>${esc(v || '')}</textarea>`;
      if (fl.type === 'lines') return `<textarea class="field" ${nm} rows="${fl.rows || 6}">${esc((v || []).join('\n'))}</textarea>`;
      if (fl.type === 'select') return `<select class="field" ${nm}>${fl.opts.map(x => `<option value="${esc(x.v)}" ${x.v === v ? 'selected' : ''}>${esc(x.l)}</option>`).join('')}</select>`;
      if (fl.type === 'multi') return `<div class="chkgrid">${fl.opts.map(x => `<label class="chk"><input type="checkbox" name="${fl.k}" value="${esc(x.v)}" ${(v || []).includes(x.v) ? 'checked' : ''}> ${esc(x.l)}</label>`).join('')}</div>`;
      return '';
    };
    const nice = BW.TYPE_LABEL[type];
    BW.show({
      tabs: [{ t: isNew ? 'Agregar ' + sp.label : nice, href: isNew ? sp.list : sp.home + id, sel: true }, ...(isNew ? [] : [{ t: 'Ver historial', href: '#/historial/' + type + '/' + id, r: true }])], title: (isNew ? 'Agregar ' : 'Editar ') + sp.label, autolink: false,
      html: `${head(isNew ? 'Agregar ' + sp.label : 'Editando ' + sp.label + ': ' + esc(sp.title(orig)))}<div class="mw-body"><form id="gf" class="form">${fields.map(fl => `<label class="lbl">${fl.l}${fl.type === 'multi' ? '' : input(fl)}</label>${fl.type === 'multi' ? input(fl) : ''}`).join('')}
        <div class="savebar"><label class="lbl">Tu nombre<input class="field" name="user" value="${esc(BW.user())}" required></label><label class="lbl grow">Resumen de la edición<input class="field" name="summary"></label></div>
        <div class="btnrow"><button class="btn" type="submit">Guardar</button><a class="btn ghost" href="${isNew ? sp.list : sp.home + id}">Cancelar</a>${!isNew ? '<button class="btn danger" type="button" id="del">Eliminar</button>' : ''}</div><div id="err" class="formerr"></div></form></div>`,
      after: c => {
        const f = $('#gf', c);
        const del = $('#del', c); if (del) del.addEventListener('click', () => { if (confirm('¿Eliminar? Podrás restaurarlo desde el historial.')) { BW.setUser(f.user.value.trim() || BW.user()); BW.save(type, id, null, f.summary.value || 'Eliminado'); location.hash = sp.list; BW.route(); } });
        f.addEventListener('submit', ev => {
          ev.preventDefault();
          const obj = BW.clone(o);
          fields.forEach(fl => {
            if (fl.type === 'lines') obj[fl.k] = f[fl.k].value.split('\n').map(s => s.trim()).filter(Boolean);
            else if (fl.type === 'multi') obj[fl.k] = Array.from(f.querySelectorAll(`[name="${fl.k}"]:checked`)).map(x => x.value);
            else obj[fl.k] = f[fl.k].value.trim();
          });
          const label = obj.t || obj.n;
          let nid = id;
          if (isNew) { nid = BW.uniqueId(type, label); }
          BW.setUser(f.user.value.trim());
          BW.save(type, nid, obj, f.summary.value.trim() || (isNew ? 'Creado' : 'Edición'));
          location.hash = sp.home + nid; BW.route();
        });
      }
    });
  };
})();
