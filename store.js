/* Datos efectivos del wiki = contenido base (data.js) + contribuciones publicadas (contribuciones.js)
   + ediciones locales del navegador (localStorage). Cada guardado queda en el historial. */
(function () {
  const W = window.WIKI;
  const BW = (window.BW = {});

  BW.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  BW.norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  BW.slug = s => BW.norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';
  BW.clone = o => (o == null ? o : JSON.parse(JSON.stringify(o)));
  BW.fmt = ts => { const d = new Date(ts); return d.toLocaleDateString('es-CL') + ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }); };

  const LS = (BW.LS = {
    get(k, d) { try { const v = localStorage.getItem('bw2:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('bw2:' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem('bw2:' + k); } catch (e) {} }
  });

  const COLS = (BW.COLS = { page: 'pages', falla: 'fallas', gloss: 'gloss', ind: 'ind', role: 'roles' });
  BW.TYPE_LABEL = { page: 'Página', falla: 'Falla', gloss: 'Término', ind: 'Indicador', role: 'Rol' };

  let base, contrib, local;
  const S = (BW.S = {});

  const emptyEdits = () => ({ pages: {}, fallas: {}, gloss: {}, ind: {}, roles: {} });

  function buildBase() {
    base = {
      pages: W.etapas.map(e => ({
        id: e.id, n: e.n, fase: e.fase, t: e.t, resumen: e.resumen || '', aviso: e.nota || '', stub: !!e.stub,
        roles: (e.roles || []).slice(), docs: (e.docs || []).slice(), recursos: (e.recursos || []).slice(),
        texto: BW.blocksToWiki(e), fallas: (e.fallas || []).slice(), indicadores: (e.indicadores || []).slice(), cats: [], cubre: []
      })),
      fallas: W.fallas.map(f => BW.clone(f)),
      gloss: W.glosario.map(([t, d]) => ({ id: BW.slug(t), t, d })),
      ind: W.indicadores.map(i => BW.clone(i)),
      roles: Object.entries(W.roles).map(([id, r]) => ({ id, n: r.n, d: r.d }))
    };
  }

  function loadLocal() {
    const c = window.WIKI_CONTRIB || {};
    contrib = { edits: Object.assign(emptyEdits(), c.edits || {}), hist: c.hist || [], talk: c.talk || {} };
    const l = LS.get('state', null) || {};
    local = { edits: Object.assign(emptyEdits(), l.edits || {}), hist: l.hist || [], talk: l.talk || {}, inc: l.inc || [] };
  }
  function persist() { LS.set('state', local); }

  function applyEdits(list, edits) {
    const kept = list.filter(x => !(x.id in edits) || edits[x.id] !== null).map(x => (x.id in edits ? edits[x.id] : x));
    const extra = Object.entries(edits).filter(([id, v]) => v && !list.some(x => x.id === id)).map(([, v]) => v).sort((a, b) => (a._ts || 0) - (b._ts || 0));
    return kept.concat(extra);
  }
  function mergedEdits() {
    const out = {};
    Object.values(COLS).forEach(c => { out[c] = Object.assign({}, contrib.edits[c], local.edits[c]); });
    return out;
  }

  function rebuild() {
    const ME = mergedEdits();
    S.pages = applyEdits(base.pages, ME.pages);
    S.fallas = applyEdits(base.fallas, ME.fallas);
    S.gloss = applyEdits(base.gloss, ME.gloss);
    S.ind = applyEdits(base.ind, ME.ind);
    S.roles = applyEdits(base.roles, ME.roles);
    const byId = l => Object.fromEntries(l.map(x => [x.id, x]));
    S.byId = { page: byId(S.pages), falla: byId(S.fallas), gloss: byId(S.gloss), ind: byId(S.ind), role: byId(S.roles) };
    const byName = (l, f) => { const m = {}; l.forEach(x => { m[BW.norm(f(x)).trim()] = x; }); return m; };
    S.byName = {
      page: Object.assign(byName(S.pages, x => x.id), byName(S.pages, x => x.t)),
      falla: byName(S.fallas, x => x.t),
      gloss: Object.assign(byName(S.gloss, x => x.t), byName(S.gloss, x => x.t.replace(/\s*\(.*?\)\s*/g, ' ').trim())),
      ind: byName(S.ind, x => x.n),
      role: byName(S.roles, x => x.n)
    };
    BW._index = null;
  }

  BW.init = function () { buildBase(); loadLocal(); rebuild(); };
  BW.get = (type, id) => S.byId[type][id] || null;
  BW.page = id => S.byId.page[id] || null;
  BW.fase = id => W.fases.find(f => f.id === id) || null;
  BW.uniqueId = (type, title) => { let id = BW.slug(title), n = 2; const taken = k => S.byId[type][k] || (type === 'page' && ['nueva', 'editar'].includes(k)); while (taken(id)) id = BW.slug(title) + '-' + n++; return id; };

  /* Resolver [[enlaces]] de wikitexto */
  BW.resolve = function (target) {
    const k = BW.norm(target).trim();
    if (S.byName.page[k]) return '#/p/' + S.byName.page[k].id;
    if (S.byName.falla[k]) return '#/fallas/' + S.byName.falla[k].id;
    if (S.byName.gloss[k]) return '#/glosario/' + S.byName.gloss[k].id;
    if (S.byName.ind[k]) return '#/indicadores/' + S.byName.ind[k].id;
    if (S.byName.role[k]) return '#/roles/' + S.byName.role[k].id;
    return null;
  };

  /* Usuario */
  BW.user = () => LS.get('user', '');
  BW.setUser = n => LS.set('user', n);

  /* Guardar con historial */
  BW.save = function (type, id, obj, summary) {
    const col = COLS[type];
    const prev = BW.clone(S.byId[type][id] || null);
    const next = obj === null ? null : Object.assign({}, BW.clone(obj), { id });
    if (next && !prev && !next._ts) next._ts = Date.now();
    local.edits[col][id] = next;
    local.hist.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now(), type, key: id, user: BW.user() || 'Anónimo', summary: summary || '', prev, next: BW.clone(next) });
    persist(); rebuild();
  };
  BW.revert = function (recId) {
    const r = BW.allHist().find(h => h.id === recId); if (!r) return false;
    BW.save(r.type, r.key, r.next, 'Restaurada la versión del ' + BW.fmt(r.ts));
    return true;
  };
  BW.allHist = () => contrib.hist.concat(local.hist).sort((a, b) => b.ts - a.ts);
  BW.history = (type, key) => BW.allHist().filter(h => h.type === type && h.key === key);
  BW.lastEdit = (type, key) => BW.history(type, key)[0] || null;
  BW.size = h => { const L = o => (o ? (o.texto || '').length || JSON.stringify(o).length : 0); return L(h.next) - L(h.prev); };
  BW.titleOf = (type, key, rec) => { const o = BW.get(type, key) || (rec && (rec.next || rec.prev)); return o ? (o.t || o.n || key) : key; };
  BW.hrefOf = (type, key) => ({ page: '#/p/', falla: '#/fallas/', gloss: '#/glosario/', ind: '#/indicadores/', role: '#/roles/' }[type]) + key;

  /* Discusión */
  BW.talk = id => (contrib.talk[id] || []).concat(local.talk[id] || []).sort((a, b) => a.ts - b.ts);
  BW.addTalk = (id, text) => { (local.talk[id] = local.talk[id] || []).push({ ts: Date.now(), user: BW.user() || 'Anónimo', text }); persist(); };

  /* Incidencias */
  BW.incs = () => local.inc;
  BW.addInc = v => { local.inc.unshift(Object.assign({ id: Date.now().toString(36) }, v)); persist(); };
  BW.setInc = (id, patch) => { const x = local.inc.find(i => i.id === id); if (x) Object.assign(x, patch); persist(); };
  BW.delInc = id => { local.inc = local.inc.filter(i => i.id !== id); persist(); };

  /* Cobertura del programa de asignatura */
  BW.coverage = function () {
    return W.programa.map(u => ({
      u: u.u, nombre: u.nombre, horas: u.horas,
      items: u.items.map(it => {
        const user = S.pages.filter(p => (p.cubre || []).includes(it.id));
        const pags = [...new Set([...(it.pags || []).filter(id => BW.page(id)), ...user.map(p => p.id)])];
        let est = it.est;
        if (user.length) est = user.some(p => !p.stub) ? 'cubierto' : (est === 'cubierto' ? 'cubierto' : 'parcial');
        return Object.assign({}, it, { est, pags });
      })
    }));
  };

  /* Exportar / importar */
  BW.exportData = function (forPublish) {
    if (forPublish) {
      const ME = mergedEdits();
      return { app: 'bodegawiki', v: 1, edits: ME, hist: BW.allHist(), talk: mergeTalk() };
    }
    return { app: 'bodegawiki', v: 1, edits: local.edits, hist: local.hist, talk: local.talk, inc: local.inc };
  };
  function mergeTalk() { const o = {}; new Set([...Object.keys(contrib.talk), ...Object.keys(local.talk)]).forEach(k => { o[k] = BW.talk(k); }); return o; }
  BW.importData = function (d) {
    if (!d || d.app !== 'bodegawiki') throw new Error('El archivo no es una exportación de BodegaWiki.');
    let n = 0;
    Object.values(COLS).forEach(c => { Object.entries((d.edits || {})[c] || {}).forEach(([k, v]) => { local.edits[c][k] = v; n++; }); });
    const have = new Set(local.hist.map(h => h.id));
    (d.hist || []).forEach(h => { if (!have.has(h.id)) local.hist.push(h); });
    local.hist.sort((a, b) => b.ts - a.ts);
    Object.entries(d.talk || {}).forEach(([k, arr]) => { const cur = local.talk[k] = local.talk[k] || []; arr.forEach(t => { if (!cur.some(x => x.ts === t.ts && x.text === t.text)) cur.push(t); }); });
    (d.inc || []).forEach(i => { if (!local.inc.some(x => x.id === i.id)) local.inc.push(i); });
    persist(); rebuild();
    return n;
  };
  BW.resetLocal = function () { LS.del('state'); loadLocal(); rebuild(); };
  BW.localCount = () => Object.values(local.edits).reduce((a, o) => a + Object.keys(o).length, 0);

  /* Búsqueda */
  BW.search = function (q) {
    if (!BW._index) {
      const ix = [];
      S.pages.forEach(p => ix.push({ tag: p.n ? 'Etapa ' + p.n : 'Página', t: p.t, s: p.resumen, href: '#/p/' + p.id, txt: BW.norm([p.t, p.resumen, p.texto, (p.docs || []).join(' '), (p.recursos || []).join(' ')].join(' ')) }));
      S.fallas.forEach(f => ix.push({ tag: 'Falla', t: f.t, s: f.sit, href: '#/fallas/' + f.id, txt: BW.norm([f.t, f.sit, (f.acc || []).join(' ')].join(' ')) }));
      S.gloss.forEach(g => ix.push({ tag: 'Glosario', t: g.t, s: g.d, href: '#/glosario/' + g.id, txt: BW.norm(g.t + ' ' + g.d) }));
      S.ind.forEach(i => ix.push({ tag: 'Indicador', t: i.n, s: i.num + ' ÷ ' + i.den, href: '#/indicadores/' + i.id, txt: BW.norm([i.n, i.num, i.den, i.uso].join(' ')) }));
      S.roles.forEach(r => ix.push({ tag: 'Rol', t: r.n, s: r.d, href: '#/roles/' + r.id, txt: BW.norm(r.n + ' ' + r.d) }));
      BW._index = ix;
    }
    const terms = BW.norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return BW._index.map(it => { let sc = 0; for (const t of terms) { if (!it.txt.includes(t)) return null; sc += BW.norm(it.t).includes(t) ? 5 : 1; } return { it, sc }; }).filter(Boolean).sort((a, b) => b.sc - a.sc).map(x => x.it);
  };
})();
