# 🌊 Focus App - Celkový Přehled Aplikace (App Overview)

Tento dokument slouží jako ultimátní přehled o tom, co aplikace **Focus App (Procrastination Helper)** je, co dělá, co obsahuje pod kapotou a jaké s ní máme záměry. 

---

## 🎯 Hlavní Záměr a Myšlenka
Aplikace má za cíl pomoci lidem dostat se do stavu hlubokého soustředění (**Flow State**) a efektivně bojovat s prokrastinací. Namísto běžných časovačů, které lze snadno ignorovat, Focus App aktivně blokuje rušivé elementy na úrovni operačního systému a využívá umělou inteligenci a gamifikaci k udržení motivace.

## 🛠️ Co aplikace reálně dělá?
1. **Focus Mode (Odpočet a Blokování):** Během nastaveného času soustředění běží na pozadí *Blocker*, který nemilosrdně ukončuje aplikace, které si uživatel zařadil na blacklist (např. hry, Discord, prohlížeče na soc. sítě).
2. **Pomodoro Mód:** Umožňuje střídat fáze práce (červená/fialová) a odpočinku (zelená), přičemž během pauzy aplikace dočasně přestane rušivé programy blokovat.
3. **Hardcore Mód (Anti-Cheat):** Pokud je aktivní, aplikaci nelze absolutně nijak vypnout (tlačítko Zrušit zmizí a pokusy o zavření okna jsou ignorovány).
4. **AI Verifikace (Gemini API):** Na začátku odpočtu uživatel zadá, co se učí (např. "React Hooks"). Aplikace na pozadí vygeneruje 3 otázky. Po skončení času uživatel odpoví, Gemini jeho odpovědi oznámkuje (0-10) a dá mu zpětnou vazbu.
5. **Gamifikace a XP:** Za splněné cíle a dobré výsledky v AI kvízech získá uživatel XP. Dosahuje nových levelů a sbírá achievementy.
6. **Social & Leaderboards:** Integrace s Firebase umožňuje ukládat XP na cloud a vidět žebříček s ostatními uživateli a přáteli.

## 💻 Technologický Stack (Co je pod kapotou)
- **Backend (Systémová úroveň):** `Electron.js` s nativním Node.js modulem pro blokování procesů. Vytvořeno primárně pro Linux (podpora pro X11/Wayland/Niri), s plány na rozšíření pro Windows (`taskkill`).
- **Frontend (UI/UX):** `React` + `Vite` s extrémním důrazem na prémiový design (Liquid Neon Glassmorphism).
- **Styling a Design:** Vanilla CSS s obrovským využitím `backdrop-filter` (glassmorphism), plynulé animace, interaktivní WebGL pozadí (`SoftAurora`), a paleta přecházející mezi fialovou, růžovou a neonově zelenou.
- **Cloud & AI:** `Google Gemini API` pro chytré kvízy a `Firebase` pro sdílení skóre a autentizaci uživatelů.

## 📂 Struktura Projektu (Co kde je)
- `/main/` - Kód Electron backendu (`main.js`, `blocker.js`, `geminiService.js`). Tady se děje to "nízkoúrovňové" systémové blokování.
- `/src/` - React aplikace. Všechno krásné UI, komponenty, dashboard, kvízy a propojení s Firebase.
- `.continue/` - Složka pravděpodobně související s vývojářským AI asistentem (Continue.dev) a jeho "skills".
- **Další Markdown soubory:** 
  - `context.md` (Architektura z ptačí perspektivy)
  - `goals.md` (Původní byznys/dev cíle)
  - `work.md` (Changelog a historie práce)
  - `PROJECT_STATUS.md` (Aktuální progress)
  - `caveman-skill-summary.md` (Instrukce pro AI agenta k redukci zbytečného textu a "fluffu")

## 🚀 Další Krok: Landing Page a Distribuce
Aplikace má připravené skripty na kompilaci do `.deb` i `AppImage` (`npm run package:linux`). 
Dalším hlavním krokem je **tvorba prezentačního promo webu (Landing Page)** s krásnými animacemi a call-to-action prvky pro stažení aplikace. Tento web bude sloužit k budoucí monetizaci a propagaci aplikace. Bude vyvíjen v oddělené složce.
