/* Marktliste zum Abhaken mit Live-Speicher (Worker hemme-marktliste, D1).
   Jeder Haken und jede Ergänzung wird sofort gespeichert, Änderungen anderer kommen alle 20 Sekunden dazu.
   Der Browser hält eine Kopie und eine Warteschlange, falls die Verbindung kurz weg ist. Export als CSV bleibt möglich. */
(function () {
  "use strict";
  var D = window.HEMME_MAERKTE, liste = document.querySelector("[data-mc-liste]");
  if (!D || !liste) return;
  var seite = document.querySelector("[data-mc-api]");
  var API = seite.getAttribute("data-mc-api");
  var KETTEN = D.ketten || { R: ["REWE", "", "#b0061a"], E: ["EDEKA", "", "#ffd400"], K: ["Kaufland", "", "#0c2975"] };
  var NAME = {}; Object.keys(KETTEN).forEach(function (k) { NAME[k] = KETTEN[k][0]; });
  var SPEICHER = "hemme-marktliste-v2", ALT = "hemme-marktliste-v1";
  var zustand = { haken: {}, neu: [], seit: "", schlange: [] };
  try { var gem = JSON.parse(localStorage.getItem(SPEICHER) || "null"); if (gem) zustand = gem; } catch (e) {}
  var altLokal = null;
  try { altLokal = JSON.parse(localStorage.getItem(ALT) || "null"); } catch (e) {}
  function sichern() { try { localStorage.setItem(SPEICHER, JSON.stringify(zustand)); } catch (e) {} }
  function id(m) { return m[0] + "|" + m[2] + "|" + m[3]; }
  function neueId() { return "n" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

  /* ---------- Live-Status ---------- */
  var live = document.querySelector("[data-mc-live]");
  function zeigen(art, text) { live.className = "mc__live mc__live--" + art; live.textContent = text; }
  function uhr(iso) { return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); }

  /* ---------- Senden mit Warteschlange ---------- */
  var sendetGerade = false;
  function anstellen(pfad, daten) { zustand.schlange.push([pfad, daten]); sichern(); senden(); }
  function senden() {
    if (sendetGerade || !zustand.schlange.length) return;
    sendetGerade = true; zeigen("speichert", "Wird gespeichert …");
    var auftrag = zustand.schlange[0];
    fetch(API + auftrag[0], { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(auftrag[1]) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (a) {
        zustand.schlange.shift(); sichern(); sendetGerade = false;
        if (zustand.schlange.length) senden(); else zeigen("ok", "Gespeichert um " + uhr(a.zeit) + " Uhr. NEXAS sieht eure Änderungen sofort.");
      })
      .catch(function () {
        sendetGerade = false;
        zeigen("fehler", "Gerade keine Verbindung. Eure Änderungen sind hier gesichert und werden gleich übertragen.");
        setTimeout(senden, 5000);
      });
  }
  function offen(pfad, idWert) { return zustand.schlange.some(function (a) { return a[0] === pfad && (a[1].id === idWert || (a[1].ids || []).indexOf(idWert) > -1); }); }

  /* ---------- Filterknöpfe ---------- */
  var aktiv = {}, nurHaken = false, suche = "";
  var kettenBox = document.querySelector("[data-mc-ketten]"), nurKnopf = document.querySelector("[data-mc-nur]");
  Object.keys(KETTEN).forEach(function (k) {
    aktiv[k] = true;
    var n = D.m.filter(function (m) { return m[0] === k; }).length;
    if (!n) return;
    var b = document.createElement("button");
    b.type = "button"; b.setAttribute("data-mc-kette", k); b.setAttribute("aria-pressed", "true"); b.style.setProperty("--k", KETTEN[k][2]);
    b.innerHTML = KETTEN[k][0] + " <small>" + n + "</small>";
    kettenBox.insertBefore(b, nurKnopf);
  });
  var anzahl = document.querySelector("[data-mc-anzahl]");
  document.querySelector("[data-mc-gesamt]").textContent = D.m.length;

  /* ---------- Liste einmal aufbauen, danach nur ein- und ausblenden ---------- */
  var nachId = {};
  var zeilen = D.m.map(function (m) {
    var lab = document.createElement("label");
    lab.className = "mc__markt";
    var cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = !!zustand.haken[id(m)];
    cb.addEventListener("change", function () {
      if (cb.checked) zustand.haken[id(m)] = 1; else delete zustand.haken[id(m)];
      anstellen("/api/haken", { id: id(m), wert: cb.checked ? 1 : 0 }); zaehlen();
    });
    lab.appendChild(cb);
    lab.insertAdjacentHTML("beforeend", (KETTEN[m[0]][1] ? "<span class=\"mc__marke\"><img src=\"../assets/img/" + KETTEN[m[0]][1] + "\" alt=\"" + NAME[m[0]] + "\"></span>" : "<span class=\"mc__kette\">" + NAME[m[0]] + "</span>") + "<span class=\"mc__name\">" + m[1] + "</span><span class=\"mc__adr\">" + m[2] + "</span><span class=\"mc__plz\">" + m[3] + " Berlin</span>");
    liste.appendChild(lab);
    var z = { el: lab, cb: cb, m: m, text: (NAME[m[0]] + " " + m[1] + " " + m[2] + " " + m[3]).toLowerCase() };
    nachId[id(m)] = z;
    return z;
  });

  function filtern() {
    var sichtbar = 0;
    zeilen.forEach(function (z) {
      var an = aktiv[z.m[0]] && (!nurHaken || z.cb.checked) && (!suche || z.text.indexOf(suche) > -1);
      z.el.hidden = !an; if (an) sichtbar++;
    });
    liste.setAttribute("data-leer", sichtbar ? "" : "Keine Märkte für diese Auswahl.");
  }
  function zaehlen() { anzahl.textContent = zeilen.filter(function (z) { return z.cb.checked; }).length; }

  document.querySelector("[data-mc-suche]").addEventListener("input", function (ev) { suche = ev.target.value.trim().toLowerCase(); filtern(); });
  document.querySelectorAll("[data-mc-kette]").forEach(function (b) {
    b.addEventListener("click", function () { var k = b.getAttribute("data-mc-kette"); aktiv[k] = !aktiv[k]; b.setAttribute("aria-pressed", String(aktiv[k])); filtern(); });
  });
  nurKnopf.addEventListener("click", function () { nurHaken = !nurHaken; nurKnopf.setAttribute("aria-pressed", String(nurHaken)); filtern(); });
  document.querySelectorAll("[data-mc-alle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var an = b.getAttribute("data-mc-alle") === "1", ids = [];
      zeilen.forEach(function (z) {
        if (z.el.hidden || z.cb.checked === an) return;
        z.cb.checked = an; ids.push(id(z.m));
        if (an) zustand.haken[id(z.m)] = 1; else delete zustand.haken[id(z.m)];
      });
      if (ids.length) anstellen("/api/haken-viele", { ids: ids, wert: an ? 1 : 0 });
      zaehlen(); filtern();
    });
  });

  /* ---------- Ergänzungen: Name, Straße, PLZ, Ort, Notiz ---------- */
  var FELDER = [["name", "Name des Ladens"], ["strasse", "Straße und Hausnummer"], ["plz", "PLZ"], ["ort", "Ort"], ["notiz", "Notiz, zum Beispiel welche Produkte"]];
  var neuBox = document.querySelector("[data-mc-neu]");
  var warte = {};
  function leer(n) { return !FELDER.some(function (f) { return (n.daten[f[0]] || "").trim(); }); }
  function neuSpeichern(n) {
    clearTimeout(warte[n.id]);
    warte[n.id] = setTimeout(function () { if (!leer(n)) anstellen("/api/neu", { id: n.id, daten: n.daten }); }, 700);
  }
  function neuZeichnen() {
    var fokus = document.activeElement && document.activeElement.getAttribute("data-neu");
    neuBox.textContent = "";
    zustand.neu.forEach(function (n, i) {
      var reihe = document.createElement("fieldset");
      reihe.className = "mc__neu";
      reihe.innerHTML = "<legend class=\"nur-sr\">Ergänzung " + (i + 1) + "</legend>";
      FELDER.forEach(function (f) {
        var l = document.createElement("label");
        l.className = "mc__feld mc__feld--" + f[0];
        l.innerHTML = "<span>" + f[1] + "</span>";
        var inp = document.createElement("input");
        inp.value = n.daten[f[0]] || "";
        inp.setAttribute("data-neu", n.id + ":" + f[0]);
        if (f[0] === "plz") { inp.inputMode = "numeric"; inp.maxLength = 5; }
        inp.addEventListener("input", function () { n.daten[f[0]] = inp.value; sichern(); neuSpeichern(n); });
        l.appendChild(inp); reihe.appendChild(l);
      });
      var weg = document.createElement("button");
      weg.type = "button"; weg.className = "mc__weg"; weg.innerHTML = "<span aria-hidden=\"true\">×</span><span class=\"nur-sr\">Ergänzung " + (i + 1) + " entfernen</span>";
      weg.addEventListener("click", function () {
        clearTimeout(warte[n.id]);
        zustand.neu.splice(i, 1);
        if (!leer(n)) anstellen("/api/neu-loeschen", { id: n.id });
        auffuellen(); sichern(); neuZeichnen();
      });
      reihe.appendChild(weg);
      neuBox.appendChild(reihe);
    });
    if (fokus) { var f = neuBox.querySelector("[data-neu=\"" + fokus + "\"]"); if (f) f.focus(); }
  }
  function auffuellen() { while (zustand.neu.filter(leer).length < 1 || zustand.neu.length < 3) zustand.neu.push({ id: neueId(), daten: {} }); }
  document.querySelector("[data-mc-neu-zeile]").addEventListener("click", function () {
    zustand.neu.push({ id: neueId(), daten: {} }); sichern(); neuZeichnen();
    var felder = neuBox.querySelectorAll("input"); felder[felder.length - FELDER.length].focus();
  });

  /* ---------- Abgleich mit dem Server ---------- */
  function uebernehmen(a, ganz) {
    if (ganz) { zustand.haken = {}; }
    a.haken.forEach(function (h) {
      if (offen("/api/haken", h[0]) || offen("/api/haken-viele", h[0])) return;
      if (h[1]) zustand.haken[h[0]] = 1; else delete zustand.haken[h[0]];
      var z = nachId[h[0]]; if (z) z.cb.checked = !!h[1];
    });
    if (ganz) zeilen.forEach(function (z) { if (!offen("/api/haken", id(z.m))) z.cb.checked = !!zustand.haken[id(z.m)]; });
    var geaendert = false;
    a.neu.forEach(function (s) {
      if (warte[s.id] || offen("/api/neu", s.id)) return;
      var vorh = zustand.neu.filter(function (n) { return n.id === s.id; })[0];
      if (s.geloescht) { if (vorh) { zustand.neu.splice(zustand.neu.indexOf(vorh), 1); geaendert = true; } return; }
      if (vorh) { if (JSON.stringify(vorh.daten) !== JSON.stringify(s.daten)) { vorh.daten = s.daten; geaendert = true; } }
      else { zustand.neu.unshift({ id: s.id, daten: s.daten }); geaendert = true; }
    });
    zustand.seit = a.jetzt;
    auffuellen(); sichern(); zaehlen(); filtern();
    if (geaendert || ganz) neuZeichnen();
  }
  function holen(ganz) {
    return fetch(API + "/api/stand" + (ganz ? "" : "?seit=" + encodeURIComponent(zustand.seit)), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (a) { uebernehmen(a, ganz); if (!zustand.schlange.length && !sendetGerade) zeigen("ok", "Live gespeichert. Stand " + uhr(a.jetzt) + " Uhr."); });
  }

  /* Erster Start: frühere Haken nur aus dem Browser (Version ohne Live-Speicher) einmalig hochladen */
  function altesHochladen() {
    if (!altLokal) return;
    var ids = Object.keys(altLokal.haken || {}).filter(function (i) { return nachId[i] && !zustand.haken[i]; });
    if (ids.length) { ids.forEach(function (i) { zustand.haken[i] = 1; nachId[i].cb.checked = true; }); anstellen("/api/haken-viele", { ids: ids, wert: 1 }); }
    (altLokal.neu || []).forEach(function (n) {
      if (!(n.name || n.strasse)) return;
      var neu = { id: neueId(), daten: { name: n.name || "", strasse: n.strasse || "", plz: n.plz || "", ort: n.ort || "", notiz: n.notiz || "" } };
      zustand.neu.unshift(neu); anstellen("/api/neu", { id: neu.id, daten: neu.daten });
    });
    try { localStorage.removeItem(ALT); } catch (e) {}
    zaehlen(); neuZeichnen();
  }

  auffuellen(); neuZeichnen(); zaehlen(); filtern();
  zeigen("speichert", "Verbinde mit dem Live-Speicher …");
  holen(true).then(altesHochladen, function () { zeigen("fehler", "Gerade keine Verbindung. Ihr könnt trotzdem abhaken, alles wird nachgetragen."); }).then(senden);
  setInterval(function () { if (!document.hidden) holen(false).catch(function () {}); }, 20000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) holen(false).catch(function () {}); });

  /* ---------- Export als Datei (optional) ---------- */
  function csvWert(v) { v = String(v == null ? "" : v); return /[";\n]/.test(v) ? "\"" + v.replace(/"/g, "\"\"") + "\"" : v; }
  document.querySelector("[data-mc-export]").addEventListener("click", function () {
    var z = [["Quelle", "Kette", "Name", "Straße", "PLZ", "Ort", "Hemme im Sortiment", "Notiz", "Breite", "Länge"]];
    zeilen.forEach(function (r) { var m = r.m; z.push(["Liste", NAME[m[0]], m[1], m[2], m[3], "Berlin", r.cb.checked ? "ja" : "nein", "", m[4], m[5]]); });
    zustand.neu.forEach(function (n) { if (!leer(n)) z.push(["ergänzt", "", n.daten.name || "", n.daten.strasse || "", n.daten.plz || "", n.daten.ort || "", "ja", n.daten.notiz || "", "", ""]); });
    var csv = "﻿" + z.map(function (r) { return r.map(csvWert).join(";"); }).join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "Hemme-Milch_Marktliste_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
  });
  document.querySelector("[data-mc-drucken]").addEventListener("click", function () { window.print(); });
})();
