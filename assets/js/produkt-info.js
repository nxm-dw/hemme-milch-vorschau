/* Produktseite: Klick auf eine Sorte öffnet ein Fenster mit kurzem Text und Zutaten */
(function () {
  "use strict";
  var d = document.querySelector("[data-produkt]");
  if (!d || typeof d.showModal !== "function") return;
  var bild = d.querySelector("[data-produkt-bild]"), name = d.querySelector("[data-produkt-name]");
  var detail = d.querySelector("[data-produkt-detail]"), text = d.querySelector("[data-produkt-beschreibung]");
  var ausloeser = null;
  document.querySelectorAll(".u-sorte__knopf").forEach(function (k) {
    k.addEventListener("click", function () {
      ausloeser = k;
      bild.src = k.getAttribute("data-bild");
      name.textContent = k.getAttribute("data-name");
      detail.textContent = k.getAttribute("data-detail");
      text.textContent = k.getAttribute("data-text");
      d.showModal();
    });
  });
  d.querySelector("[data-produkt-zu]").addEventListener("click", function () { d.close(); });
  /* Klick auf den abgedunkelten Hintergrund schließt */
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  d.addEventListener("close", function () { if (ausloeser) ausloeser.focus(); });
})();
