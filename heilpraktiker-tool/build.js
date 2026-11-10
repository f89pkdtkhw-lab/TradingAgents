#!/usr/bin/env node
// Baut aus src/ eine einzige, offline nutzbare HTML-Datei.
//   Aufruf:   node build.js
//   Ergebnis: Krankheiten-Nachschlagewerk.html
// Der gesamte Inhalt wird zusätzlich fest (statisch) in die Datei geschrieben,
// damit er auch in Handy-Vorschauen ohne JavaScript lesbar ist
// (iPhone „Dateien“-Vorschau, Android-HTML-Viewer). Wo JavaScript läuft,
// ersetzt die interaktive App (Suche, Filter, Lernkarten) diese Ansicht.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "Krankheiten-Nachschlagewerk.html");

const read = (p) => fs.readFileSync(p, "utf8");
const dataFiles = fs.readdirSync(path.join(SRC, "data")).filter((f) => f.endsWith(".js")).sort();
const data = dataFiles.map((f) => read(path.join(SRC, "data", f))).join("\n");
const shared = read(path.join(SRC, "shared.js"));
const app = read(path.join(SRC, "app.js"));
let html = read(path.join(SRC, "app.html"));

for (const [name, chunk] of [["data", data], ["shared", shared], ["app", app]]) {
  if (/<\/script/i.test(chunk)) throw new Error(`'</script' in ${name} gefunden – bitte entfernen`);
}

// Daten + Bausteine in einer Sandbox ausführen
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(data + "\n" + shared, ctx);
const D = ctx.window.D.slice().sort((a, b) => a.n.localeCompare(b.n, "de"));
const CATS = ctx.window.CATS;
const HP = ctx.window.HP;
const esc = HP.esc;
D.forEach((d) => { d.id = HP.slug(d.n); });

// doppelte IDs verhindern
const seen = new Set();
for (const d of D) {
  if (seen.has(d.id)) throw new Error("Doppelter Eintrag: " + d.n);
  seen.add(d.id);
}

// ---------- statische Ansicht ----------
const link = (d) => `<li><a href="#d-${d.id}">${esc(d.n)}</a></li>`;
let s = '<div id="static" class="wrap">';
s += '<p class="nojs-note">📖 <b>Einfache Ansicht</b> – alle Erkrankungen zum Aufklappen. ' +
  'Für <b>Suche, Filter und Lernkarten</b> die Datei in <b>Chrome</b> oder <b>Safari</b> öffnen ' +
  '(iPhone: Teilen-Symbol → „In Safari öffnen“ bzw. „Öffnen mit …“).</p>';
s += '<nav class="toc" id="top">' +
  '<a class="red" href="#s-notfall">🚨 Notfälle</a>' +
  '<a class="violet" href="#s-verbot">⛔ Behandlungsverbote</a>' +
  '<a href="#s-labor">🧪 Laborwerte</a>' +
  '<a href="#s-az">🔤 A–Z</a>' +
  Object.keys(CATS).filter((k) => D.some((d) => d.k === k))
    .map((k) => `<a href="#k-${k}">${esc(CATS[k])}</a>`).join("") +
  "</nav>";
const up = '<a class="uplink" href="#top">↑ nach oben</a>';

// Notfälle
s += '<h2 id="s-notfall">🚨 Notfälle</h2>' + HP.notfallRegelnHtml() + HP.leitHtml();
s += '<div class="panel links"><h3>Immer ein Notfall</h3><ul>' + D.filter((d) => d.nf === 2).map(link).join("") + "</ul></div>";
s += '<div class="panel links"><h3>⚠️ Kann zum Notfall werden</h3><ul>' + D.filter((d) => d.nf === 1).map(link).join("") + "</ul></div>" + up;

// Behandlungsverbote
s += '<h2 id="s-verbot">⛔ Behandlungsverbote</h2>' + HP.verbotRechtHtml();
s += '<div class="panel links"><h3>Erkrankungen mit Behandlungsverbot</h3><ul>' + D.filter((d) => d.bv).map(link).join("") + "</ul></div>" + up;

// A–Z
s += '<h2 id="s-az">🔤 Alle Erkrankungen A–Z</h2><div class="panel links"><ul>' + D.map(link).join("") + "</ul></div>" + up;

// nach Organsystem
for (const k of Object.keys(CATS)) {
  const list = D.filter((d) => d.k === k);
  if (!list.length) continue;
  s += `<h2 id="k-${k}">${esc(CATS[k])} (${list.length})</h2>`;
  for (const d of list) {
    s += `<details class="dz" id="d-${d.id}"><summary>${esc(d.n)}` +
      `<span class="badges">${HP.badges(d, false)}</span>` +
      (d.l ? `<span class="ls">${esc(d.l)}</span>` : "") +
      `</summary><div class="dzb">${HP.detailHtml(d)}</div></details>`;
  }
  s += up;
}

// Labor
s += '<h2 id="s-labor">🧪 Laborwerte</h2>' + HP.laborHtml() + up;
s += HP.disclaimer() + "</div>";

html = html
  .replace("<!--__STATIC__-->", () => s)
  .replace("/*__DATA__*/", () => data + "\n" + shared)
  .replace("/*__APP__*/", () => app);
fs.writeFileSync(OUT, html, "utf8");
console.log(`OK: ${path.basename(OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB, ${D.length} Erkrankungen)`);
