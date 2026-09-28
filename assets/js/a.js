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

  /* WOW-Effekt im Hero: Der Beutel-Rahmen wächst beim Scrollen zum Vollbild der Weide */
  (function () {
    var held = document.querySelector("[data-held]");
    if (!held) return;
    var klebt = held.querySelector(".held__klebt");
    var rahmen = held.querySelector(".held__foto");
    var bedingung = matchMedia("(min-width: 1001px) and (prefers-reduced-motion: no-preference)");
    var r = null;
    function messen() {
      held.classList.toggle("ist-buehne", bedingung.matches);
      if (!bedingung.matches) { held.style.removeProperty("--clip"); return; }
      var k = klebt.getBoundingClientRect(), f = rahmen.getBoundingClientRect();
      r = { t: f.top - k.top, l: f.left - k.left, rt: k.right - f.right, b: k.bottom - f.bottom, w: f.width, h: f.height };
      zeichnen();
    }
    function zeichnen() {
      if (!bedingung.matches || !r) return;
      var box = held.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -box.top / Math.max(1, box.height - window.innerHeight)));
      var e = 1 - Math.pow(1 - Math.min(1, p / .85), 3); // weich auslaufen, ab 85 % steht das Vollbild
      var z = 1 - e;
      var rx = .46 * r.w * z, ry = .26 * r.h * z, ru = 28 * z;
      held.style.setProperty("--clip", "inset(" + (r.t * z).toFixed(1) + "px " + (r.rt * z).toFixed(1) + "px " + (r.b * z).toFixed(1) + "px " + (r.l * z).toFixed(1) + "px round " +
        rx.toFixed(1) + "px " + rx.toFixed(1) + "px " + ru.toFixed(1) + "px " + ru.toFixed(1) + "px / " + ry.toFixed(1) + "px " + ry.toFixed(1) + "px " + ru.toFixed(1) + "px " + ru.toFixed(1) + "px)");
      held.style.setProperty("--zoom", (1.12 - .12 * e).toFixed(4));
      held.style.setProperty("--p", p.toFixed(3));
    }
    var wartetH = false;
    window.addEventListener("scroll", function () {
      if (wartetH) return; wartetH = true;
      requestAnimationFrame(function () { wartetH = false; zeichnen(); });
    }, { passive: true });
    window.addEventListener("resize", messen);
    window.addEventListener("load", messen);
    bedingung.addEventListener("change", messen);
    messen();
  })();

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
