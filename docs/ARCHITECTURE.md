# Systemarkitektur

Den här guiden kompletterar README och beskriver hur pixelklienten är uppbyggd och hur modulerna samverkar.

## Huvudkomponenter

- **UI-lager** (`app/pages`, `app/components`)
  - `index.vue` – huvudsida med join-flöde, PixelStage, spelmoduler och PrizeDraw-overlay.
  - `debug.vue` – verktygssida för att spela upp demotimeline, köra makron och testa interaktiva moduler.
  - Komponenterna i `app/components/ui` kapslar quiz, skraplott och rytmspel och exponeras via tydliga events.
- **State & bussar**
  - `app/stores/appState.ts` håller bakgrundsfärg, prisoverlay och anslutningsstatus.
  - `useGameBus` erbjuder en lättviktig eventbuss för score/tickets så att spelmoduler kan dela status.
- **Orkestrering**
  - `app/plugins/ws.client.ts` hanterar WebSocket/MQTT-anslutningen, reconnect, heartbeat, tids- och showsynk samt eventdistribution.
  - `useClock` bygger på orkestreringsklienten för att exponera `showTime()`.
- **Adressmatchning**
  - `useAddressing` tolkar address expressions (`any`, `all`, `not`, `seat`, `zone`, `party`, `ticket`, `capability`).
  - Kontexter skapas efter join-flowet och används för att filtrera inkommande kommandon.
- **Rendering**
  - `useRenderer` skapar PixiJS-applikationen (med Canvas2D-fallback) och ansvarar för sprites/textnoder.
  - `useAssets` laddar texturer enligt scenmanifester och delar dem med renderern.
  - `PixelStage.client.vue` monterar renderern på en canvas i UI:t.
- **Timeline & makron**
  - `useSequencer` streamar timeline-tracks, interpolerar värden och dispatchar sprite/text-uppdateringar och makroevents.
  - `useMacros` håller färdiga animationer/effects (pulseColor, shake, orbit, flash, typewriterText) som anropas från timeline eller UI.
- **PWA & telemetri**
  - `app/plugins/pwa.client.ts` registrerar service worker, mäter fps och skickar beacons (fps, rtt, offset, dropped frames).
  - `public/sw.js` cachelagrar manifest och assets för offline-stöd.

## Flöden

1. Klienten ansluter mot `WS_URL` och skickar join-data från `index.vue` när användaren ansluter.
2. Orkestreringshändelser anländer -> `useAddressing` avgör om de gäller den här klienten.
3. `sceneLoad` laddar assets via `useRenderer` + `useAssets`.
4. `sequencePlay` startar en timeline i `useSequencer`. Den uppdaterar bakgrunder/sprites och triggar makron.
5. UI-komponenterna interagerar med `useGameBus` och `useWs` för att rapportera svar, tickets och score.
6. Telemetri skickas automatiskt var 5:e sekund och service workern håller viktiga resurser cachelagrade.

## Konfiguration

- Miljövariabler sätts via `.env` (`WS_URL`, `SHOW_ID`).
- `nuxt.config.ts` aktiverar Nuxt UI, Pinia, PWA-manifestet och ställer in Vite med global `__DEV__`-flagga.
- Testmiljö (`vitest.config.ts`) använder jsdom och alias `~` för att hitta projektfiler.

## Vidare läsning

- [PixiJS 8 dokumentation](https://pixijs.download/release/docs/index.html)
- [Nuxt UI](https://ui.nuxt.com/)
- [MQTT.js](https://github.com/mqttjs/MQTT.js)
