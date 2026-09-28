/* Entwurf B: Hero-Höhe, Sorten quer scrollen, Weg-Linie zeichnen */
(function () {
  "use strict";

  /* Hero exakt eine Bildschirmhöhe: Höhe von Vorschauleiste, Aktion und Kopf abziehen */
  var buehne = document.querySelector("[data-buehne]");
  function messen() {
    if (!buehne) return;
    var oben = buehne.getBoundingClientRect().top + window.scrollY;
    document.documentElement.style.setProperty("--ueber-hero", Math.round(oben) + "px");
  }
  messen();
  window.addEventListener("resize", messen);
  window.addEventListener("load", messen);

  var ruhig = matchMedia("(prefers-reduced-motion: reduce)");
  var wartet = false;
  function jeFrame(fn) {
    window.addEventListener("scroll", function () {
      if (wartet) return; wartet = true;
      requestAnimationFrame(function () { wartet = false; fn(); });
    }, { passive: true });
  }

  /* Sorten: Abschnitt bleibt stehen, bis alle Sorten quer durchgelaufen sind.
     Handy und reduzierte Bewegung: normales Wischband. */
  var sorten = document.querySelector("[data-sorten]");
  var reihe0 = document.querySelector("[data-reihe]");
  var gross = matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
  var sortenWeg = 0;
  function sortenMessen() {
    if (!sorten) return;
    sorten.classList.toggle("ist-gepinnt", gross.matches);
    reihe0.style.setProperty("--versatz", "0");
    if (!gross.matches) return;
    var rand = parseFloat(getComputedStyle(reihe0).paddingLeft) || 16;
    var rechts = reihe0.lastElementChild.getBoundingClientRect().right - reihe0.getBoundingClientRect().left;
    sortenWeg = Math.max(0, Math.ceil(rechts + rand - document.documentElement.clientWidth));
    var nachlauf = Math.round(window.innerHeight * 0.3);
    sorten.style.setProperty("--sorten-hoehe", (window.innerHeight + sortenWeg + nachlauf) + "px");
    sortenScrollen();
  }
  function sortenScrollen() {
    if (!sorten || !gross.matches) return;
    var r = sorten.getBoundingClientRect();
    var strecke = Math.max(1, r.height - window.innerHeight - Math.round(window.innerHeight * 0.3));
    var anteil = Math.min(1, Math.max(0, -r.top / strecke));
    reihe0.style.setProperty("--versatz", (anteil * sortenWeg).toFixed(1));
  }

  /* Vom Gras zur Milch: Linie zeichnet sich mit dem Scrollen */
  var weg = document.querySelector(".weg");
  var pfad = document.querySelector("[data-pfad]");
  function wegZeichnen() {
    if (!weg || !pfad) return;
    if (ruhig.matches) { pfad.style.setProperty("--weg", "1"); return; }
    var r = weg.getBoundingClientRect();
    var anteil = (window.innerHeight * 0.75 - r.top - 260) / Math.max(1, r.height - 360);
    pfad.style.setProperty("--weg", Math.min(1, Math.max(0, anteil)).toFixed(3));
  }

  jeFrame(function () { sortenScrollen(); wegZeichnen(); });
  window.addEventListener("resize", function () { sortenMessen(); wegZeichnen(); });
  window.addEventListener("load", function () { sortenMessen(); wegZeichnen(); });
  gross.addEventListener("change", sortenMessen);
  sortenMessen(); wegZeichnen();

  /* Sortenreihe mit der Maus ziehen (Touch und Trackpad scrollen ohnehin) */
  var reihe = document.querySelector("[data-reihe]");
  if (reihe) {
    var ziehen = null;
    reihe.addEventListener("pointerdown", function (ev) {
      if (ev.pointerType !== "mouse" || (sorten && sorten.classList.contains("ist-gepinnt"))) return;
      ziehen = { x: ev.clientX, l: reihe.scrollLeft, bewegt: false };
    });
    window.addEventListener("pointermove", function (ev) {
      if (!ziehen) return;
      var d = ev.clientX - ziehen.x;
      if (Math.abs(d) > 3) { ziehen.bewegt = true; reihe.classList.add("ist-gezogen"); }
      reihe.scrollLeft = ziehen.l - d;
    });
    window.addEventListener("pointerup", function () {
      ziehen = null;
      reihe.classList.remove("ist-gezogen");
    });
  }
})();
