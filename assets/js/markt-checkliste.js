/* Marktliste zum Abhaken: Haken und Ergänzungen bleiben im Browser (localStorage),
   Export als CSV (Semikolon, UTF-8), Import derselben Datei zum Weiterarbeiten. */
(function () {
  "use strict";
  var D = window.HEMME_MAERKTE, liste = document.querySelector("[data-mc-liste]");
  if (!D || !liste) return;
  var KETTEN = D.ketten || { R: ["REWE", "", "#b0061a"], E: ["EDEKA", "", "#ffd400"], K: ["Kaufland", "", "#0c2975"] };
  var NAME = {}; Object.keys(KETTEN).forEach(function (k) { NAME[k] = KETTEN[k][0]; });
  var SPEICHER = "hemme-marktliste-v1";
  var zustand = { haken: {}, neu: [] };
  try { var alt = JSON.parse(localStorage.getItem(SPEICHER) || "null"); if (alt) zustand = alt; } catch (e) {}
  if (!zustand.neu || !zustand.neu.length) zustand.neu = [{}, {}, {}];
  function sichern() { try { localStorage.setItem(SPEICHER, JSON.stringify(zustand)); } catch (e) {} }
  function id(m) { return m[0] + "|" + m[2] + "|" + m[3]; }

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

  /* Liste einmal aufbauen, danach nur ein- und ausblenden */
  var zeilen = D.m.map(function (m, i) {
    var lab = document.createElement("label");
    lab.className = "mc__markt";
    var cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = !!zustand.haken[id(m)];
    cb.addEventListener("change", function () {
      if (cb.checked) zustand.haken[id(m)] = 1; else delete zustand.haken[id(m)];
      sichern(); zaehlen();
    });
    var name = m[1];
    lab.appendChild(cb);
    lab.insertAdjacentHTML("beforeend", (KETTEN[m[0]][1] ? "<span class=\"mc__marke\"><img src=\"../assets/img/" + KETTEN[m[0]][1] + "\" alt=\"" + NAME[m[0]] + "\"></span>" : "<span class=\"mc__kette\">" + NAME[m[0]] + "</span>") + "<span class=\"mc__name\">" + name.trim() + "</span><span class=\"mc__adr\">" + m[2] + "</span><span class=\"mc__plz\">" + m[3] + " Berlin</span>");
    liste.appendChild(lab);
    return { el: lab, cb: cb, m: m, text: (NAME[m[0]] + " " + m[1] + " " + m[2] + " " + m[3]).toLowerCase() };
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
  var nur = document.querySelector("[data-mc-nur]");
  nur.addEventListener("click", function () { nurHaken = !nurHaken; nur.setAttribute("aria-pressed", String(nurHaken)); filtern(); });
  document.querySelectorAll("[data-mc-alle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var an = b.getAttribute("data-mc-alle") === "1";
      zeilen.forEach(function (z) { if (z.el.hidden) return; z.cb.checked = an; if (an) zustand.haken[id(z.m)] = 1; else delete zustand.haken[id(z.m)]; });
      sichern(); zaehlen(); filtern();
    });
  });

  /* Ergänzungen: Name, Straße, PLZ, Ort, Notiz */
  var FELDER = [["name", "Name des Ladens"], ["strasse", "Straße und Hausnummer"], ["plz", "PLZ"], ["ort", "Ort"], ["notiz", "Notiz, zum Beispiel welche Produkte"]];
  var neuBox = document.querySelector("[data-mc-neu]");
  function neuZeichnen() {
    neuBox.textContent = "";
    zustand.neu.forEach(function (z, i) {
      var reihe = document.createElement("fieldset");
      reihe.className = "mc__neu";
      reihe.innerHTML = "<legend class=\"nur-sr\">Ergänzung " + (i + 1) + "</legend>";
      FELDER.forEach(function (f) {
        var l = document.createElement("label");
        l.className = "mc__feld mc__feld--" + f[0];
        l.innerHTML = "<span>" + f[1] + "</span>";
        var inp = document.createElement("input");
        inp.value = z[f[0]] || "";
        if (f[0] === "plz") { inp.inputMode = "numeric"; inp.maxLength = 5; }
        inp.addEventListener("input", function () { z[f[0]] = inp.value; sichern(); });
        l.appendChild(inp); reihe.appendChild(l);
      });
      var weg = document.createElement("button");
      weg.type = "button"; weg.className = "mc__weg"; weg.innerHTML = "<span aria-hidden=\"true\">×</span><span class=\"nur-sr\">Ergänzung " + (i + 1) + " entfernen</span>";
      weg.addEventListener("click", function () { zustand.neu.splice(i, 1); if (!zustand.neu.length) zustand.neu.push({}); sichern(); neuZeichnen(); });
      reihe.appendChild(weg);
      neuBox.appendChild(reihe);
    });
  }
  document.querySelector("[data-mc-neu-zeile]").addEventListener("click", function () {
    zustand.neu.push({}); sichern(); neuZeichnen();
    var felder = neuBox.querySelectorAll("input"); felder[felder.length - FELDER.length].focus();
  });

  /* Export: eine Zeile pro Markt, Spalte „Hemme im Sortiment“ ja/nein, Ergänzungen mit Quelle „ergänzt“ */
  function csvWert(v) { v = String(v == null ? "" : v); return /[";\n]/.test(v) ? "\"" + v.replace(/"/g, "\"\"") + "\"" : v; }
  document.querySelector("[data-mc-export]").addEventListener("click", function () {
    var z = [["Quelle", "Kette", "Name", "Straße", "PLZ", "Ort", "Hemme im Sortiment", "Notiz", "Breite", "Länge"]];
    zeilen.forEach(function (r) { var m = r.m; z.push(["Liste", NAME[m[0]], m[1], m[2], m[3], "Berlin", r.cb.checked ? "ja" : "nein", "", m[4], m[5]]); });
    zustand.neu.forEach(function (n) { if (n.name || n.strasse) z.push(["ergänzt", "", n.name || "", n.strasse || "", n.plz || "", n.ort || "", "ja", n.notiz || "", "", ""]); });
    var csv = "﻿" + z.map(function (r) { return r.map(csvWert).join(";"); }).join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "Hemme-Milch_Marktliste_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
  });
  document.querySelector("[data-mc-drucken]").addEventListener("click", function () { window.print(); });

  neuZeichnen(); zaehlen(); filtern();
})();
