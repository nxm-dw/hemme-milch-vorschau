/* Produktseite: Klick auf eine Sorte öffnet ein Fenster mit kurzem Text und Zutaten */
(function () {
  "use strict";
  var d = document.querySelector("[data-produkt]");
  if (!d || typeof d.showModal !== "function") return;
  var bild = d.querySelector("[data-produkt-bild]"), name = d.querySelector("[data-produkt-name]");
  var detail = d.querySelector("[data-produkt-detail]"), text = d.querySelector("[data-produkt-beschreibung]");
  var zutaten = d.querySelector("[data-produkt-zutaten]");
  var ausloeser = null;
  document.querySelectorAll(".u-sorte__knopf").forEach(function (k) {
    k.addEventListener("click", function () {
      ausloeser = k;
      bild.src = k.getAttribute("data-bild");
      name.textContent = k.getAttribute("data-name");
      detail.textContent = k.getAttribute("data-detail");
      text.textContent = k.getAttribute("data-text");
      /* Zutaten kommen aus dem eigenen Seitengenerator (Allergene fett), fehlt die Liste, steht der Hinweis */
      var z = k.getAttribute("data-zutaten");
      zutaten.classList.toggle("u-produkt__zutaten--folgt", !z);
      if (z) zutaten.innerHTML = z; else zutaten.textContent = "Die Zutatenliste ergänzen wir in\u00a0Kürze.";
      d.showModal();
    });
  });
  d.querySelector("[data-produkt-zu]").addEventListener("click", function () { d.close(); });
  /* Klick auf den abgedunkelten Hintergrund schließt */
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  d.addEventListener("close", function () { if (ausloeser) ausloeser.focus(); });
})();
