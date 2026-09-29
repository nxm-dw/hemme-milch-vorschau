/* Gemeinsame Bausteine beider Entwürfe
   1. Aktions-Banner mit Ablaufdatum (Kick-off: "wechselnder Hero-Banner")
   2. Einblenden beim Scrollen
   3. Mobiles Menü
   4. Händlersuche (Attrappe, bis Hemme die Verkaufsstellen liefert) */

(function () {
  "use strict";

  /* Letztes Wort an das vorletzte binden: kein Wort steht allein in der letzten Zeile */
  function ohneWaise(t) { return String(t).replace(/\s+(\S+)\s*$/, "\u00a0$1"); }

  /* ---------- 1. Aktions-Banner ----------
     Jede Aktion hat ein Start- und ein Enddatum. Ist keine Aktion aktiv,
     bleibt der Banner weg und die Startseite zeigt die Standardansicht.
     Im WordPress-Backend wird das später ein eigener Inhaltstyp.
     Zum Testen: ?heute=2026-12-01 an die Adresse hängen. */
  var AKTIONEN = [
    {
      von: "2026-09-01", bis: "2026-10-31",
      marke: "Neu im Kühlregal",
      text: "Porridge Apfel-Zimt, vegan und frisch aus Schmargendorf.",
      bild: "../assets/img/produkte/porridge-vegan.webp",
      link: "#produkte", linktext: "Jetzt entdecken"
    },
    {
      von: "2026-11-01", bis: "2026-12-23",
      marke: "Advent auf dem Hof",
      text: "Heiße Schokolade im Hofcafé, Mi bis So von 11 bis 18 Uhr.",
      bild: "../assets/img/produkte/schokomilch-600.webp",
      link: "#hof", linktext: "Zum Hofcafé"
    }
  ];

  function heute() {
    var p = new URLSearchParams(location.search).get("heute");
    var d = p ? new Date(p + "T12:00:00") : new Date();
    return isNaN(d) ? new Date() : d;
  }

  function aktiveAktion() {
    var jetzt = heute();
    for (var i = 0; i < AKTIONEN.length; i++) {
      var a = AKTIONEN[i];
      if (jetzt >= new Date(a.von + "T00:00:00") && jetzt <= new Date(a.bis + "T23:59:59")) return a;
    }
    return null;
  }

  function datumKurz(iso) {
    var t = iso.split("-");
    return t[2] + "." + t[1] + ".";
  }

  /* Ausgeblendete Aktion bleibt für diese Sitzung weg. Speicher kann fehlen (privates Fenster). */
  function gemerkt(schluessel) { try { return sessionStorage.getItem(schluessel) === "zu"; } catch (e) { return false; } }
  function merken(schluessel) { try { sessionStorage.setItem(schluessel, "zu"); } catch (e) {} }

  document.querySelectorAll("[data-aktion]").forEach(function (el) {
    var a = aktiveAktion();
    var schluessel = a ? "aktion-" + a.von + "-" + a.bis : "";
    if (!a || gemerkt(schluessel)) { el.remove(); return; }
    el.querySelector("[data-aktion-marke]").textContent = a.marke;
    el.querySelector("[data-aktion-text]").textContent = ohneWaise(a.text);
    var l = el.querySelector("[data-aktion-link]");
    l.href = a.link; l.querySelector("[data-aktion-linktext]").textContent = a.linktext;
    var bild = el.querySelector("[data-aktion-bild]");
    if (bild && a.bild) bild.src = a.bild; else if (bild) bild.remove();
    var b = el.querySelector("[data-aktion-bis]");
    if (b) b.textContent = "Nur bis " + datumKurz(a.bis);
    var zu = el.querySelector("[data-aktion-zu]");
    if (zu) zu.addEventListener("click", function () {
      merken(schluessel);
      el.remove();
      var ziel = document.querySelector(".kopf a, main a"); if (ziel) ziel.focus();
      window.dispatchEvent(new Event("resize")); // Hero-Höhe in Entwurf B neu messen
    });
    el.hidden = false;
  });

  /* ---------- 2. Einblenden ---------- */
  var ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kandidaten = document.querySelectorAll("[data-rein]");
  if (ruhig || !("IntersectionObserver" in window)) {
    kandidaten.forEach(function (el) { el.classList.add("ist-drin"); });
  } else {
    var io = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("ist-drin"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    kandidaten.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 3. Mobiles Menü ---------- */
  document.querySelectorAll("[data-menue-knopf]").forEach(function (knopf) {
    var ziel = document.getElementById(knopf.getAttribute("aria-controls"));
    var textZu = knopf.textContent.trim();
    var textAuf = knopf.getAttribute("data-text-auf");
    function setze(offen, fokusZurueck) {
      knopf.setAttribute("aria-expanded", String(offen));
      ziel.classList.toggle("ist-offen", offen);
      document.body.classList.toggle("menue-offen", offen);
      if (textAuf) knopf.textContent = offen ? textAuf : textZu;
      if (offen) { var erster = ziel.querySelector("a"); if (erster) setTimeout(function () { erster.focus(); }, 60); }
      else if (fokusZurueck) knopf.focus();
    }
    knopf.addEventListener("click", function () { setze(knopf.getAttribute("aria-expanded") !== "true", false); });
    ziel.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setze(false, false); }); });
    /* Escape schließt, Tab bleibt im offenen Menü */
    document.addEventListener("keydown", function (ev) {
      if (knopf.getAttribute("aria-expanded") !== "true") return;
      if (ev.key === "Escape") { setze(false, true); return; }
      if (ev.key !== "Tab") return;
      var ziele = [knopf].concat(Array.prototype.slice.call(ziel.querySelectorAll("a")));
      var i = ziele.indexOf(document.activeElement);
      if (ev.shiftKey && i <= 0) { ev.preventDefault(); ziele[ziele.length - 1].focus(); }
      else if (!ev.shiftKey && i === ziele.length - 1) { ev.preventDefault(); ziele[0].focus(); }
    });
  });

  /* Laufbänder anhalten (WCAG 2.2.2: Bewegung länger als 5 Sekunden muss stoppbar sein) */
  document.querySelectorAll("[data-band-pause]").forEach(function (knopf) {
    var baender = knopf.closest("[data-baender]");
    var text = knopf.querySelector("[data-band-pause-text]");
    knopf.addEventListener("click", function () {
      var an = knopf.getAttribute("aria-pressed") !== "true";
      knopf.setAttribute("aria-pressed", String(an));
      baender.classList.toggle("ist-pausiert", an);
      text.textContent = an ? "Laufband starten" : "Laufband anhalten";
    });
  });

  /* ---------- 4. Händlersuche (Attrappe) ---------- */
  document.querySelectorAll("[data-haendlersuche]").forEach(function (form) {
    var ausgabe = form.querySelector("[data-haendler-ergebnis]");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var plz = (form.querySelector("input").value || "").trim();
      if (!/^\d{5}$/.test(plz)) {
        ausgabe.textContent = ohneWaise("Bitte eine fünfstellige Postleitzahl eingeben, zum Beispiel 10115.");
        return;
      }
      var imGebiet = /^(1[0-6]|1[7-9]|03|04|14|15)/.test(plz);
      ausgabe.textContent = ohneWaise(imGebiet
        ? "Vorschau: Hier erscheinen die Märkte rund um " + plz + ", sobald Hemme die Liste der Verkaufsstellen geliefert hat."
        : "Vorschau: " + plz + " liegt außerhalb von Berlin und Brandenburg. Hier steht später der Hinweis auf den Milchladen und den Milchmann-Service.");
    });
  });

  /* ---------- 5. Öffnungsstatus Hofcafé ----------
     Mi bis So 11 bis 18 Uhr, gerechnet in deutscher Zeit. Feiertage und
     Sonderöffnungen kommen später aus dem Backend. */
  document.querySelectorAll("[data-oeffnung]").forEach(function (el) {
    var teile = {};
    new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date()).forEach(function (t) { teile[t.type] = t.value; });
    var tag = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"].indexOf(teile.weekday.replace(".", ""));
    var min = parseInt(teile.hour, 10) * 60 + parseInt(teile.minute, 10);
    var offenerTag = tag === 0 || tag >= 3;
    var text;
    if (offenerTag && min >= 660 && min < 1080) { text = "Jetzt geöffnet, bis 18 Uhr"; el.classList.add("ist-offen"); }
    else if (offenerTag && min < 660) text = "Heute ab 11 Uhr geöffnet";
    else if (tag === 1 || tag === 2 || (tag === 0 && min >= 1080)) text = "Wieder offen ab Mittwoch, 11 Uhr";
    else text = "Morgen ab 11 Uhr geöffnet";
    el.textContent = ohneWaise(text);
  });

  /* Kurzer Live-Status neben den Öffnungszeiten: geöffnet / geschlossen */
  document.querySelectorAll("[data-live-status]").forEach(function (el) {
    var teile = {};
    new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date()).forEach(function (t) { teile[t.type] = t.value; });
    var tag = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"].indexOf(teile.weekday.replace(".", ""));
    var min = parseInt(teile.hour, 10) * 60 + parseInt(teile.minute, 10);
    var offen = (tag === 0 || tag >= 3) && min >= 660 && min < 1080;
    el.textContent = offen ? "Jetzt geöffnet" : "Gerade geschlossen";
    el.classList.toggle("ist-offen", offen);
  });

  /* Jahreszahl im Fuß */
  document.querySelectorAll("[data-jahr]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
