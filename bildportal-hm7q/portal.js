/* Hemme Bildportal (Entwurf): Rollen, Suche, Filter, Detailansicht, Freigabe.
   Alles läuft im Browser mit Beispieldaten; Downloads und Freigaben sind simuliert. */
(function () {
  "use strict";
  var F = "../assets/img/foto/", P = "../assets/img/produkte/", M = "../assets/img/marke/";

  /* Bereiche und wer sie sieht */
  var BEREICHE = [
    { id: "marke", name: "Marke", text: "Logos, Brandbook, Siegel, Icons", bild: M + "label-eigen.webp", flaeche: "verlauf", rollen: ["marke", "team", "agentur", "handel"] },
    { id: "bildwelt", name: "Bildwelt", text: "Hof, Tiere, Team, Landschaft", bild: F + "kuhnase-s.webp", rollen: ["marke", "team", "agentur"] },
    { id: "produkte", name: "Produkte", text: "Packshots nach Kategorie", bild: P + "erdbeermilch.webp", flaeche: "hell", rollen: ["marke", "team", "agentur", "handel"] },
    { id: "kanaele", name: "Kanäle & Vorlagen", text: "Website, Social Media, Print", bild: F + "hofcafe-kuchen-s.webp", rollen: ["marke", "team", "agentur"] },
    { id: "presse", name: "Presse", text: "Pressefotos mit Bildnachweis", bild: F + "gunnar-hemme-portraet.webp", rollen: ["marke", "team", "agentur", "presse"] },
    { id: "intern", name: "Intern & Freigabe", text: "Entwürfe, Rohdaten, Shootings", bild: F + "molkerei-platzhalter-quadrat.webp", rollen: ["marke", "agentur"] }
  ];

  var ROLLEN = {
    marke: { gruss: "Willkommen zurück, ihr habt alles im Blick", hinweis: "Ihr seht alles und gebt neue Dateien frei." },
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
    { t: "Kuh ganz nah", b: "bildwelt", f: F + "kuh-nah.webp", k: ["Website", "Social Media", "Print"], s: "Kuh Kühe Tier nah Weide", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Kälbchen schaut in die Kamera", b: "bildwelt", f: F + "kalb-nase.webp", k: ["Website", "Social Media", "Print"], s: "Kalb Kälbchen Tier Kühe Stall", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Kälbchen an der Hand", b: "bildwelt", f: F + "kalb-hand.webp", k: ["Website", "Social Media"], s: "Kalb Kälbchen Hand Tier Kühe", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Kalb im Stall", b: "bildwelt", f: F + "kuh-stall.webp", k: ["Website", "Social Media"], s: "Kalb Stall Tier Kühe", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Kind und Kuh", b: "bildwelt", f: F + "kind-kuh-2.webp", k: ["Website", "Social Media"], s: "Kind Kuh Familie Hof erleben Kühe", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Kuhnase", b: "bildwelt", f: F + "kuhnase-2.webp", k: ["Website", "Social Media"], s: "Kuh Nase Tier Kühe lustig", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Team auf der Weide", b: "bildwelt", f: F + "weide-team.webp", k: ["Website", "Social Media", "Presse"], s: "Team Weide Menschen Hof Kühe", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Milchmann auf dem Hof", b: "bildwelt", f: F + "milchmann-hof.webp", k: ["Website", "Social Media", "Print"], s: "Milchmann Lieferung Auto Hof Vertrieb", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Hof aus der Luft", b: "bildwelt", f: F + "historie-2018-luftbild.webp", k: ["Website", "Print", "Presse"], s: "Luftbild Drohne Hof Molkerei Sprockhof", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Hofgarten", b: "bildwelt", f: F + "hofgarten.webp", k: ["Website", "Social Media"], s: "Hofgarten Garten Hof erleben", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Arbeitsplatz im Büro", b: "bildwelt", f: F + "arbeitsplatz.webp", k: ["Website", "Social Media"], s: "Büro Arbeitsplatz Team Milchtelefon Kontakt", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Hofcafé mit Torte und Milchkaffee", b: "kanaele", f: F + "hofcafe-torte.webp", k: ["Website", "Social Media", "Print"], s: "Hofcafé Torte Kuchen Kaffee Café Milchladen", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Maislabyrinth", b: "kanaele", f: F + "maislabyrinth-weg.webp", k: ["Website", "Social Media", "Print"], s: "Maislabyrinth Mais Hof erleben Familie Sommer", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Maislabyrinth, Schild", b: "kanaele", f: F + "maislabyrinth-schild.webp", k: ["Website", "Social Media"], s: "Maislabyrinth Schild Hof erleben", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Hüpfkissen im Spielbereich", b: "kanaele", f: F + "huepfkissen.webp", k: ["Website", "Social Media"], s: "Hüpfkissen Spielplatz Kinder Hof erleben", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Eventlocation", b: "kanaele", f: F + "eventlocation.webp", k: ["Website", "Social Media", "Print"], s: "Eventlocation Feier Raum Hochzeit", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Eventlocation, Raum", b: "kanaele", f: F + "event-raum.webp", k: ["Website", "Social Media", "Print"], s: "Eventlocation Raum Feier Hochzeit", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Eventlocation, Panorama", b: "kanaele", f: F + "event-panorama.webp", k: ["Website", "Social Media", "Print"], s: "Eventlocation Blick Uckermark Feier", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Eventlocation, Buffet", b: "kanaele", f: F + "event-buffet.webp", k: ["Website", "Social Media"], s: "Eventlocation Buffet Essen Feier", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Eventlocation, Deko", b: "kanaele", f: F + "event-deko.webp", k: ["Website", "Social Media"], s: "Eventlocation Deko Tisch Hochzeit", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Eventlocation, Gäste", b: "kanaele", f: F + "event-gaeste.webp", k: ["Website", "Social Media"], s: "Eventlocation Gäste Feier Menschen", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Eventlocation, Tanz", b: "kanaele", f: F + "event-tanz.webp", k: ["Website", "Social Media"], s: "Eventlocation Tanz Feier Party", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Eventlocation, Bühne", b: "kanaele", f: F + "event-buehne.webp", k: ["Website", "Social Media"], s: "Eventlocation Bühne Musik Feier", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Eisschmiede Pinnow", b: "kanaele", f: F + "eisschmiede-pinnow.webp", k: ["Website", "Social Media"], s: "Partner Eis Eisschmiede Pinnow Region", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Kinderstrandfest Wolletzsee", b: "kanaele", f: F + "kinderstrandfest-wolletzsee.webp", k: ["Website", "Social Media"], s: "Partner Fest Kinder Wolletzsee Region Engagement", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Uckermark gegen Leukämie", b: "kanaele", f: F + "uckermark-gegen-leukaemie.webp", k: ["Website", "Social Media"], s: "Partner Engagement Spende Region", typ: "Foto", fot: "Bildarchiv Hemme" },
    { t: "Gunnar Hemme, Hochformat", b: "presse", f: F + "gunnar-hemme-hoch.webp", k: ["Website", "Presse"], s: "Gunnar Hemme Gründer Person Presse Porträt", typ: "Pressefoto", fot: "Bildnachweis: Hemme Milch", person: true },
    { t: "Sandra Lichtenstein", b: "presse", f: F + "sandra-lichtenstein.webp", k: ["Website", "Presse"], s: "Sandra Lichtenstein Team Person Karriere Ansprechperson", typ: "Pressefoto", fot: "Bildnachweis: Hemme Milch", person: true },
    { t: "Historie: Hof 1589", b: "presse", f: F + "historie-1589.webp", k: ["Website", "Presse"], s: "Historie Geschichte 1589 Hof Familie", typ: "Pressefoto", fot: "Archiv Familie Hemme" },
    { t: "Historie: Baustart Molkerei 2004", b: "presse", f: F + "historie-2004-baustart.webp", k: ["Website", "Presse"], s: "Historie Geschichte Molkerei Bau 2004", typ: "Pressefoto", fot: "Archiv Familie Hemme" },
    { t: "Album: Winter 1999", b: "presse", f: F + "album-winter-1999.webp", k: ["Website", "Presse"], s: "Historie Album Winter Hof 1999", typ: "Pressefoto", fot: "Archiv Familie Hemme" },
    { t: "Album: Milchwagen", b: "presse", f: F + "album-milchwagen.webp", k: ["Website", "Presse"], s: "Historie Album Milchwagen Lieferung", typ: "Pressefoto", fot: "Archiv Familie Hemme" },
    { t: "Album: Team der Molkerei", b: "presse", f: F + "album-molkerei-team.webp", k: ["Website", "Presse"], s: "Historie Album Molkerei Team Menschen", typ: "Pressefoto", fot: "Archiv Familie Hemme" },
    { t: "Felder von oben (Platzhalter)", b: "intern", f: F + "feld-linien.webp", k: ["Website"], s: "Drohne Luft Feld Hof", typ: "Foto", fot: "Beispiel-Entwurf", status: "entwurf" },
    { t: "Molkerei, Abfüllung", b: "intern", f: F + "molkerei-platzhalter.webp", k: ["Website", "Social Media"], s: "Molkerei Abfüllung Milch Produktion", typ: "Foto", fot: "Stockbild, Lizenz prüfen", status: "entwurf", bis: "2026-12-31" },
    { t: "Tagesfrische Vollmilch 1 Liter", b: "produkte", f: M + "vollmilch-vs.webp", k: ["Website", "Social Media", "Print", "Presse"], s: "Vollmilch 3,7 Milch Milchbeutel Beutel Frischmilch Produkt Packshot", typ: "Packshot", fot: "Verpackungsagentur, aufgehellt 11/2026", frei: true },
    { t: "Fettarme Milch 1 Liter", b: "produkte", f: P + "teilrahmen-milch.webp", k: ["Website", "Social Media", "Print", "Presse"], s: "Fettarme Milch 1,8 Milchbeutel Beutel Frischmilch Produkt Packshot", typ: "Packshot", fot: "Verpackungsagentur, aufgehellt 11/2026", frei: true },
    { t: "Laktosefreie Vollmilch 1 Liter", b: "produkte", f: P + "milch-laktosefrei.webp", k: ["Website", "Social Media", "Print", "Presse"], s: "Laktosefrei Vollmilch Milchbeutel Beutel Frischmilch Produkt Packshot", typ: "Packshot", fot: "Verpackungsagentur, aufgehellt 11/2026", frei: true },
    { t: "Vanillemilch 600 ml", b: "produkte", f: P + "vanillemilch-600.webp", k: ["Website", "Social Media", "Print"], s: "Vanillemilch Milchgetränk Milchbeutel Beutel Produkt Packshot", typ: "Packshot", fot: "Verpackungsagentur, aufgehellt 11/2026", frei: true },
    { t: "Schokomilch 600 ml", b: "produkte", f: P + "schokomilch-600.webp", k: ["Website", "Social Media", "Print"], s: "Schokomilch Kakao Milchgetränk Milchbeutel Beutel Produkt Packshot", typ: "Packshot", fot: "Verpackungsagentur, aufgehellt 11/2026", frei: true },
    { t: "Erdbeermilch 600 ml", b: "produkte", f: P + "erdbeermilch.webp", k: ["Website", "Social Media", "Print"], s: "Erdbeermilch Milchgetränk Milchbeutel Beutel Saison Produkt Packshot", typ: "Packshot", fot: "Verpackungsagentur, aufgehellt 11/2026", frei: true },
    { t: "Eiskaffee 600 ml", b: "produkte", f: P + "eiskaffe-600.webp", k: ["Website", "Social Media", "Print"], s: "Eiskaffee Kaffee Milchgetränk Milchbeutel Beutel Saison Produkt Packshot", typ: "Packshot", fot: "Verpackungsagentur, aufgehellt 11/2026", frei: true },
    { t: "Vanillemilch to go 230 ml", b: "produkte", f: P + "vanillemilch-230.webp", k: ["Website", "Social Media", "Print"], s: "Vanillemilch Milchgetränk to go Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Schokomilch to go 230 ml", b: "produkte", f: P + "schokomilch-230.webp", k: ["Website", "Social Media", "Print"], s: "Schokomilch Kakao Milchgetränk to go Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Eiskaffee to go 230 ml", b: "produkte", f: P + "eiskaffe-230.webp", k: ["Website", "Social Media", "Print"], s: "Eiskaffee Kaffee Milchgetränk to go Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Erdbeermilch to go 230 ml", b: "produkte", f: P + "erdbeermilch-230.webp", k: ["Website", "Social Media", "Print"], s: "Erdbeermilch Milchgetränk to go Becher Saison Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "High Protein Kaffee 230 ml", b: "produkte", f: P + "protein-kaffee-230.webp", k: ["Website", "Social Media", "Print"], s: "Protein Kaffee Toffee Karamell Milchgetränk to go Becher neu Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Mango Lassi to go 230 ml", b: "produkte", f: P + "mango-lassi-230.webp", k: ["Website", "Social Media", "Print"], s: "Mango Lassi Joghurtgetränk to go Becher neu Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Naturjoghurt 400 g", b: "produkte", f: P + "naturjoghurt-3-7-prozent.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Naturjoghurt 3,7 Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Fettarmer Joghurt 400 g", b: "produkte", f: P + "naturjoghurt-1-8-prozent.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt fettarm 1,8 Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt mild im Beutel 600 g", b: "produkte", f: P + "naturjogurt-600.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt mild Milchbeutel Beutel Produkt Packshot", typ: "Packshot", fot: "Verpackungsagentur, aufgehellt 11/2026", frei: true },
    { t: "Joghurt Bircher-Müsli 200 g", b: "produkte", f: P + "birchler-muesli.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Bircher Müsli Frucht Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt Heidelbeere 200 g", b: "produkte", f: P + "jo-heidelbeere-200.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Heidelbeere Frucht Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt Stracciatella 200 g", b: "produkte", f: P + "jo-stracciatella-200.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Stracciatella Schoko Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt Erdbeere-Himbeere 200 g", b: "produkte", f: P + "erdbeer-joghurt-200gramm.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Erdbeere Himbeere Frucht Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt Kirsche 200 g", b: "produkte", f: P + "jo-kirsche-200.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Kirsche Frucht Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt Mango-Vanille 200 g", b: "produkte", f: P + "jo-mango-vanille-200.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Mango Vanille Frucht Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt Erdbeere-Himbeere 400 g", b: "produkte", f: P + "erdbeer-joghurt.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Erdbeere Himbeere Frucht Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt Heidelbeere 400 g", b: "produkte", f: P + "jo-heidelbeere-400.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Heidelbeere Frucht Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt Kirsche 400 g", b: "produkte", f: P + "jo-kirsche-400.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Kirsche Frucht Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt Vanille 400 g", b: "produkte", f: P + "jo-vanille-400.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Vanille Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Joghurt Pfirsich-Maracuja 400 g", b: "produkte", f: P + "pfirsich-maracuja-400.webp", k: ["Website", "Social Media", "Print"], s: "Joghurt Pfirsich Maracuja Frucht Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Fassbutter 200 g", b: "produkte", f: P + "fassbutter.webp", k: ["Website", "Social Media", "Print"], s: "Butter Fassbutter Sauerrahm Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Buttermilch 600 g", b: "produkte", f: P + "buttermilch-600.webp", k: ["Website", "Social Media", "Print"], s: "Buttermilch Milchbeutel Beutel Produkt Packshot", typ: "Packshot", fot: "Verpackungsagentur, aufgehellt 11/2026", frei: true },
    { t: "Magerquark 250 g", b: "produkte", f: P + "magerquark-250.webp", k: ["Website", "Social Media", "Print"], s: "Quark Magerquark Protein Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Kräuterquark 200 g", b: "produkte", f: P + "kraeuterquark-200.webp", k: ["Website", "Social Media", "Print"], s: "Quark Kräuterquark Kräuter Becher Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Gastro: Speisequark 250 g", b: "produkte", f: P + "speisequark-250.webp", k: ["Website", "Print"], s: "Gastro Großverbraucher Quark Speisequark Produkt Packshot", typ: "Packshot", fot: "Produktfotos", frei: true },
    { t: "Gastro: Milch 10 Liter im Schlauchbeutel", b: "produkte", f: P + "milch-10-liter-etikett.webp", k: ["Website", "Print"], s: "Gastro Großverbraucher 10 Liter Schlauchbeutel Milch Produkt Packshot", typ: "Packshot", fot: "Produktfoto mit Originaletikett, MHD geschwärzt", frei: true },
    { t: "Gastro: Fassbutter 12 kg", b: "produkte", f: P + "fassbutter-12kg-etikett.webp", k: ["Website", "Print"], s: "Gastro Großverbraucher Fassbutter Butter 12 kg Block Produkt Packshot", typ: "Packshot", fot: "Produktfoto mit Originaletikett, MHD geschwärzt", frei: true },
    { t: "Gastro: Fassbutter 4,5 kg im Eimer", b: "produkte", f: P + "eimer-fassbutter.webp", k: ["Website", "Print"], s: "Gastro Großverbraucher Fassbutter Butter Eimer Produkt Packshot", typ: "Packshot", fot: "Hemme Milch", frei: true },
    { t: "Gastro: Sahne 5 kg im Eimer", b: "produkte", f: P + "eimer-sahne.webp", k: ["Website", "Print"], s: "Gastro Großverbraucher Sahne Schlagsahne Eimer Produkt Packshot", typ: "Packshot", fot: "Hemme Milch", frei: true },
    { t: "Gastro: Joghurt mild 5 kg im Eimer", b: "produkte", f: P + "eimer-joghurt.webp", k: ["Website", "Print"], s: "Gastro Großverbraucher Joghurt Eimer Produkt Packshot", typ: "Packshot", fot: "Hemme Milch", frei: true },
    { t: "Gastro: Speisequark 5 kg im Eimer", b: "produkte", f: P + "eimer-quark.webp", k: ["Website", "Print"], s: "Gastro Großverbraucher Quark Speisequark Eimer Produkt Packshot", typ: "Packshot", fot: "Hemme Milch", frei: true },
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

  function darfSehen(b) { return b.rollen.indexOf(zustand.rolle) > -1; }
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
    BEREICHE.filter(darfSehen).forEach(function (b) {
      var offen = true;
      var li = el("li");
      var knopf = el("button", "bereich" + (zustand.bereich === b.id ? " ist-aktiv" : ""));
      knopf.type = "button";
      knopf.setAttribute("aria-pressed", String(zustand.bereich === b.id));
      var bild = el("span", "bereich__bild" + (b.flaeche ? " bereich__bild--" + b.flaeche : ""));
      var img = el("img"); img.src = b.bild; img.alt = ""; img.loading = "lazy"; bild.appendChild(img);
      var anz = D.filter(function (d) { return d.b === b.id && sichtbar(d); }).length;
      knopf.appendChild(bild);
      var txt = el("span", "bereich__text");
      txt.appendChild(el("b", "", b.name));
      txt.appendChild(el("span", "", b.text));
      knopf.appendChild(txt);
      knopf.appendChild(el("span", "bereich__zahl", anz + (anz === 1 ? " Datei" : " Dateien")));
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
      txt.appendChild(el("span", "nur-sr", ", Details öffnen"));
      knopf.appendChild(txt);
      knopf.addEventListener("click", function () { oeffne(d); });
      li.appendChild(knopf);
      /* Schnellaktion: direkt herunterladen, ohne Detailansicht */
      var schnell = el("a", "karte__laden"); schnell.href = d.f; schnell.setAttribute("download", "");
      schnell.setAttribute("aria-label", d.t + " herunterladen");
      schnell.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0l-5-5m5 5l5-5M5 20h14"/></svg>';
      schnell.addEventListener("click", function () { meldung("„" + d.t + "“ wird heruntergeladen"); });
      li.appendChild(schnell);
      ul.appendChild(li);
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
    $("[data-zahl-bereiche]").textContent = String(BEREICHE.filter(darfSehen).length);
    document.body.dataset.rolle = zustand.rolle;
    /* Abschnitte, die zur Rolle nicht passen, gar nicht erst zeigen */
    var zeigeLogos = ["marke", "team", "agentur", "handel"].indexOf(zustand.rolle) > -1;
    var zeigePresse = ["marke", "team", "agentur", "presse"].indexOf(zustand.rolle) > -1;
    $("#logos").hidden = !zeigeLogos; $("#presse").hidden = !zeigePresse;
    var zeigeStil = ["marke", "team", "agentur", "handel"].indexOf(zustand.rolle) > -1;
    $("#styleguide").hidden = !zeigeStil;
    document.querySelector('.kopf__nav a[href="#styleguide"]').hidden = !zeigeStil;
    document.querySelector('.kopf__nav a[href="#logos"]').hidden = !zeigeLogos;
    document.querySelector('.kopf__nav a[href="#presse"]').hidden = !zeigePresse;
    var kanaele = { handel: ["", "Website", "Social Media", "Print"], presse: ["", "Presse"] }[zustand.rolle];
    document.querySelectorAll("[data-kanal]").forEach(function (k) { k.hidden = !!kanaele && kanaele.indexOf(k.getAttribute("data-kanal")) < 0; });
    document.querySelectorAll("[data-schnell]").forEach(function (k) {
      var w = k.getAttribute("data-schnell");
      k.parentNode.hidden = zustand.rolle === "presse" ? ["Logo", "Milchbeutel", "Hofcafé", "Social Media"].indexOf(w) > -1 : (zustand.rolle === "handel" && ["Kühe", "Hofcafé"].indexOf(w) > -1);
    });
    zeichneBereiche(); zeichneRaster(); zeichneFreigabe();
  }

  /* Styleguide: Farbcodes kopieren */
  function kopieren(text, rueck) {
    var fertig = function () { meldung(rueck); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(fertig, function () { meldung("Kopieren nicht möglich: " + text); });
    else meldung(text);
  }
  document.querySelectorAll("[data-kopieren]").forEach(function (k) {
    k.addEventListener("click", function () { var c = k.getAttribute("data-kopieren"); kopieren(c, c + " kopiert"); });
  });
  var liste = $("[data-farbliste]");
  if (liste) liste.addEventListener("click", function () {
    var zeilen = [];
    document.querySelectorAll(".farbe").forEach(function (f) { zeilen.push(f.querySelector("b").textContent + ": " + f.querySelector("[data-kopieren]").getAttribute("data-kopieren")); });
    document.querySelectorAll(".kat").forEach(function (f) { zeilen.push("Kategorie " + f.querySelector(".kat__chip").textContent + ": " + f.querySelector("[data-kopieren]").getAttribute("data-kopieren")); });
    kopieren(zeilen.join("\n"), "Alle Farbcodes kopiert");
  });

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
