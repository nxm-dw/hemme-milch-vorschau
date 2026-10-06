/* Entwurf A: Sortiment-Umschalter, Historien-Band, Wertschöpfungs-Linie, Logo-Laufband */
(function () {
  "use strict";

  /* Sortiment: Für zuhause / Für Gastro & Handel */
  /* Tabs nach ARIA-Muster: Klick oder Pfeiltasten, nur der aktive Tab ist per Tab-Taste erreichbar */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.umschalter [role="tab"]'));
  function waehle(tab, fokus) {
    tabs.forEach(function (t) {
      var an = t === tab;
      t.setAttribute("aria-selected", String(an));
      t.tabIndex = an ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !an;
    });
    if (fokus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { waehle(tab, false); });
    tab.addEventListener("keydown", function (ev) {
      var ziel = null;
      if (ev.key === "ArrowRight") ziel = tabs[(i + 1) % tabs.length];
      if (ev.key === "ArrowLeft") ziel = tabs[(i - 1 + tabs.length) % tabs.length];
      if (ev.key === "Home") ziel = tabs[0];
      if (ev.key === "End") ziel = tabs[tabs.length - 1];
      if (ziel) { ev.preventDefault(); waehle(ziel, true); }
    });
  });

  /* Historien-Band: Auf großen Bildschirmen bleibt der Abschnitt stehen,
     das Band wandert quer und die Jahreszahl läuft von 1589 bis heute mit.
     Auf dem Handy und bei reduzierter Bewegung: normales Wischband. */
  var kette = document.querySelector(".kette");
  var band = document.querySelector("[data-band]");
  var zahl = document.querySelector("[data-uhr]");
  var uhr = document.querySelector(".uhr");
  if (!kette || !band) return;

  var gross = matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
  var weg = 0;

  function vermessen() {
    kette.classList.toggle("ist-gepinnt", gross.matches);
    if (!gross.matches) { band.style.removeProperty("--versatz"); setzeUhr(1); return; }
    /* Laufweg bis die letzte Karte mit demselben Rand rechts steht wie die erste links.
       scrollWidth taugt dafür nicht: Flex-Container zählen den rechten Innenabstand nicht mit. */
    band.style.setProperty("--versatz", "0");
    var rand = parseFloat(getComputedStyle(band).paddingLeft) || 16;
    var rechts = band.lastElementChild.getBoundingClientRect().right - band.getBoundingClientRect().left;
    weg = Math.max(0, Math.ceil(rechts + rand - document.documentElement.clientWidth));
    /* Etwas Nachlauf: Das Band bleibt kurz stehen, wenn die Uhr 24 zeigt, erst dann scrollt die Seite weiter */
    kette.style.setProperty("--kette-hoehe", (window.innerHeight + weg + nachlauf()) + "px");
    scrollen();
  }

  function nachlauf() { return Math.round(window.innerHeight * 0.35); }

  /* Jahreszahlen der Stationen; zwischen zwei Stationen wird gleichmäßig weitergezählt */
  var jahre = Array.prototype.map.call(band.querySelectorAll("[data-station-jahr]"), function (li) { return parseInt(li.getAttribute("data-station-jahr"), 10); });
  function setzeUhr(anteil) {
    uhr.style.setProperty("--lauf", anteil.toFixed(3));
    if (!jahre.length) return;
    var pos = anteil * (jahre.length - 1), i = Math.min(jahre.length - 2, Math.floor(pos)), t = pos - i;
    var jahr = jahre.length > 1 ? Math.round(jahre[i] + (jahre[i + 1] - jahre[i]) * t) : jahre[0];
    zahl.textContent = anteil >= .999 ? "Heute" : String(jahr);
  }

  function scrollen() {
    if (!gross.matches) return;
    var r = kette.getBoundingClientRect();
    var anteil = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight - nachlauf())));
    band.style.setProperty("--versatz", (anteil * weg).toFixed(1));
    setzeUhr(anteil);
  }

  var wartet = false;
  window.addEventListener("scroll", function () {
    if (wartet) return;
    wartet = true;
    requestAnimationFrame(function () { wartet = false; scrollen(); });
  }, { passive: true });
  window.addEventListener("resize", vermessen);
  gross.addEventListener("change", vermessen);
  window.addEventListener("load", vermessen);
  vermessen();

  /* Wertschöpfung: gepunktete Linie zeichnet sich mit dem Scrollen */
  var wegAbschnitt = document.querySelector(".weg");
  var pfad = document.querySelector("[data-pfad]");
  var ruhig = matchMedia("(prefers-reduced-motion: reduce)");
  function wegZeichnen() {
    if (!wegAbschnitt || !pfad) return;
    if (ruhig.matches) { pfad.style.setProperty("--weg", "1"); return; }
    var r = wegAbschnitt.getBoundingClientRect();
    var anteil = (window.innerHeight * 0.75 - r.top - 260) / Math.max(1, r.height - 360);
    pfad.style.setProperty("--weg", Math.min(1, Math.max(0, anteil)).toFixed(3));
  }
  window.addEventListener("scroll", function () { requestAnimationFrame(wegZeichnen); }, { passive: true });
  wegZeichnen();

  /* Logo-Laufband anhalten (WCAG 2.2.2) */
  document.querySelectorAll("[data-logos-pause]").forEach(function (knopf) {
    var box = knopf.closest("[data-logos]");
    var text = knopf.querySelector("[data-logos-text]");
    knopf.addEventListener("click", function () {
      var an = knopf.getAttribute("aria-pressed") !== "true";
      knopf.setAttribute("aria-pressed", String(an));
      box.classList.toggle("ist-pausiert", an);
      text.textContent = an ? "Logo-Laufband starten" : "Logo-Laufband anhalten";
    });
  });
})();

/* Händlersuche mit Beispieldaten: Märkte anzeigen oder, wenn keiner hinterlegt ist,
   den Wunschzettel für die Marktleitung. Ersetzt die einfache Suche aus gemeinsam.js. */
(function () {
  "use strict";
  var form = document.querySelector("[data-haendlersuche]");
  if (!form) return;
  var aus = form.querySelector("[data-haendler-ergebnis]");
  /* Beispiel: In diesen PLZ-Gebieten sind Märkte hinterlegt. Die echte Liste liefert Hemme. */
  var GEBIETE = ["10", "12", "13", "14", "15", "16"];
  var BEISPIEL = [
    { n: "Beispielmarkt EDEKA", km: "1,2" },
    { n: "Beispielmarkt REWE", km: "2,8" },
    { n: "Bioladen um die Ecke (Beispiel)", km: "3,5" }
  ];
  var ZETTEL = "Liebe Marktleitung,\n\nwir würden gern frische Hemme-Milchprodukte bei Ihnen kaufen: Milch im Milchbeutel, Joghurt, Fassbutter und Milchgetränke aus der Uckermark.\n\nKontakt für den Handel:\nHemme Milch GmbH & Co. KG\nHeideweg 4, 16278 Angermünde\nTelefon 03331 252525\n\nVielen Dank!";

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function treffer(plz) {
    var box = el("div", "maerkte");
    box.appendChild(el("p", "maerkte__kopf", "<b>" + BEISPIEL.length + " Märkte</b> rund um " + plz + " <span class=\"maerkte__hinweis\">Beispieldaten</span>"));
    var ul = el("ul", "maerkte__liste");
    BEISPIEL.forEach(function (m) { ul.appendChild(el("li", "", "<b>" + m.n + "</b><span>" + m.km + "&nbsp;km</span>")); });
    box.appendChild(ul);
    return box;
  }

  /* Wunschzettel im eigenen Fenster, damit das Suchergebnis kompakt bleibt */
  var dlg = document.createElement("dialog");
  dlg.className = "zettel-fenster";
  dlg.setAttribute("aria-label", "Wunschzettel für die Marktleitung");
  dlg.innerHTML =
    "<button type=\"button\" class=\"zettel-fenster__zu\" aria-label=\"Schließen\">×</button>" +
    "<figure class=\"zettel\">" +
      "<img class=\"zettel__logo\" src=\"../assets/img/marke/hemme-logo-oval-farbe.webp\" alt=\"Hemme Milch\" width=\"300\" height=\"167\">" +
      "<figcaption class=\"zettel__titel\">Wunschzettel für die&nbsp;Marktleitung</figcaption>" +
      "<p>Liebe Marktleitung,<br>wir würden gern frische Hemme-Milchprodukte bei Ihnen kaufen.</p>" +
      "<ul class=\"zettel__produkte\"><li><img src=\"../assets/img/marke/vollmilch-vs.webp\" alt=\"\">Milch im&nbsp;Milchbeutel</li><li><img src=\"../assets/img/produkte/beerenfest-200g.webp\" alt=\"\">Joghurt</li><li><img src=\"../assets/img/produkte/fassbutter.webp\" alt=\"\">Fassbutter</li><li><img src=\"../assets/img/produkte/schokomilch-230.webp\" alt=\"\">Milch&shy;getränke</li></ul>" +
      "<p class=\"zettel__kontakt\"><b>Kontakt für den Handel</b>Hemme Milch GmbH &amp; Co. KG · Heideweg 4 · 16278 Angermünde<br>Telefon <a href=\"tel:+493331252525\">03331&nbsp;252525</a></p>" +
    "</figure>" +
    "<div class=\"zettel-fenster__knoepfe\"><button type=\"button\" class=\"knopf\" data-zettel-drucken>Drucken</button><button type=\"button\" class=\"knopf knopf--rand\" data-zettel-teilen>Text kopieren oder&nbsp;teilen</button></div>";
  document.body.appendChild(dlg);
  dlg.querySelector(".zettel-fenster__zu").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (ev) { if (ev.target === dlg) dlg.close(); });
  dlg.querySelector("[data-zettel-drucken]").addEventListener("click", function () { document.body.classList.add("druck-zettel"); window.print(); setTimeout(function () { document.body.classList.remove("druck-zettel"); }, 500); });
  function teilen(knopf) {
    if (navigator.share) { navigator.share({ title: "Wunsch: Hemme Milch im Markt", text: ZETTEL }).catch(function () {}); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(ZETTEL) : Promise.reject()).then(function () { knopf.innerHTML = "Text&nbsp;kopiert ✓"; }, function () { knopf.textContent = "Kopieren nicht möglich"; });
  }
  dlg.querySelector("[data-zettel-teilen]").addEventListener("click", function (ev) { teilen(ev.currentTarget); });

  function keinMarkt(plz) {
    var box = el("div", "nachfrage");
    box.innerHTML =
      "<img class=\"nachfrage__bild\" src=\"../assets/img/marke/vollmilch-vs.webp\" alt=\"\">" +
      "<div class=\"nachfrage__text\">" +
        "<p class=\"nachfrage__marke\">Für " + plz + " noch kein Markt&nbsp;hinterlegt</p>" +
        "<h3>Noch kein Hemme in eurem&nbsp;Markt?</h3>" +
        "<p>Fragt gerne direkt vor Ort nach und gebt der Marktleitung unseren&nbsp;Wunschzettel.</p>" +
      "</div>";
    var knoepfe = el("div", "nachfrage__knoepfe");
    var zeigen = el("button", "knopf", "Wunschzettel&nbsp;öffnen"); zeigen.type = "button";
    zeigen.addEventListener("click", function () { dlg.showModal(); });
    var t = el("button", "knopf knopf--rand", "Teilen"); t.type = "button";
    t.addEventListener("click", function () { teilen(t); });
    knoepfe.appendChild(zeigen); knoepfe.appendChild(t);
    box.appendChild(knoepfe);
    box.appendChild(el("p", "nachfrage__hof", "Bis dahin gibt es alles im Milchladen auf dem Hof, Mi bis So 11 bis 18&nbsp;Uhr."));
    return box;
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault(); ev.stopImmediatePropagation();
    var plz = (form.querySelector("input").value || "").trim();
    aus.textContent = "";
    if (!/^\d{5}$/.test(plz)) { aus.appendChild(el("p", "plz__fehler", "Bitte eine fünfstellige Postleitzahl eingeben, zum Beispiel&nbsp;10115.")); return; }
    aus.appendChild(GEBIETE.indexOf(plz.slice(0, 2)) > -1 ? treffer(plz) : keinMarkt(plz));
  }, true);
})();

/* Wertschöpfung: Linie füllt sich, Milchbeutel wandert mit, erreichte Stationen leuchten auf */
(function () {
  "use strict";
  var reise = document.querySelector("[data-reise]");
  if (!reise) return;
  var etappen = Array.prototype.slice.call(reise.querySelectorAll(".etappe"));
  var ruhig = matchMedia("(prefers-reduced-motion: reduce)");
  function zeichnen() {
    if (ruhig.matches) { reise.style.setProperty("--fuell", "1"); etappen.forEach(function (e) { e.classList.add("ist-erreicht"); }); return; }
    var r = reise.getBoundingClientRect();
    var mitte = window.innerHeight * 0.55;
    var anteil = Math.min(1, Math.max(0, (mitte - r.top) / r.height));
    reise.style.setProperty("--fuell", anteil.toFixed(4));
    var tiefe = anteil * r.height;
    etappen.forEach(function (e) {
      var p = e.querySelector(".etappe__punkt").getBoundingClientRect();
      e.classList.toggle("ist-erreicht", tiefe >= p.top + p.height / 2 - r.top - 4);
    });
  }
  var wartet = false;
  window.addEventListener("scroll", function () { if (wartet) return; wartet = true; requestAnimationFrame(function () { wartet = false; zeichnen(); }); }, { passive: true });
  window.addEventListener("resize", zeichnen);
  zeichnen();
})();

/* Milchbeutel fährt auf der welligen Linie mit: Position = Punkt am Ende der gezeichneten Strecke */
(function () {
  "use strict";
  var weg = document.querySelector(".weg"), svg = document.querySelector("[data-pfad]"), beutel = document.querySelector(".weg__beutel");
  if (!weg || !svg || !beutel) return;
  var pfad = svg.querySelector(".weg__linie"), laenge = pfad.getTotalLength(), zeichner = svg.querySelector(".weg__zeichner");
  zeichner.removeAttribute("pathLength");
  // Die Maske zeichnet in Bildschirmlänge (non-scaling-stroke, gestreckte Grafik).
  // Darum den Anteil über die gestreckte Länge auf die Pfadlänge umrechnen.
  var N = 400, proben = [];
  for (var i = 0; i <= N; i++) proben.push(pfad.getPointAtLength(laenge * i / N));
  function punkt(anteil, sx, sy) {
    var summe = [0];
    for (var i = 1; i <= N; i++) summe.push(summe[i - 1] + Math.hypot((proben[i].x - proben[i - 1].x) * sx, (proben[i].y - proben[i - 1].y) * sy));
    var ziel = summe[N] * anteil, k = 1;
    while (k < N && summe[k] < ziel) k++;
    var t = (ziel - summe[k - 1]) / ((summe[k] - summe[k - 1]) || 1), a = proben[k - 1], b = proben[k];
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, dx: (b.x - a.x) * sx, dy: (b.y - a.y) * sy, gesamt: summe[N] };
  }
  function setzen() {
    var anteil = parseFloat(getComputedStyle(svg).getPropertyValue("--weg")) || 0;
    var sr = svg.getBoundingClientRect(), wr = weg.getBoundingClientRect();
    var sx = sr.width / 1000, sy = sr.height / 1400;
    var pt = punkt(anteil, sx, sy);
    var winkel = Math.atan2(pt.dy, pt.dx) * 180 / Math.PI;
    // Maske in Bildschirmpixeln setzen, damit Linienspitze und Beutel zusammenfallen
    zeichner.style.strokeDasharray = pt.gesamt.toFixed(1) + " " + pt.gesamt.toFixed(1);
    zeichner.style.strokeDashoffset = (pt.gesamt * (1 - anteil)).toFixed(1);
    weg.style.setProperty("--bx", (sr.left - wr.left + pt.x * sx).toFixed(1) + "px");
    weg.style.setProperty("--by", (sr.top - wr.top + pt.y * sy).toFixed(1) + "px");
    weg.style.setProperty("--br", (Math.max(-25, Math.min(25, winkel / 4))).toFixed(1) + "deg");
    weg.style.setProperty("--bo", anteil > 0.001 ? "1" : "0");
  }
  window.addEventListener("scroll", function () { requestAnimationFrame(function () { requestAnimationFrame(setzen); }); }, { passive: true });
  window.addEventListener("resize", setzen);
  setzen();
})();
