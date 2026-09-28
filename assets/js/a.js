/* Entwurf A: Sortiment-Umschalter und 24-Stunden-Band */
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

  /* 24-Stunden-Band: Auf großen Bildschirmen bleibt der Abschnitt stehen,
     das Band wandert quer und die Uhr zählt von 0 bis 24 Stunden.
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

  function setzeUhr(anteil) {
    uhr.style.setProperty("--lauf", anteil.toFixed(3));
    zahl.textContent = Math.round(anteil * 24);
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
})();
