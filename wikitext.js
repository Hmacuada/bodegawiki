/* Mini-wikitexto: == Títulos ==, * viñetas, # pasos, '''negrita''', ''cursiva'', [[enlaces]],
   {| tablas |}, {{aviso|texto}}, {{widget|nombre}} */
(function () {
  const BW = window.BW;
  const esc = BW.esc;
  const unesc = s => s.replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
  BW.hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

  function link(a, b) {
    const target = unesc(a).trim();
    const href = BW.resolve(target);
    const label = b || a;
    if (href) return `<a href="${href}">${label}</a>`;
    return `<a class="new" href="#/nueva/${encodeURIComponent(target)}" title="Esta página aún no existe. Haz clic para crearla">${label}</a>`;
  }
  function inline(s) {
    let t = esc(s);
    t = t.replace(/&lt;br\s*\/?&gt;/g, '<br>');
    t = t.replace(/'''(.+?)'''/g, '<b>$1</b>').replace(/''(.+?)''/g, '<i>$1</i>');
    t = t.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, a, b) => link(a, b));
    return t;
  }
  BW.inline = inline;

  const H2 = /^==(?!=)\s*(.+?)\s*==$/;
  const HN = /^(={2,4})\s*(.+?)\s*\1$/;
  const isBlockStart = t => HN.test(t) || /^[#*]/.test(t) || t.startsWith('{|') || /^\{\{(aviso|widget)\|/.test(t);

  function table(lines, i) {
    const rows = [];
    for (i++; i < lines.length; i++) {
      const l = lines[i].trim();
      if (l.startsWith('|}')) break;
      if (l.startsWith('|-') || !l) continue;
      if (l.startsWith('!')) rows.push({ h: true, cells: l.slice(1).split('!!').map(c => c.trim()) });
      else if (l.startsWith('|')) rows.push({ h: false, cells: l.slice(1).split('||').map(c => c.trim()) });
    }
    let html = '<div class="tablewrap"><table class="wikitable">';
    rows.forEach(r => { html += '<tr>' + r.cells.map(c => `<${r.h ? 'th' : 'td'}>${inline(c)}</${r.h ? 'th' : 'td'}>`).join('') + '</tr>'; });
    return { html: html + '</table></div>', next: i + 1 };
  }

  BW.render = function (text, opts) {
    opts = opts || {};
    const lines = String(text || '').replace(/\r/g, '').split('\n');
    const out = [], toc = [], used = {};
    let i = 0, n2 = 0, n3 = 0, secIdx = 0;
    const done = opts.pageId ? BW.LS.get('chk:' + opts.pageId, []) : [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) { i++; continue; }
      let m;
      if ((m = t.match(HN))) {
        const lvl = m[1].length, txt = m[2];
        let id = BW.slug(txt); used[id] = (used[id] || 0) + 1; if (used[id] > 1) id += '-' + used[id];
        let num = '';
        if (lvl === 2) { n2++; n3 = 0; num = String(n2); secIdx++; } else { n3++; num = n2 + '.' + n3; }
        toc.push({ lvl: lvl === 2 ? 1 : 2, txt, id, num });
        const ed = lvl === 2 && opts.pageId && opts.editable ? `<span class="editsec">[<a href="#/editar/${opts.pageId}/${secIdx}">editar</a>]</span>` : '';
        out.push(`<h${lvl} id="${id}">${esc(txt)}${ed}</h${lvl}>`);
        i++; continue;
      }
      if (t.startsWith('{|')) { const r = table(lines, i); out.push(r.html); i = r.next; continue; }
      if ((m = t.match(/^\{\{aviso\|(.*)\}\}$/))) { out.push(`<div class="callout">${inline(m[1])}</div>`); i++; continue; }
      if ((m = t.match(/^\{\{widget\|([\w-]+)\}\}$/))) { out.push(BW.widget ? BW.widget(m[1]) : ''); i++; continue; }
      if (t.startsWith('#')) {
        const items = [];
        while (i < lines.length && lines[i].trim().startsWith('#')) { items.push(lines[i].trim().replace(/^#+\s*/, '')); i++; }
        out.push('<ol class="steps">' + items.map(it => { const h = BW.hash(it); const ck = done.includes(h); return `<li class="${ck ? 'done' : ''}"><input type="checkbox" id="c-${h}" data-h="${h}" ${ck ? 'checked' : ''}><label for="c-${h}">${inline(it)}</label></li>`; }).join('') + '</ol>');
        continue;
      }
      if (t.startsWith('*')) {
        const items = [];
        while (i < lines.length && lines[i].trim().startsWith('*')) { items.push(lines[i].trim().replace(/^\*+\s*/, '')); i++; }
        out.push('<ul>' + items.map(it => `<li>${inline(it)}</li>`).join('') + '</ul>');
        continue;
      }
      const para = [];
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i].trim())) { para.push(lines[i].trim()); i++; }
      out.push(`<p>${inline(para.join(' '))}</p>`);
    }
    return { html: out.join('\n'), toc };
  };

  /* ----- Secciones (para «editar» una sola sección) ----- */
  function secStarts(lines) { const s = [0]; lines.forEach((l, i) => { if (H2.test(l.trim())) s.push(i); }); return s; }
  BW.getSection = function (text, k) {
    const lines = String(text || '').replace(/\r/g, '').split('\n'), st = secStarts(lines);
    if (k >= st.length) return '';
    return lines.slice(st[k], k + 1 < st.length ? st[k + 1] : lines.length).join('\n').replace(/\n+$/, '');
  };
  BW.replaceSection = function (text, k, newText) {
    const lines = String(text || '').replace(/\r/g, '').split('\n'), st = secStarts(lines);
    if (k >= st.length) return text;
    const end = k + 1 < st.length ? st[k + 1] : lines.length;
    const repl = newText.replace(/\s+$/, '').split('\n').concat(['']);
    return lines.slice(0, st[k]).concat(repl, lines.slice(end)).join('\n');
  };

  /* ----- Conversión de los bloques del manual a wikitexto ----- */
  BW.blocksToWiki = function (e) {
    const L = [];
    const cell = s => String(s).replace(/\|/g, '/').replace(/\n/g, ' ');
    const h2w = h => h.replace(/<b>(.*?)<\/b>/g, "'''$1'''").replace(/<i>(.*?)<\/i>/g, "''$1''").replace(/<br\s*\/?>/g, '<br>');
    if (e.objetivo) L.push('== Objetivo ==', e.objetivo, '');
    (e.blocks || []).forEach(b => {
      L.push('== ' + b.title + ' ==');
      if (b.type === 'steps') b.items.forEach(x => L.push('# ' + x));
      else if (b.type === 'list') { if (b.intro) L.push(b.intro, ''); b.items.forEach(x => L.push('* ' + x)); }
      else if (b.type === 'text') L.push(h2w(b.html));
      else if (b.type === 'callout') L.push('{{aviso|' + b.text + '}}');
      else if (b.type === 'table') { L.push('{|', '! ' + b.head.map(cell).join(' !! ')); b.rows.forEach(r => L.push('|-', '| ' + r.map(cell).join(' || '))); L.push('|}'); }
      else if (b.type === 'example') { L.push('{|'); b.rows.forEach(r => L.push('|-', "| '''" + cell(r[0]) + "''' || " + cell(r[1]))); L.push('|}'); }
      else if (b.type === 'widget') L.push('{{widget|' + b.name + '}}');
      L.push('');
    });
    if (e.resultado) L.push('== Resultado esperado ==', e.resultado, '');
    return L.join('\n').trim() + '\n';
  };

  /* ----- Enlazado automático de términos del glosario ----- */
  BW.autolink = function (root) {
    const terms = BW.S.gloss.map(g => ({ g, name: g.t.replace(/\s*\(.*?\)\s*/g, ' ').trim() })).filter(x => x.name.length >= 3);
    if (!terms.length || !root) return;
    const map = new Map(); terms.forEach(x => map.set(x.name.toLowerCase(), x));
    const alt = terms.map(x => x.name).sort((a, b) => b.length - a.length).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const re = new RegExp('(?<![\\p{L}\\p{N}])(' + alt + ')(?![\\p{L}\\p{N}])', 'giu');
    const seen = new Set();
    const skip = 'a,h1,h2,h3,h4,th,input,textarea,button,label,summary,script,style,.infobox,.toc,.editsec,.noauto,.ambox,.navbox,.catlinks';
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentElement && n.parentElement.closest(skip) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n => {
      const txt = n.nodeValue; let last = 0, frag = null, m; re.lastIndex = 0;
      while ((m = re.exec(txt))) {
        const key = m[1].toLowerCase(), ent = map.get(key);
        if (!ent || seen.has(key)) continue;
        seen.add(key);
        frag = frag || document.createDocumentFragment();
        frag.append(txt.slice(last, m.index));
        const a = document.createElement('a'); a.className = 'gl'; a.href = '#/glosario/' + ent.g.id; a.title = ent.g.t + ': ' + ent.g.d; a.textContent = m[1];
        frag.append(a); last = m.index + m[1].length;
      }
      if (frag) { frag.append(txt.slice(last)); n.replaceWith(frag); }
    });
  };

  /* ----- Interacciones dentro del contenido (casillas, etiqueta) ----- */
  BW.bindContent = function (root, pageId) {
    root.querySelectorAll('.steps input[data-h]').forEach(inp => inp.addEventListener('change', () => {
      if (!pageId) return;
      const key = 'chk:' + pageId, set = new Set(BW.LS.get(key, []));
      inp.checked ? set.add(inp.dataset.h) : set.delete(inp.dataset.h);
      BW.LS.set(key, [...set]);
      inp.closest('li').classList.toggle('done', inp.checked);
    }));
    const lab = root.querySelectorAll('[data-lab]');
    if (lab.length) lab.forEach(i => i.addEventListener('input', () => { const v = {}; lab.forEach(x => (v[x.dataset.lab] = x.value)); const p = root.querySelector('#labprev'); if (p) p.innerHTML = BW.labelHTML(v); }));
  };
})();
