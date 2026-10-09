/* Unterseiten: Kontaktformular ist in der Vorschau noch nicht angebunden */
(function () {
  document.querySelectorAll("[data-formular-vorschau]").forEach(function (form) {
    var hinweis = form.querySelector("[data-formular-hinweis]");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (hinweis) hinweis.textContent = "Danke! In der Vorschau wird nichts verschickt, das Formular wird mit dem Livegang angebunden.";
    });
  });
})();
