### Abschlussaufgabe

**Aufgabenstellung SoSe 2017****- La Vuelta a Espana**  

- WebGIS bauen - Eventplaner (z.B. [Vuelta de Espana 2017](http://www.lavuelta.com/la-vuelta/2017/us/overall-route.html)) 

- Manuelle Digitalisierung von Objekten (z.B. Parkplätze, Zuschauerplätze) 
    - ~~notwendige Eigenschaften definieren (Name, Preis, Kapazität)~~

- Manuelles Hinzufügen von Etappen  
    - Eine Etappe hat einen Name, einen Start und ein Ziel, Termine (Anfangsdatum, Enddatum), Links zu Bildern, Webseite.... 
    - Hochladen von Fotos ermöglichen (für Start und Ziel) 
    - Möglichkeit, Bilder und Beschreibungen als Marker ‘entlang der Strecke’ hinzuzufügen 

- Zur jeder Etappe soll ein Layer erstellt werden 
- Import Funktionalität 
    - Hochladen von einzelnen Objekten oder ganzen Etappen aus geoJSON-Datei 
    - Textfeld-Import von GeoJSON Objekten 
    - Fehlerüberprüfung 

- Von
 jedem Zuschauerplatz, Start und Ziel soll auf Knopfdruck jeweils 
automatisch eine Navigation zum nächstgelegenen Parkplatz erstellt und 
eingefügt werden. 
    - Der Navigations-Pfad soll automatisch entfernt werden, wenn der User ein anderes Objekt oder Event “anwählt” 
    - Minimalanforderung: Auto-Navigation 
    - multi-modaler Verkehr (z.B. Bus, Fahrrad, zu Fuß) 

- Speichern von Objekten und Etappen in eigener MongoDB (ggf. mit maximaler Auflösung - node.js plugin) 
    - Laden soll wieder möglich sein  
    - Strecken suchen nach Datum/Nummer, Start und Ziel, etvl. Name 
    - Einrichten von Permalinks zu allen Objekten 
    - Strecken bearbeiten ggf wieder löschen 

- Zu
 jedem Veranstaltungsort soll automatisch der erste Absatz des 
dazugehörigen Wikipedia-Artikels eingebunden werden (wenn vorhanden). 
- Suche  
    - ~~nach Etappen (nach Start, Ziel und Name)~~
    - ~~nach Terminen~~
    - nach Parkplätzen für eine Etappe nach Kapazität. 

- Sinnvolles Logging von Funktionen 
- Referenzieren eines jeden Objektes möglich sein (Permalink) 
- Webseite soll eine Startseite und ein Impressum haben, für die geforderten Funktionen dürfen mehr als eine Seite erstellt werden 
- Responsive WebDesign 
    - Karte soll auch auf dem Smartphone gut bedienbar sein 

- Mindestens 5 Sinnvolle TestUnits mit Mocha.js 
  

Fragen MÜSSEN im Forum gestellt werden
