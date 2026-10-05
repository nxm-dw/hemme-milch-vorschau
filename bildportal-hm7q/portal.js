/* Hemme Bildportal (Entwurf): Rollen, Suche, Filter, Detailansicht, Freigabe.
   Alles läuft im Browser mit Beispieldaten; Downloads und Freigaben sind simuliert. */
(function () {
  "use strict";
  var F = "../assets/img/foto/", P = "../assets/img/produkte/", M = "../assets/img/marke/";

  /* Bereiche und wer sie sieht */
  var BEREICHE = [
    { id: "marke", name: "Marke", text: "Logos, Brandbook, Siegel, Icons", bild: M + "label-eigen.webp", flaeche: "verlauf", rollen: ["marke", "team", "agentur", "handel"] },
    { id: "bildwelt", name: "Bildwelt", text: "Hof, Tiere, Team, Landschaft", bild: F + "kuh-nah-s.webp", rollen: ["marke", "team", "agentur"] },
    { id: "produkte", name: "Produkte", text: "Packshots nach Kategorie", bild: P + "erdbeermilch.webp", flaeche: "hell", rollen: ["marke", "team", "agentur", "handel"] },
    { id: "kanaele", name: "Kanäle & Vorlagen", text: "Website, Social Media, Print", bild: F + "hofcafe-kuchen-s.webp", rollen: ["marke", "team", "agentur"] },
    { id: "presse", name: "Presse", text: "Pressefotos mit Bildnachweis", bild: F + "gunnar-hemme-portraet.webp", rollen: ["marke", "team", "agentur", "presse"] },
    { id: "intern", name: "Intern & Freigabe", text: "Entwürfe, Rohdaten, Shootings", bild: F + "molkerei-platzhalter-quadrat.webp", rollen: ["marke", "agentur"] }
  ];

  var ROLLEN = {
    marke: { gruss: "Willkommen zurück, ihr habt alles im Blick", hinweis: "Ihr seht alle sechs Bereiche und gebt neue Dateien frei." },
    team: { gruss: "Hallo Team Hemme", hinweis: "Ihr seht alles außer Entwürfen und Rohdaten." },
    agentur: { gruss: "Hallo NEXAS", hinweis: "Ihr seht alles und könnt Entwürfe zur Freigabe einreichen." },
    handel: { gruss: "Willkommen, liebe Handelspartner", hinweis: "Für euch: Logos und Produktbilder." },
    presse: { gruss: "Willkommen, liebe Redaktionen", hinweis: "Für euch: Pressefotos mit Bildnachweis." }
  };

  /* Beispieldateien. status: frei | entwurf. bis = Ablaufdatum */
  var D = [
    { t: "Kuh schaut in die Kamera", b: "bildwelt", f: F + "kuhnase.webp", k: ["Website", "Social Media", "Print", "Presse"], s: "Kühe Weide Tier Kuh Hof", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Kühe auf der Weide", b: "bildwelt", f: F + "kuehe-weide.webp", k: ["Website", "Social Media", "Print"], s: "Kühe Weide Herde Landschaft Kuh", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Kälbchen mit Zunge", b: "bildwelt", f: F + "kalb-zunge.webp", k: ["Website", "Social Media"], s: "Kalb Kälbchen Stall Tier Kühe", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Kuh und Huhn", b: "bildwelt", f: F + "kuh-huhn.webp", k: ["Social Media"], s: "Kuh Huhn Stall Tier lustig Kühe", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Kühe liegen auf der Weide", b: "bildwelt", f: F + "kuehe-liegen.webp", k: ["Website", "Print"], s: "Kühe Weide Ruhe Landschaft Kuh", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Rapsfeld in der Uckermark", b: "bildwelt", f: F + "raps.webp", k: ["Website", "Social Media", "Print"], s: "Feld Raps Landschaft Uckermark Futter", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Häckselernte", b: "bildwelt", f: F + "ernte.webp", k: ["Website", "Social Media"], s: "Ernte Traktor Futter Feld Landwirtschaft", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Hofcafé mit Käsekuchen", b: "kanaele", f: F + "hofcafe-kuchen.webp", k: ["Website", "Social Media"], s: "Hofcafé Kuchen Café Milchladen", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Hofcafé innen", b: "kanaele", f: F + "hofcafe.webp", k: ["Website", "Print"], s: "Hofcafé Café Eventlocation Raum", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Hemme-Lieferwagen", b: "bildwelt", f: F + "milchmann.webp", k: ["Website", "Social Media", "Presse"], s: "Milchmann Lieferung Auto Hof Vertrieb", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Gunnar Hemme auf der Weide", b: "presse", f: F + "gunnar-hemme-portraet.webp", k: ["Website", "Presse"], s: "Gunnar Hemme Gründer Team Person Presse Kühe", typ: "Pressefoto", fot: "Bildnachweis: Hemme Milch", person: true },
    { t: "Hof aus der Luft (Platzhalter)", b: "intern", f: F + "feld-linien.webp", k: ["Website"], s: "Drohne Luft Feld Hof", typ: "Foto", fot: "Beispiel-Entwurf", status: "entwurf" },
    { t: "Molkerei, Abfüllung", b: "intern", f: F + "molkerei-platzhalter.webp", k: ["Website", "Social Media"], s: "Molkerei Abfüllung Milch Produktion", typ: "Foto", fot: "Stockbild, Lizenz prüfen", status: "entwurf", bis: "2026-12-31" },
    { t: "Vollmilch im Milchbeutel", b: "produkte", f: M + "vollmilch-vs.webp", k: ["Website", "Social Media", "Print", "Presse"], s: "Vollmilch Milchbeutel Beutel Milch Produkt Verpackung", typ: "Packshot", fot: "Druckdatei 1000 ml", frei: true },
    { t: "Erdbeermilch 600 ml", b: "produkte", f: P + "erdbeermilch.webp", k: ["Website", "Social Media", "Print"], s: "Erdbeermilch Milchgetränk Milchbeutel Produkt", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Schokomilch to go", b: "produkte", f: P + "schokomilch-230.webp", k: ["Website", "Social Media", "Print"], s: "Schokomilch Milchgetränk to go Produkt", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt Beerenfest", b: "produkte", f: P + "beerenfest-200g.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Beerenfest Jubiläum Produkt", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Fassbutter 200 g", b: "produkte", f: P + "fassbutter.webp", k: ["Website", "Print"], s: "Butter Fassbutter Produkt", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Porridge Apfel-Zimt", b: "produkte", f: P + "porridge-vegan.webp", k: ["Website", "Social Media"], s: "Porridge vegan Dessert Produkt Aktion", typ: "Packshot", fot: "Produktfotos", frei: true, bis: "2026-10-31" },
    { t: "Logo oval, Farbe", b: "marke", f: M + "hemme-logo-oval-farbe.webp", k: ["Website", "Social Media", "Print", "Presse"], s: "Logo Oval Kuh Marke", typ: "Logo", fot: "Brandbook 2026", frei: true, logo: true },
    { t: "Wortmarke weiß", b: "marke", f: M + "hemme-milch-weiss-nebeneinander.webp", k: ["Website", "Social Media", "Print"], s: "Logo Wortmarke weiß Marke", typ: "Logo", fot: "Brandbook 2026", frei: true, logo: true, dunkel: true },
    { t: "Siegel Eigenes Futter", b: "marke", f: M + "label-eigen.webp", k: ["Website", "Social Media", "Print", "Presse"], s: "Siegel Label Herz Marke eigen", typ: "Siegel", fot: "Brandbook 2026", frei: true, logo: true },
    { t: "Slogan mit Herz", b: "marke", f: M + "slogan-mit-herz-weiss.webp", k: ["Website", "Social Media", "Print"], s: "Slogan Herz Frisch vom Hof Marke", typ: "Slogan", fot: "Brandbook 2026", frei: true, logo: true, dunkel: true },
    { t: "Icon Einfach aufreißen", b: "marke", f: M + "icon-aufreissen-blau.webp", k: ["Website", "Print"], s: "Icon Milchbeutel Beutel aufreißen", typ: "Icon", fot: "Brandbook 2026", frei: true, logo: true },
    { t: "Aquarell-Wiese", b: "kanaele", f: M + "wiese.webp", k: ["Website", "Social Media", "Print"], s: "Wiese Aquarell Hintergrund Landschaft Gestaltung", typ: "Gestaltungselement", fot: "Verpackung Vollmilch", frei: true }
  ];
  D.forEach(function (d, i) { d.id = "d" + i; d.status = d.status || "frei"; });

  var $ = function (s) { return document.querySelector(s); };
  var zustand = { rolle: "marke", suche: "", kanal: "", bereich: "" };
  var heute = new Date();

  function darfBereich(id) { return BEREICHE.filter(function (b) { return b.id === id; })[0].rollen.indexOf(zustand.rolle) > -1; }
  function sichtbar(d) {
    if (!darfBereich(d.b) && !(zustand.rolle === "handel" && d.frei) && !(zustand.rolle === "presse" && d.k.indexOf("Presse") > -1)) return false;
    if (d.status === "entwurf" && ["marke", "agentur"].indexOf(zustand.rolle) < 0) return false;
    if (zustand.rolle === "handel" && !(d.b === "marke" || d.b === "produkte")) return false;
    if (zustand.rolle === "presse" && d.k.indexOf("Presse") < 0) return false;
    return true;
  }
  function passt(d) {
    if (zustand.bereich && d.b !== zustand.bereich) return false;
    if (zustand.kanal && d.k.indexOf(zustand.kanal) < 0) return false;
    if (zustand.suche) {
      var q = zustand.suche.toLowerCase(), heu = (d.t + " " + d.s + " " + d.k.join(" ") + " " + d.typ).toLowerCase();
      if (q.split(/\s+/).some(function (w) { return heu.indexOf(w.replace(/e$/, "")) < 0; })) return false;
    }
    return true;
  }
  function tageBis(iso) { return Math.ceil((new Date(iso + "T23:59:59") - heute) / 864e5); }
  function datum(iso) { var t = iso.split("-"); return t[2] + "." + t[1] + "." + t[0]; }
  function name(id) { return BEREICHE.filter(function (b) { return b.id === id; })[0].name; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* Bereiche */
  function zeichneBereiche() {
    var ul = $("[data-bereiche]"); ul.textContent = "";
    BEREICHE.forEach(function (b) {
      var offen = b.rollen.indexOf(zustand.rolle) > -1 || (zustand.rolle === "presse" && b.id === "presse");
      var li = el("li");
      var knopf = el("button", "bereich" + (offen ? "" : " ist-gesperrt") + (zustand.bereich === b.id ? " ist-aktiv" : ""));
      knopf.type = "button"; knopf.disabled = !offen;
      knopf.setAttribute("aria-pressed", String(zustand.bereich === b.id));
      var bild = el("span", "bereich__bild" + (b.flaeche ? " bereich__bild--" + b.flaeche : ""));
      var img = el("img"); img.src = b.bild; img.alt = ""; img.loading = "lazy"; bild.appendChild(img);
      var anz = D.filter(function (d) { return d.b === b.id && sichtbar(d); }).length;
      knopf.appendChild(bild);
      var txt = el("span", "bereich__text");
      txt.appendChild(el("b", "", b.name));
      txt.appendChild(el("span", "", offen ? b.text : "Kein Zugriff in dieser Rolle"));
      knopf.appendChild(txt);
      knopf.appendChild(el("span", "bereich__zahl", offen ? String(anz) : "🔒"));
      knopf.addEventListener("click", function () {
        zustand.bereich = zustand.bereich === b.id ? "" : b.id;
        zeichneAlles(); $("#dateien").scrollIntoView({ behavior: "smooth" });
      });
      li.appendChild(knopf); ul.appendChild(li);
    });
  }

  /* Raster */
  function zeichneRaster() {
    var ul = $("[data-raster]"); ul.textContent = "";
    var liste = D.filter(function (d) { return sichtbar(d) && passt(d); });
    liste.forEach(function (d) {
      var li = el("li", "karte");
      var knopf = el("button", "karte__knopf"); knopf.type = "button";
      knopf.setAttribute("aria-label", d.t + ", Details öffnen");
      var bild = el("span", "karte__bild" + (d.logo ? " karte__bild--logo" : "") + (d.dunkel ? " karte__bild--dunkel" : ""));
      var img = el("img"); img.src = d.f.replace(/(foto\/[^.]+)\.webp$/, "$1-s.webp").replace("-s-s.webp", "-s.webp"); img.alt = ""; img.loading = "lazy";
      img.onerror = function () { img.onerror = null; img.src = d.f; };
      bild.appendChild(img);
      var marken = el("span", "karte__marken");
      if (d.status === "entwurf") marken.appendChild(el("span", "marke-chip marke-chip--entwurf", "Entwurf"));
      if (d.bis) { var t = tageBis(d.bis); marken.appendChild(el("span", "marke-chip marke-chip--ablauf", t < 0 ? "abgelaufen" : "noch " + t + " Tage")); }
      if (d.person) marken.appendChild(el("span", "marke-chip", "Person"));
      bild.appendChild(marken);
      knopf.appendChild(bild);
      var txt = el("span", "karte__text");
      txt.appendChild(el("b", "", d.t));
      txt.appendChild(el("span", "karte__meta", d.typ + " · " + name(d.b)));
      var k = el("span", "karte__kanaele");
      d.k.forEach(function (x) { k.appendChild(el("span", "kanal kanal--" + x.toLowerCase().replace(/\s/g, "-"), x)); });
      txt.appendChild(k);
      knopf.appendChild(txt);
      knopf.addEventListener("click", function () { oeffne(d); });
      li.appendChild(knopf); ul.appendChild(li);
    });
    $("[data-leer]").hidden = liste.length > 0;
    var titel = zustand.bereich ? name(zustand.bereich) : (zustand.suche ? "Suche: „" + zustand.suche + "“" : "Alle Dateien");
    $("[data-dateien-titel]").textContent = titel;
    $("[data-treffer]").textContent = liste.length + (liste.length === 1 ? " Datei" : " Dateien");
    $("[data-zuruecksetzen]").hidden = !(zustand.bereich || zustand.kanal || zustand.suche);
    document.querySelectorAll("[data-kanal]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-kanal") === zustand.kanal)); });
  }

  /* Freigabe-Liste */
  function zeichneFreigabe() {
    var offen = D.filter(function (d) { return d.status === "entwurf"; });
    var box = $("[data-freigabe]");
    box.hidden = !(zustand.rolle === "marke" || zustand.rolle === "agentur") || !offen.length;
    var ul = $("[data-freigabe-liste]"); ul.textContent = "";
    offen.forEach(function (d) {
      var li = el("li", "warte");
      var img = el("img"); img.src = d.f; img.alt = ""; li.appendChild(img);
      var t = el("div", "warte__text");
      t.appendChild(el("b", "", d.t));
      t.appendChild(el("span", "", "eingereicht von NEXAS · " + d.fot));
      li.appendChild(t);
      if (zustand.rolle === "marke") {
        var ja = el("button", "knopf knopf--klein", "Freigeben"); ja.type = "button";
        ja.addEventListener("click", function () { d.status = "frei"; meldung("„" + d.t + "“ ist freigegeben"); zeichneAlles(); });
        li.appendChild(ja);
      } else li.appendChild(el("span", "warte__status", "wartet auf Hemme"));
      ul.appendChild(li);
    });
    $("[data-zahl-offen]").textContent = String(offen.length);
  }

  /* Detail */
  var dlg = $("[data-detail]"), aktuell = null;
  function oeffne(d) {
    aktuell = d;
    var img = $("[data-detail-bild]"); img.src = d.f; img.alt = d.t;
    dlg.classList.toggle("ist-logo", !!d.logo); dlg.classList.toggle("ist-dunkel", !!d.dunkel);
    $("[data-detail-bereich]").textContent = name(d.b) + " · " + d.typ;
    $("[data-detail-titel]").textContent = d.t;
    var st = $("[data-detail-status]");
    st.textContent = d.status === "entwurf" ? "Entwurf: wartet auf Markenfreigabe" : (d.bis ? "Freigegeben bis " + datum(d.bis) : "Freigegeben, unbefristet");
    st.className = "detail__status" + (d.status === "entwurf" ? " ist-entwurf" : "");
    var ul = $("[data-detail-kanaele]"); ul.textContent = "";
    ["Website", "Social Media", "Print", "Presse"].forEach(function (k) {
      var li = el("li", d.k.indexOf(k) > -1 ? "ja" : "nein", k);
      li.setAttribute("aria-label", k + (d.k.indexOf(k) > -1 ? ": erlaubt" : ": nicht freigegeben"));
      ul.appendChild(li);
    });
    var dl = $("[data-detail-meta]"); dl.textContent = "";
    [["Quelle", d.fot], ["Schlagworte", d.s.split(" ").slice(0, 5).join(", ")], ["Personen", d.person ? "ja, Einwilligung wird mit hinterlegt" : "keine"]].forEach(function (p) {
      var w = el("div"); w.appendChild(el("dt", "", p[0])); w.appendChild(el("dd", "", p[1])); dl.appendChild(w);
    });
    var fw = $("[data-detail-formate]"); fw.textContent = "";
    var formate = d.logo ? [["SVG", "Vektor"], ["PNG", "transparent"], ["EPS", "Druck"]] : [["Original", "volle Größe"], ["Web", "WebP, 1800 px"], ["1:1", "Instagram"], ["9:16", "Story, Reel"]];
    formate.forEach(function (f) {
      var a = el("a", "format"); a.href = d.f; a.setAttribute("download", "");
      a.appendChild(el("b", "", f[0])); a.appendChild(el("span", "", f[1]));
      a.addEventListener("click", function () { meldung(f[0] + " wird heruntergeladen"); });
      fw.appendChild(a);
    });
    $("[data-detail-nachweis]").textContent = d.k.indexOf("Presse") > -1 ? "Bildnachweis beim Veröffentlichen: © Hemme Milch" : "";
    var fr = $("[data-detail-freigeben]");
    fr.hidden = !(d.status === "entwurf" && zustand.rolle === "marke");
    dlg.showModal();
  }
  $("[data-detail-zu]").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (ev) { if (ev.target === dlg) dlg.close(); });
  $("[data-detail-freigeben]").addEventListener("click", function () {
    if (!aktuell) return; aktuell.status = "frei"; dlg.close(); meldung("„" + aktuell.t + "“ ist freigegeben"); zeichneAlles();
  });

  /* Meldung */
  var toastZeit;
  function meldung(t) { var e = $("[data-toast]"); e.textContent = t; e.classList.add("ist-da"); clearTimeout(toastZeit); toastZeit = setTimeout(function () { e.classList.remove("ist-da"); }, 2600); }

  function zeichneAlles() {
    $("[data-gruss]").textContent = ROLLEN[zustand.rolle].gruss;
    $("[data-bereich-hinweis]").textContent = ROLLEN[zustand.rolle].hinweis;
    $("[data-zahl-dateien]").textContent = String(D.filter(sichtbar).length);
    $("[data-zahl-bereiche]").textContent = String(BEREICHE.filter(function (b) { return b.rollen.indexOf(zustand.rolle) > -1 || (zustand.rolle === "presse" && b.id === "presse"); }).length);
    document.body.dataset.rolle = zustand.rolle;
    zeichneBereiche(); zeichneRaster(); zeichneFreigabe();
  }

  /* Bedienung */
  $("[data-rolle]").addEventListener("change", function (ev) {
    zustand.rolle = ev.target.value; zustand.bereich = ""; zeichneAlles(); meldung("Ansicht: " + ev.target.selectedOptions[0].textContent);
  });
  $("[data-suche]").addEventListener("submit", function (ev) {
    ev.preventDefault(); zustand.suche = $("[data-suchfeld]").value.trim(); zustand.bereich = ""; zeichneAlles();
    $("#dateien").scrollIntoView({ behavior: "smooth" });
  });
  $("[data-suchfeld]").addEventListener("input", function (ev) { zustand.suche = ev.target.value.trim(); zeichneRaster(); });
  document.querySelectorAll("[data-schnell]").forEach(function (b) {
    b.addEventListener("click", function () {
      var w = b.getAttribute("data-schnell");
      if (w === "Social Media") { zustand.kanal = w; zustand.suche = ""; $("[data-suchfeld]").value = ""; }
      else { zustand.suche = w; $("[data-suchfeld]").value = w; }
      zustand.bereich = ""; zeichneAlles(); $("#dateien").scrollIntoView({ behavior: "smooth" });
    });
  });
  document.querySelectorAll("[data-kanal]").forEach(function (b) {
    b.addEventListener("click", function () { zustand.kanal = b.getAttribute("data-kanal"); zeichneRaster(); });
  });
  $("[data-zuruecksetzen]").addEventListener("click", function () {
    zustand = { rolle: zustand.rolle, suche: "", kanal: "", bereich: "" }; $("[data-suchfeld]").value = ""; zeichneAlles();
  });
  $("[data-presse-filter]").addEventListener("click", function () {
    zustand.kanal = "Presse"; zustand.bereich = ""; zustand.suche = ""; $("[data-suchfeld]").value = ""; zeichneAlles();
    $("#dateien").scrollIntoView({ behavior: "smooth" });
  });

  zeichneAlles();
})();
