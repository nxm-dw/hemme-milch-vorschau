/* Wo kaufen: Regionen-Auswahl und Marktkarte für Berlin, Brandenburg, Mecklenburg-Vorpommern, Thüringen und Sachsen.
   Daten aus maerkte-regionen.js, Karte mit Leaflet aus assets/vendor. Ohne Klick keine Fremdaufrufe:
   Straßen- und Satellitenbilder lädt erst der Knopf „Straßenkarte laden“. */
(function () {
  "use strict";
  var D = window.HEMME_REGIONEN;
  function ohneWaise(t) { return t.replace(/ (\S+)$/, " $1"); }

  /* ---------------------------------------------------------------- Regionen-Auswahl */
  var rk = document.querySelector("[data-regionen]");
  if (rk) {
    var tabs = [].slice.call(rk.querySelectorAll("[data-rk]"));
    function waehlen(id, fokus) {
      tabs.forEach(function (t) {
        var an = t.getAttribute("data-rk") === id;
        t.setAttribute("aria-selected", String(an)); t.tabIndex = an ? 0 : -1;
        document.getElementById("rk-" + t.getAttribute("data-rk")).hidden = !an;
        if (an && fokus) t.focus();
      });
      rk.querySelectorAll("[data-rk-flaeche]").forEach(function (g) { g.classList.toggle("ist-aktiv", g.getAttribute("data-rk-flaeche") === id); });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { waehlen(t.getAttribute("data-rk")); });
      t.addEventListener("keydown", function (e) {
        var n = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (n) { e.preventDefault(); waehlen(tabs[(i + n + tabs.length) % tabs.length].getAttribute("data-rk"), true); }
      });
    });
    rk.querySelectorAll("[data-rk-flaeche]").forEach(function (g) { g.addEventListener("click", function () { waehlen(g.getAttribute("data-rk-flaeche")); }); });
    waehlen(tabs[0].getAttribute("data-rk"));
  }

  /* ---------------------------------------------------------------- Marktkarte */
  var box = document.querySelector("[data-marktkarte]"), L = window.L;
  if (!D || !L || !box) return;
  var K = D.ketten, ANZAHL = 8, WEIT = 25;
  var REGION = { bebb: ["BE", "BB"], mv: ["MV"], thsn: ["TH", "SN"] };
  var NUR_MILCH = { M: 1, P: 1, L: 1 }, WUNSCH = { R: 1, E: 1 };
  var form = box.querySelector("[data-mk-form]"), feld = form.querySelector("input");
  var status = box.querySelector("[data-mk-status]"), liste = box.querySelector("[data-mk-liste]");
  var wunsch = box.querySelector("[data-mk-wunsch]");
  var aktiv = {};
  Object.keys(K).forEach(function (k) { aktiv[k] = true; });

  function km(a, b, c, d) {
    var r = Math.PI / 180, x = (d - b) * r * Math.cos((a + c) / 2 * r), y = (c - a) * r;
    return Math.sqrt(x * x + y * y) * 6371;
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  function adresse(m) { return [m[2], ((m[3] || "") + " " + (m[4] || "")).trim()].filter(Boolean).join(", ") || D.land[m[7]]; }
  function wunschLink(m) {
    return "../../aktuell/wunschzettel/?markt=" + encodeURIComponent(m[1] + ", " + adresse(m));
  }

  /* Karte: zuerst nur Ländergrenzen von unserem Server, keine Kartenbilder */
  var karte = L.map(box.querySelector("[data-mk-karte]"), { preferCanvas: true, zoomControl: false, scrollWheelZoom: false, minZoom: 5, maxZoom: 18, zoomSnap: 0.5 });
  L.control.zoom({ zoomInTitle: "Hineinzoomen", zoomOutTitle: "Herauszoomen" }).addTo(karte);
  karte.attributionControl.setPrefix('<a href="https://leafletjs.com" rel="noopener">Leaflet</a>');
  karte.on("click", function () { karte.scrollWheelZoom.enable(); });
  karte.on("mouseout", function () { karte.scrollWheelZoom.disable(); });
  var HEMME = { BE: 1, BB: 1, MV: 1, TH: 1, SN: 1 };
  var flaechen = L.layerGroup().addTo(karte);
  Object.keys(D.grenzen).forEach(function (c) {
    D.grenzen[c].forEach(function (ring) {
      L.polygon(ring.map(function (p) { return [p[1], p[0]]; }), {
        interactive: false, weight: HEMME[c] ? 1.4 : 1, color: HEMME[c] ? "#7fa9d6" : "#c9d4e1",
        fillColor: HEMME[c] ? "#dcebfa" : "#eef2f7", fillOpacity: 1
      }).addTo(flaechen);
    });
  });
  var grenzen = L.latLngBounds([50.15, 10.0], [54.75, 15.1]);
  karte.fitBounds(grenzen);

  /* Märkte als Punkte in Kettenfarbe */
  var schichten = null;
  var punkte = L.layerGroup().addTo(karte);
  function radius() { var z = karte.getZoom(); return z < 7 ? 2.2 : z < 9 ? 3.4 : z < 11 ? 5 : z < 13 ? 6.5 : 8; }
  var kreise = D.m.map(function (m) {
    var c = L.circleMarker([m[5], m[6]], { radius: radius(), weight: 1, color: "#fff", fillColor: (K[m[0]] || [])[2] || "#0c2975", fillOpacity: 1 });
    c.bindPopup(function () { return blase(m); });
    c.addTo(punkte);
    return c;
  });
  /* Die vereinfachten Grenzen taugen für den Überblick, nicht für Straßenebene */
  function grenzenStil() {
    var nah = karte.getZoom() >= 10;
    flaechen.eachLayer(function (p) { p.setStyle({ fillOpacity: schichten || nah ? 0 : 1, opacity: nah ? 0 : schichten ? .5 : 1 }); });
  }
  karte.on("zoomend", function () { var r = radius(); kreise.forEach(function (c) { c.setRadius(r); }); grenzenStil(); });

  function blase(m) {
    var route = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(m[1] + ", " + adresse(m));
    return "<div class=\"mk__blase\"><b>" + esc(m[1]) + "</b><br>" + esc(adresse(m)) +
      (NUR_MILCH[m[0]] ? "<br><em>Nur Vollmilch 3,7&nbsp;%</em>" : "") +
      "<p><a href=\"" + route + "\" target=\"_blank\" rel=\"noopener\">Route</a>" +
      (WUNSCH[m[0]] ? " · <a href=\"" + wunschLink(m) + "\">Wunschzettel</a>" : "") + "</p></div>";
  }

  /* Filter je Kette */
  var kettenBox = box.querySelector("[data-mk-ketten]");
  Object.keys(K).forEach(function (k) {
    var n = D.m.filter(function (m) { return m[0] === k; }).length;
    if (!n) return;
    var b = document.createElement("button");
    b.type = "button"; b.setAttribute("aria-pressed", "true"); b.style.setProperty("--k", K[k][2]);
    b.innerHTML = K[k][0] + " <small>" + n.toLocaleString("de-DE") + "</small>";
    b.addEventListener("click", function () {
      aktiv[k] = !aktiv[k]; b.setAttribute("aria-pressed", String(aktiv[k]));
      kreise.forEach(function (c, i) { if (D.m[i][0] === k) { if (aktiv[k]) c.addTo(punkte); else punkte.removeLayer(c); } });
      if (punkt) suchen();
    });
    kettenBox.appendChild(b);
  });

  /* Straßen- und Satellitenbilder erst nach Klick */
  var ansicht = box.querySelector("[data-mk-ansicht]");
  box.querySelector("[data-mk-laden]").addEventListener("click", function () {
    schichten = {
      strassen: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© <a href=\"https://www.openstreetmap.org/copyright\" rel=\"noopener\">OpenStreetMap</a>-Mitwirkende" }),
      satellit: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Bilder © Esri, Maxar, Earthstar Geographics" })
    };
    schichten.strassen.addTo(karte);
    grenzenStil();
    box.querySelector("[data-mk-freigabe]").hidden = true;
    ansicht.hidden = false;
  });
  ansicht.querySelectorAll("[data-mk-schicht]").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("data-mk-schicht");
      Object.keys(schichten).forEach(function (s) { if (s === id) schichten[s].addTo(karte); else karte.removeLayer(schichten[s]); });
      ansicht.querySelectorAll("[data-mk-schicht]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    });
  });

  /* Suche */
  var punkt = null, ortName = "", treffer = L.layerGroup().addTo(karte);
  function suchen() {
    treffer.clearLayers(); liste.textContent = ""; wunsch.hidden = true;
    var auswahl = D.m.map(function (m) { return { m: m, d: km(punkt[0], punkt[1], m[5], m[6]) }; })
      .filter(function (t) { return aktiv[t.m[0]]; })
      .sort(function (a, b) { return a.d - b.d; }).slice(0, ANZAHL);
    var nah = auswahl.filter(function (t) { return t.d <= WEIT; });
    L.circleMarker(punkt, { radius: 11, weight: 4, color: "#fff", fillColor: "#f7a30a", fillOpacity: 1 }).addTo(treffer);
    var zeigen = nah.length ? nah : auswahl.slice(0, 3);
    zeigen.forEach(function (t, i) {
      L.marker([t.m[5], t.m[6]], { icon: L.divIcon({ className: "mk__nadel", html: "<span>" + (i + 1) + "</span>", iconSize: [30, 30], iconAnchor: [15, 15] }), keyboard: false })
        .bindPopup(blase(t.m)).addTo(treffer);
      var m = t.m, li = document.createElement("li");
      var route = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(m[1] + ", " + adresse(m));
      li.className = "mk__markt";
      li.innerHTML = "<span class=\"mk__nr\" aria-hidden=\"true\">" + (i + 1) + "</span>" +
        "<div><p class=\"mk__name\"><img class=\"mk__logo\" src=\"../../assets/img/" + K[m[0]][1] + "\" alt=\"" + K[m[0]][0] + "\"> " + esc(m[1] === K[m[0]][0] ? "" : m[1].replace(K[m[0]][0] + " ", "")) + "</p>" +
        "<p class=\"mk__adr\">" + esc(adresse(m)) + "</p>" +
        (NUR_MILCH[m[0]] ? "<p class=\"mk__hinweis\">Nur Vollmilch 3,7&nbsp;%</p>" : "") + "</div>" +
        "<div class=\"mk__rechts\"><b>" + t.d.toFixed(1).replace(".", ",") + "&nbsp;km</b>" +
        "<a href=\"" + route + "\" target=\"_blank\" rel=\"noopener\">Route<span class=\"nur-sr\"> zu " + esc(m[1]) + " (öffnet Google Maps in neuem Tab)</span></a>" +
        (WUNSCH[m[0]] ? "<a class=\"mk__zettel\" href=\"" + wunschLink(m) + "\">Wunschzettel<span class=\"nur-sr\"> für " + esc(m[1]) + "</span></a>" : "") + "</div>";
      liste.appendChild(li);
    });
    var b = L.latLngBounds([punkt].concat(zeigen.map(function (t) { return [t.m[5], t.m[6]]; })));
    karte.fitBounds(b.pad(0.25), { maxZoom: 14 });
    if (nah.length) {
      status.textContent = ohneWaise("Die " + nah.length + " nächsten Märkte " + ortName + ".");
    } else if (auswahl.length) {
      status.textContent = ohneWaise("Bis " + WEIT + " km " + ortName + " haben wir keinen Markt gefunden. Der nächste liegt " + auswahl[0].d.toFixed(0) + " km entfernt.");
      wunsch.hidden = false;
    } else {
      status.textContent = ohneWaise("Keine Märkte mit dieser Auswahl. Schaltet oben eine Kette dazu.");
    }
  }
  function setzen(lat, lon, name) { punkt = [lat, lon]; ortName = name; suchen(); }
  function leeren(text) {
    punkt = null; treffer.clearLayers(); liste.textContent = ""; karte.fitBounds(grenzen);
    status.textContent = ohneWaise(text); wunsch.hidden = false;
  }

  /* Für später: Zählung der eingegebenen Postleitzahlen. Hier wird nichts gesendet, nur ein Ereignis ausgelöst,
     an das sich ein Zähler hängen kann (vorher Datenschutzerklärung anpassen). */
  function melden(plz, land, gefunden) {
    try { document.dispatchEvent(new CustomEvent("hemme:plz", { detail: { plz: plz, land: land || "", gefunden: gefunden } })); } catch (e) { /* alte Browser */ }
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var plz = (feld.value || "").trim();
    if (!/^\d{5}$/.test(plz)) { status.textContent = ohneWaise("Bitte eine fünfstellige Postleitzahl eingeben, zum Beispiel 14467."); wunsch.hidden = true; feld.focus(); return; }
    var c = D.plz[plz];
    if (c) { setzen(c[0], c[1], "rund um " + plz + " (" + D.land[c[2]] + ")"); melden(plz, c[2], true); return; }
    var fremd = D.fremd[plz.slice(0, 3)];
    if (fremd) { leeren("In " + D.land[fremd] + " gibt es Hemme Milch noch nicht im Handel. Ihr findet uns in Berlin, Brandenburg, Mecklenburg-Vorpommern, Thüringen und Sachsen."); melden(plz, fremd, false); return; }
    leeren("Die Postleitzahl " + plz + " kennen wir nicht. Bitte prüft die Eingabe."); melden(plz, "", false);
  });

  var ortKnopf = box.querySelector("[data-mk-ort]");
  if (!("geolocation" in navigator)) ortKnopf.hidden = true;
  ortKnopf.addEventListener("click", function () {
    status.textContent = "Standort wird ermittelt …";
    navigator.geolocation.getCurrentPosition(function (p) { setzen(p.coords.latitude, p.coords.longitude, "bei euch"); },
      function () { status.textContent = ohneWaise("Der Standort ist nicht freigegeben. Gebt einfach eure Postleitzahl ein."); }, { timeout: 10000, maximumAge: 600000 });
  });

  box.querySelectorAll("[data-mk-plz]").forEach(function (b) {
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () {
      box.querySelectorAll("[data-mk-plz]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      feld.value = b.getAttribute("data-mk-plz");
      var c = D.plz[feld.value];
      if (c) setzen(c[0], c[1], "in " + b.textContent);
    });
  });

  /* Knöpfe aus der Regionen-Auswahl: Karte auf die Region stellen */
  document.querySelectorAll("[data-mk-region]").forEach(function (a) {
    a.addEventListener("click", function () {
      var laender = REGION[a.getAttribute("data-mk-region")], pts = D.m.filter(function (m) { return laender.indexOf(m[7]) > -1; });
      punkt = null; treffer.clearLayers(); liste.textContent = ""; wunsch.hidden = true;
      karte.fitBounds(L.latLngBounds(pts.map(function (m) { return [m[5], m[6]]; })).pad(0.05));
      status.textContent = ohneWaise(pts.length.toLocaleString("de-DE") + " Märkte in " + laender.map(function (l) { return D.land[l]; }).join(" und ") + ". Gebt eure Postleitzahl ein, dann zeigen wir die nächsten.");
    });
  });

  status.textContent = ohneWaise("Gebt eure Postleitzahl ein oder tippt auf einen Punkt in der Karte.");
  /* Die Karte steht in einem Abschnitt, der sich beim Laden noch in der Größe ändern kann */
  setTimeout(function () { karte.invalidateSize(); karte.fitBounds(grenzen); }, 300);
})();
