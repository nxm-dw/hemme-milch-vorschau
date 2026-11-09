/* Unterseiten: Überschriften einpassen und Kontaktformular in der Vorschau */
(function () {
  /* Seitenkopf: Jede Zeile bleibt eine Zeile. Die Schrift wird so groß, dass die längste Zeile die Spalte füllt. */
  function einpassen() {
    document.querySelectorAll("[data-einpassen]").forEach(function (h) {
      var max = parseFloat(getComputedStyle(h).getPropertyValue("--max")) || 82;
      h.classList.remove("ist-eng");
      h.style.fontSize = max + "px";
      var breite = h.clientWidth, laengste = 0;
      h.querySelectorAll(".z").forEach(function (z) { laengste = Math.max(laengste, z.scrollWidth); });
      if (laengste > breite) {
        var ziel = Math.floor(max * breite / laengste * 0.98);
        h.style.fontSize = Math.max(30, ziel) + "px";
        /* Sehr schmal: Zeilen dürfen umbrechen, statt über den Rand zu laufen */
        if (ziel < 30) h.classList.add("ist-eng");
      }
    });
    /* Sicherung: Läuft eine Überschrift trotzdem über, wird sie schrittweise kleiner. */
    document.querySelectorAll("main h2, main h3, .u-blick__fakten dd").forEach(function (el) {
      el.style.fontSize = "";
      var g = parseFloat(getComputedStyle(el).fontSize), min = Math.min(g * 0.55, 16);
      while (el.scrollWidth > el.clientWidth + 1 && g > min) { g -= 1; el.style.fontSize = g + "px"; }
    });
  }
  var warte;
  function spaeter() { clearTimeout(warte); warte = setTimeout(einpassen, 80); }
  einpassen();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(einpassen);
  /* Erst wenn die Hausschrift wirklich geladen ist, stimmen die Breiten */
  if (document.fonts && document.fonts.load) document.fonts.load('400 40px "True North Dots"').then(einpassen, function () {});
  window.addEventListener("load", einpassen);
  window.addEventListener("resize", spaeter);

  document.querySelectorAll("[data-formular-vorschau]").forEach(function (form) {
    var hinweis = form.querySelector("[data-formular-hinweis]");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (hinweis) hinweis.textContent = "Danke! In der Vorschau wird nichts verschickt, das Formular wird mit dem Livegang angebunden.";
    });
  });
})();

/* Zwei-Klick: Externe Inhalte (KuhCam auf YouTube) laden erst nach Klick */
document.querySelectorAll("[data-zweiklick]").forEach(function (box) {
  var knopf = box.querySelector("[data-zweiklick-start]");
  if (!knopf) return;
  knopf.addEventListener("click", function () {
    var f = document.createElement("iframe");
    f.src = box.getAttribute("data-zweiklick");
    f.title = box.getAttribute("data-zweiklick-titel") || "Eingebettetes Video";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.referrerPolicy = "strict-origin-when-cross-origin";
    box.textContent = "";
    box.appendChild(f);
    f.focus();
  });
});

/* Philosophie: gepunktete Linie der Wertschöpfung genau zwischen den Bildern ziehen */
(function () {
  "use strict";
  var w = document.querySelector(".u-wert");
  if (!w) return;
  var svg = w.querySelector(".u-wert__linie"), pfad = svg.querySelector("path");
  function zeichnen() {
    var r = w.getBoundingClientRect(), b = w.querySelectorAll(".u-wert__bild"), d = "";
    svg.setAttribute("viewBox", "0 0 " + r.width + " " + r.height);
    for (var i = 0; i < b.length - 1; i++) {
      var a = b[i].getBoundingClientRect(), z = b[i + 1].getBoundingClientRect();
      var rechts = a.left < z.left;
      var x1 = (rechts ? a.right : a.left) - r.left, y1 = a.top + a.height / 2 - r.top;
      var x2 = (rechts ? z.left : z.right) - r.left, y2 = z.top + z.height / 2 - r.top;
      var mx = (x1 + x2) / 2;
      d += "M" + x1 + " " + y1 + " C " + mx + " " + y1 + ", " + mx + " " + y2 + ", " + x2 + " " + y2 + " ";
    }
    pfad.setAttribute("d", d);
  }
  zeichnen();
  window.addEventListener("resize", zeichnen);
  window.addEventListener("load", zeichnen);
})();
