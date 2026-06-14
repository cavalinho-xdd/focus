# Procrastination Helper — Cíle a Požadavky Projektu (goals.md)

Tento dokument shrnuje hlavní cíle, funkce a požadavky na novou, plnohodnotnou desktopovou aplikaci **Procrastination Helper**, která kompletně nahradí původní webový prototyp.

---

## 🎯 Hlavní Cíle Projektu

1. **Efektivní boj s prokrastinací**: Blokovat rozptylující aplikace na systémové úrovni během soustředění, aby se uživatel nemohl snadno nechat unést (např. spuštěním Steamu, her nebo sociálních sítí).
2. **AI-driven Verifikace Učení (Gemini)**: Namísto statických otázek použít AI k vygenerování 3 testovacích otázek přímo na téma, které uživatel studuje, a následně jeho odpovědi vyhodnotit (bodování, zpětná vazba).
3. **Gamifikace a Motivace**: Odměňovat uživatele za úspěšně zvládnuté bloky a správné odpovědi pomocí XP (zkušenostních bodů), level-upů a achievementů.
4. **Prémiový Vzhled a Zážitek**: Vytvořit moderní, responzivní a animovaný tmavý design (glassmorphismus, mikro-animace, curátované barvy), který uživatele zaujme na první pohled.
5. **Cross-platform Podpora**: Aplikace bude primárně vyvinuta a testována na **Linuxu** (včetně integrace pro Wayland/Niri), ale s architekturou připravenou pro snadný port na **Windows 10/11**.

---

## ⚙️ Klíčové Funkce (Requirements)

### 1. Focus Mode & Blocker
- **Whitelist / Blacklist**: Uživatel si zvolí aplikace, které jsou povolené (např. Obsidian, Notes, VS Code), nebo zakázané (např. Steam, Discord, Spotify).
- **Aktivní blokování**: Během aktivního odpočtu (Focus Mode) aplikace na pozadí hlídá otevřená okna/procesy a ty zakázané okamžitě ukončuje nebo zavírá jejich okna.
- **Niri IPC podpora**: Pro Linux s Wayland/Niri compositorem implementovat přímé zavírání oken přes IPC socket (bez nutnosti násilného zabíjení procesů).

### 2. AI Verifikační Kvíz (Gemini Integration)
- **Zadání tématu**: Před začátkem bloku uživatel zadá, co se učí/dělá (např. *"Reakce fotosyntézy"* nebo *"Základy async/await v Javascriptu"*).
- **Asynchronní generování**: Zatímco běží odpočet, aplikace na pozadí kontaktuje Gemini API a vygeneruje 3 otázky na míru zadanému tématu (formátované jako JSON).
- **Vyhodnocení**: Po skončení odpočtu uživatel na otázky odpoví. Gemini API odpovědi zanalyzuje, přiřadí skóre 0-10 a napíše konstruktivní zpětnou vazbu v češtině.

### 3. Gamifikace a Profily
- **XP a Levely**: Za každý úspěšný blok a za správné odpovědi (podle skóre z AI) získává uživatel XP. Po dosažení 100 XP se zvýší level.
- **Achievementy**: Automatické odemykání ocenění (např. *První krok*, *Týdenní série*, *Ranní ptáče* a tajné easter-eggy).
- **Historie cílů**: Kalendářový přehled (např. posledních 7 dní), zda byl cíl splněn či nikoliv.

### 4. Nastavení (Settings)
- Správa Gemini API klíče.
- Konfigurace seznamu zakázaných aplikací (s možností přidat/odebrat procesy).
- Resetování pokroku.
