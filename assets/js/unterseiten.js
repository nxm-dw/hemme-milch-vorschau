/* Unterseiten: Überschriften einpassen und Kontaktformular in der Vorschau */
(function () {
  /* Seitenkopf: Jede Zeile bleibt eine Zeile. Die Schrift wird so groß, dass die längste Zeile die Spalte füllt. */
  function einpassen() {
    document.querySelectorAll("[data-einpassen]").forEach(function (h) {
      var max = parseFloat(getComputedStyle(h).getPropertyValue("--max")) || 82;
      h.style.fontSize = max + "px";
      var breite = h.clientWidth, laengste = 0;
      h.querySelectorAll(".z").forEach(function (z) { laengste = Math.max(laengste, z.scrollWidth); });
      if (laengste > breite) h.style.fontSize = Math.max(26, Math.floor(max * breite / laengste * 0.98)) + "px";
    });
    /* Sicherung: Läuft eine Überschrift trotzdem über, wird sie schrittweise kleiner. */
    document.querySelectorAll("main h2, main h3, .u-blick__fakten dd").forEach(function (el) {
      el.style.fontSize = "";
      var g = parseFloat(getComputedStyle(el).fontSize), min = g * 0.7;
      while (el.scrollWidth > el.clientWidth + 1 && g > min) { g -= 1; el.style.fontSize = g + "px"; }
    });
  }
  var warte;
  function spaeter() { clearTimeout(warte); warte = setTimeout(einpassen, 80); }
  einpassen();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(einpassen);
  window.addEventListener("resize", spaeter);

  document.querySelectorAll("[data-formular-vorschau]").forEach(function (form) {
    var hinweis = form.querySelector("[data-formular-hinweis]");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (hinweis) hinweis.textContent = "Danke! In der Vorschau wird nichts verschickt, das Formular wird mit dem Livegang angebunden.";
    });
  });
})();
