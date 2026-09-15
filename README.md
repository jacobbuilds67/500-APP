# 500 · Pointtavle

En dansksproget, lokal-first pointtavle til kortspillet 500. Appen understøtter 2–6 spillere, negative point, strafpoint, rettelser, automatisk vinderregistrering, historik og statistik for de seneste 30 dage samt all time.

## Teknologi

React 19, TypeScript, Vinext/Vite og en manuel service worker. Data gemmes versionsstyret i browserens `localStorage`; der er ingen server, konto eller synkronisering.

## Lokal start

Kræver Node.js 22.13+ og pnpm.

```bash
pnpm install
pnpm dev
```

Åbn den lokale adresse, som vises i terminalen. Et produktionsbuild laves med `pnpm build`. Kør kontrollerne med `pnpm typecheck`, `pnpm test` og `pnpm lint`.

## Installation på iPhone/iPad

Appen skal serveres via HTTPS (eller localhost under udvikling). Åbn den publicerede app i Safari, tryk på **Del**, og vælg **Føj til hjemmeskærm**. Efter første fulde indlæsning kan appen bruges offline.

## GitHub Pages

Læg projektet i et GitHub-repository, indstil den korrekte base/undermappe ved behov, byg appen, og publicér de statiske filer fra build-outputtet med en GitHub Actions-workflow. Test altid service workerens scope på den endelige repository-adresse. Den medfølgende manifest- og service-worker-konfiguration bruger relative adresser og er forberedt til en undermappe.

## Data og sikkerhedskopi

Data ligger kun i den aktuelle browser på den aktuelle enhed. Under **Data** kan alt eksporteres til JSON og senere importeres igen. Import valideres og kræver bekræftelse, før nuværende data erstattes. Sletning kræver to bekræftelser.

## Kendte begrænsninger

- Data synkroniseres ikke mellem enheder.
- Rydning af Safari-webstedsdata fjerner appens data, medmindre en JSON-sikkerhedskopi er lavet.
- iOS kan blokere lyd afhængigt af lydløs tilstand og browserens regler.
- GitHub Pages kræver en separat publiceringsworkflow og en kontrol af den valgte base-adresse.
