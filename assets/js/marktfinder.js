/* Marktfinder Berlin: Postleitzahl oder Standort, nächste Märkte als Liste und auf der Karte.
   Daten aus maerkte-berlin.js (OpenStreetMap). Keine Fremdaufrufe beim Laden. */
(function () {
  "use strict";
  var D = window.HEMME_MAERKTE, box = document.querySelector("[data-marktfinder]");
  if (!D || !box) return;
  var SVGNS = "http://www.w3.org/2000/svg";
  /* Ketten aus den Daten: Code → [Name, Logo, Punktfarbe]. X = von Hemme ergänzte Läden */
  var KETTEN = D.ketten || { R: ["REWE", "", "#b0061a"], E: ["EDEKA", "", "#ffd400"], K: ["Kaufland", "", "#0c2975"] };
  var NAME = {}; Object.keys(KETTEN).forEach(function (k) { NAME[k] = KETTEN[k][0]; });
  var ANZAHL = 6;
  var form = box.querySelector("[data-mf-form]"), feld = form.querySelector("input");
  var status = box.querySelector("[data-mf-status]"), liste = box.querySelector("[data-mf-liste]");
  var svg = box.querySelector("[data-mf-karte]");
  var aktiv = {}, punkt = null, ortName = "";
  Object.keys(KETTEN).forEach(function (k) { aktiv[k] = true; });
  /* Filterknöpfe nur für Ketten, die in den Daten vorkommen */
  var kettenBox = box.querySelector("[data-mf-ketten]");
  if (kettenBox) Object.keys(KETTEN).forEach(function (k) {
    var n = D.m.filter(function (m) { return m[0] === k; }).length;
    if (!n) return;
    var b = document.createElement("button");
    b.type = "button"; b.setAttribute("data-mf-kette", k); b.setAttribute("aria-pressed", "true"); b.style.setProperty("--k", KETTEN[k][2]);
    b.innerHTML = KETTEN[k][0] + " <small>" + n + "</small>";
    kettenBox.appendChild(b);
  });
  function marke(k) {
    return KETTEN[k] && KETTEN[k][1] ? "<img class=\"mf__logo\" src=\"../../assets/img/" + KETTEN[k][1] + "\" alt=\"" + KETTEN[k][0] + "\">" : "<span class=\"mf__kette mf__kette--" + k + "\">" + NAME[k] + "</span>";
  }

  function ohneWaise(t) { return t.replace(/ (\S+)$/, " $1"); }
  function km(a, b, c, d) {
    var r = Math.PI / 180, x = (d - b) * r * Math.cos((a + c) / 2 * r), y = (c - a) * r;
    return Math.sqrt(x * x + y * y) * 6371;
  }
  var bx = D.box;
  function xy(lat, lon) { return [(lon - bx[0]) / (bx[1] - bx[0]) * bx[4], (bx[3] - lat) / (bx[3] - bx[2]) * bx[5]]; }
  function el(tag, attr) { var e = document.createElementNS(SVGNS, tag); for (var k in attr) e.setAttribute(k, attr[k]); return e; }

  /* Karte aufbauen */
  svg.setAttribute("viewBox", "0 0 " + bx[4] + " " + bx[5]);
  svg.appendChild(el("path", { d: D.umriss, "class": "mf__land" }));
  var gPunkte = el("g", {}), gTreffer = el("g", {}), gOrt = el("g", {});
  svg.appendChild(gPunkte); svg.appendChild(gOrt); svg.appendChild(gTreffer);
  var kreise = D.m.map(function (m) {
    var p = xy(m[4], m[5]);
    var c = el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 5.5, "class": "mf__p mf__p--" + m[0], fill: (KETTEN[m[0]] || [])[2] || "#0c2975" });
    c.addEventListener("click", function () { setzen(m[4], m[5], "rund um " + m[1] + ", " + m[2]); });
    gPunkte.appendChild(c);
    return c;
  });

  /* Ausschnitt: bei einer Suche auf die Treffer zoomen, Punkte und Nadeln behalten ihre Bildschirmgröße */
  var ganz = box.querySelector("[data-mf-ganz]");
  function zoom(pkte) {
    var vb = [0, 0, bx[4], bx[5]];
    if (pkte) {
      var xs = pkte.map(function (p) { return p[0]; }), ys = pkte.map(function (p) { return p[1]; });
      var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
      var w = Math.max(x1 - x0, y1 - y0) * 1.5 + 40, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      w = Math.max(w, 150);
      var h = w * bx[5] / bx[4];
      vb = [cx - w / 2, cy - h / 2, w, h];
    }
    svg.setAttribute("viewBox", vb.map(function (v) { return v.toFixed(1); }).join(" "));
    var k = vb[2] / bx[4];
    kreise.forEach(function (c) { c.setAttribute("r", (6 * k).toFixed(2)); c.style.strokeWidth = (1.4 * k).toFixed(2); });
    svg.querySelector(".mf__land").style.strokeWidth = (2 * k).toFixed(2);
    if (ganz) ganz.hidden = !pkte;
    return k;
  }
  if (ganz) ganz.addEventListener("click", function () { punkt = null; zeichnen(); status.textContent = ohneWaise("Gebt eure Postleitzahl ein oder tippt auf einen Punkt in der Karte."); });


  function zeichnen() {
    kreise.forEach(function (c, i) { c.classList.toggle("ist-aus", !aktiv[D.m[i][0]]); });
    while (gTreffer.firstChild) gTreffer.removeChild(gTreffer.firstChild);
    while (gOrt.firstChild) gOrt.removeChild(gOrt.firstChild);
    liste.textContent = "";
    if (!punkt) { zoom(null); return; }
    var auswahl = D.m.map(function (m, i) { return { m: m, i: i, d: km(punkt[0], punkt[1], m[4], m[5]) }; })
      .filter(function (t) { return aktiv[t.m[0]]; })
      .sort(function (a, b) { return a.d - b.d; }).slice(0, ANZAHL);
    var o = xy(punkt[0], punkt[1]);
    var k0 = zoom([o].concat(auswahl.map(function (t) { return xy(t.m[4], t.m[5]); })));
    gOrt.appendChild(el("circle", { cx: o[0], cy: o[1], r: 30 * k0, "class": "mf__umkreis" }));
    gOrt.appendChild(el("circle", { cx: o[0], cy: o[1], r: 9 * k0, "class": "mf__ort", "stroke-width": 4 * k0 }));
    auswahl.slice().reverse().forEach(function (t, k) {
      var nr = auswahl.length - k, p = xy(t.m[4], t.m[5]);
      var g = el("g", { "class": "mf__nadel", transform: "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ") scale(" + (1.5 * k0).toFixed(3) + ")" });
      g.appendChild(el("circle", { r: 15 }));
      var tx = el("text", { "text-anchor": "middle", dy: "5.5" }); tx.textContent = nr;
      g.appendChild(tx); gTreffer.appendChild(g);
    });
    auswahl.forEach(function (t, k) {
      var m = t.m, li = document.createElement("li");
      var route = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(m[1] + ", " + m[2] + ", " + m[3] + " Berlin");
      li.className = "mf__markt";
      li.innerHTML = "<span class=\"mf__nr\" aria-hidden=\"true\">" + (k + 1) + "</span>" +
        "<div><p class=\"mf__name\">" + marke(m[0]) + " " + (m[1] === NAME[m[0]] ? "" : m[1].replace(NAME[m[0]] + " ", "")) + "</p>" +
        "<p class=\"mf__adr\">" + m[2] + ", " + m[3] + "&nbsp;Berlin</p></div>" +
        "<div class=\"mf__rechts\"><b>" + t.d.toFixed(1).replace(".", ",") + "&nbsp;km</b>" +
        "<a href=\"" + route + "\" target=\"_blank\" rel=\"noopener\">Route<span class=\"nur-sr\"> zu " + NAME[m[0]] + ", " + m[2] + " (öffnet Google Maps in neuem Tab)</span></a></div>";
      liste.appendChild(li);
    });
    status.textContent = ohneWaise(auswahl.length ? "Die " + auswahl.length + " nächsten Märkte " + ortName + "." : "Keine Märkte mit dieser Auswahl. Schaltet oben eine Kette dazu.");
  }

  function setzen(lat, lon, name) {
    punkt = [lat, lon]; ortName = name; zeichnen();
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var plz = (feld.value || "").trim();
    if (!/^\d{5}$/.test(plz)) { punkt = null; zeichnen(); status.textContent = ohneWaise("Bitte eine fünfstellige Postleitzahl eingeben, zum Beispiel 10115."); feld.focus(); return; }
    var c = D.plz[plz];
    if (!c) {
      punkt = null; zeichnen();
      status.textContent = ohneWaise(/^1[0-4]/.test(plz)
        ? "Die Postleitzahl " + plz + " kennen wir in Berlin nicht. Bitte prüft die Eingabe."
        : "Für " + plz + " zeigen wir noch keine Märkte, die Karte umfasst bisher Berlin. Frisch vom Hof gibt es alles im Milchladen in Schmargendorf, Mittwoch bis Sonntag von 11 bis 18 Uhr.");
      return;
    }
    setzen(c[0], c[1], "rund um " + plz);
  });

  var ortKnopf = box.querySelector("[data-mf-ort]");
  if (!("geolocation" in navigator)) ortKnopf.hidden = true;
  ortKnopf.addEventListener("click", function () {
    status.textContent = "Standort wird ermittelt …";
    navigator.geolocation.getCurrentPosition(function (p) {
      var lat = p.coords.latitude, lon = p.coords.longitude;
      if (lat < bx[2] - 0.1 || lat > bx[3] + 0.1 || lon < bx[0] - 0.15 || lon > bx[1] + 0.15) {
        punkt = null; zeichnen(); status.textContent = ohneWaise("Ihr seid gerade außerhalb von Berlin. Gebt eine Berliner Postleitzahl ein oder kommt in den Milchladen auf dem Hof.");
        return;
      }
      setzen(lat, lon, "bei euch");
    }, function () { status.textContent = ohneWaise("Der Standort ist nicht freigegeben. Gebt einfach eure Postleitzahl ein."); }, { timeout: 10000, maximumAge: 600000 });
  });

  box.querySelectorAll("[data-mf-kette]").forEach(function (k) {
    k.addEventListener("click", function () {
      var id = k.getAttribute("data-mf-kette");
      aktiv[id] = !aktiv[id];
      k.setAttribute("aria-pressed", String(aktiv[id]));
      zeichnen();
    });
  });

  box.querySelectorAll("[data-mf-plz]").forEach(function (b) {
    b.addEventListener("click", function () {
      box.querySelectorAll("[data-mf-plz]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      feld.value = b.getAttribute("data-mf-plz");
      var c = D.plz[feld.value];
      if (c) setzen(c[0], c[1], "in " + b.textContent.replace(/\u00a0/g, " "));
    });
    b.setAttribute("aria-pressed", "false");
  });

  box.querySelector("[data-mf-gesamt]").textContent = D.m.length;
  zeichnen();
  status.textContent = ohneWaise("Gebt eure Postleitzahl ein oder tippt auf einen Punkt in der Karte.");
})();
