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
