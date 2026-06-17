# Integrarea dicționarului de vocabular (12.260 cuvinte) — Design

**Data:** 2026-06-17
**Status:** Aprobat pentru planificare

## Context

Aplicația „DerDieDas" predă germana vorbitorilor de română. Calea de învățare are 25 de
unități, dar conținutul real e minim: `src/data/words.ts` conține ~28 de cuvinte hardcodate,
iar majoritatea nodurilor din `src/data/path.ts` sunt placeholdere goale (`items: []`).

Utilizatorul a furnizat `enriched_vocab_full.json` — **12.260 de cuvinte germane ordonate după
frecvență**, fiecare cu:
- traduceri academice RO + EN (`academic_ro`, `academic_en`),
- parte de vorbire (`pos`), IPA (`ipa`),
- propoziții-exemplu simple și detaliate în DE/EN/RO (`simple_context`, `detailed_context`),
- tabele gramaticale: substantive cu declinare pe 4 cazuri × sg/pl (`grammar_noun`),
  verbe cu conjugare pe timpuri (`grammar_verb`).

**Compoziție:** 7.117 substantive, 2.458 verbe, 2.685 alte cuvinte.

## Obiectiv

Integrarea dicționarului în aplicație ca sursă reală de date și popularea căii de învățare,
înlocuind lista hardcodată. Aceasta este fundația pe care se vor sprijini funcții viitoare
(căutare/dicționar, antrenor de gramatică).

## Constrângeri & descoperiri cheie

1. **Mărimea datelor:** fișierul sursă are 21 MB. Aplicația e un site static (Vite + Vercel,
   localStorage + sync simplu). Importul direct în cod ar umfla bundle-ul și ar încetini
   pornirea pe mobil. → Datele complete se livrează din `public/` și se aduc lazy prin `fetch`.

2. **Lecția de tip `word` = jocul der/die/das** (`GenderChallenge`). Funcționează **doar pentru
   substantive cu articol valid**. Verbele/adverbele n-au gen, deci nu pot popula aceste lecții.

3. **Genul e murdar în date.** Din 7.117 substantive:
   - ~6.457 au `gender` ∈ {der, die, das} (curat),
   - ~427 au majuscule (Der/Die/Das) — normalizabile prin lowercase,
   - ~285 au gunoi în câmpul `gender` ("Nominativ:", "Sg:", "der/die"...) — genul corect se
     poate recupera din `grammar_noun.declension.singular.forms.nominative` (ex. „der Weg").
   - 6 intrări n-au `academic_ro`.

4. **Datele n-au categorii tematice.** Sunt ordonate după frecvență + `pos`, dar nu există un
   câmp care să spună „Hund e animal". Deci unitățile tematice existente (Animale, Mâncare) nu
   pot fi populate automat tematic — populare realistă = pe frecvență.

## Abordare aleasă

**Script de transformare la build (abordarea A).** Un script Node rulează o singură dată pe
desktop, normalizează/curăță datele și produce artefacte gata pentru aplicație. Separă „date
pentru lecții" (mic, în bundle) de „dicționar complet" (mare, lazy din `public/`). Normalizarea
se face o dată la build; runtime-ul rămâne rapid și determinist.

Respinse: (B) fetch + parsare la runtime — aruncă 21 MB + parsare pe fiecare telefon, fragil;
(C) hibrid minimal — variantă a lui A, dar A e mai curat ca separare.

## Design

### 1. Pipeline de normalizare — `scripts/build-vocab.mjs`

Script Node rulat manual (`node scripts/build-vocab.mjs`), NU în browser, NU în bundle.

**Intrare:** `data-source/enriched_vocab_full.json` (copiat în repo; fișierul brut de 21 MB e
`gitignore`-d — vezi „Git & artefacte").

**Pași:**
1. Citește și validează cele 12.260 de intrări.
2. Normalizează genul substantivelor în 3 trepte:
   - `gender` ∈ {der, die, das} → folosit direct;
   - „Der/Die/Das" → lowercase;
   - altfel → recuperare din `declension.singular.forms.nominative` (prefix „der/die/das ");
   - dacă nici așa → substantiv marcat *fără gen valid*: exclus din lecții, dar păstrat în
     dicționar.
3. Mapează articol → gen RO: der→Masculin, die→Feminin, das→Neutru (pentru câmpul `gender`
   cerut de tipul `Word`).
4. Curăță traducerea: folosește `academic_ro`; dacă lipsește → fallback pe `academic_en`;
   dacă tot lipsește → exclus din lecții (păstrat în dicționar).

**Ieșire (2 artefacte, ambele comise):**
- `public/vocab/dictionary.json` — toate cele ~12k intrări, curate, cu toate câmpurile bogate
  (IPA, exemple DE/EN/RO, gramatică completă). Lazy-load la runtime.
- `src/data/generated/lessonWords.ts` — doar substantivele cu gen valid, cu câmpuri minime
  (`id, german, article, translation, gender, rank`), ordonate după frecvență (rank crescător).
  Mic, intră în bundle. Generat ca `.ts` pentru verificare de tipuri la compilare.

**Raportare:** scriptul afișează câte substantive au ieșit utilizabile și câte/de ce au fost
excluse (vizibilitate).

### 2. Strat de date tipat + loader

**`src/data/vocab-types.ts`:**
- `LessonWord extends Word` (`id, german, article, translation, gender`) + `rank: number`,
  `ipa: string`. Compatibil 100% cu `GenderChallenge` și `LessonRunner` existente.
- `DictionaryEntry` — forma completă (word, rank, academic_en/ro, pos, ipa, simple_context,
  detailed_context, grammar_noun, grammar_verb).

**`src/data/dictionary.ts`:**
- `loadDictionary(): Promise<DictionaryEntry[]>` — `fetch('/vocab/dictionary.json')` cu cache în
  memorie (o singură aducere per sesiune).
- `getEntry(german: string): Promise<DictionaryEntry | undefined>` — lookup pentru funcții
  viitoare (search/detalii). Inclus acum fiindcă e parte din stratul de date; nu se mai expune UI.

### 3. Generarea căii de învățare — `src/data/path.ts`

Aplică decizia: **păstrăm unitățile 1-25 + extindem.**

- **Unitățile 1-25 rămân exact cum sunt** — titluri, teme, gramatică, ordine, cerințe de
  deblocare, și conținutul curat existent din unitățile de început. (Observație: unitățile 6-25
  folosesc `generateStandardNodes`, care nu produce noduri de tip `word`, deci nu au lecții de
  vocabular de populat. Nodurile goale rămân goale — sunt altă muncă.)
- **Unități noi auto-generate după Unitatea 25**: funcția `generateFrequencyUnits(startRank)`
  creează unități succesive din substantivele utilizabile rămase, în ordinea frecvenței.
  Fiecare unitate generată = 5 lecții × 4 cuvinte (tip `word`) + un nod `review` + un nod
  `trophy`, cu cerințe de deblocare înlănțuite (fiecare unitate cere trophy-ul precedentei).
  Consumă substantivele până la epuizare → acoperă toate cele ~6.9k substantive utilizabile.
- Id-urile nodurilor generate urmează convenția existentă (`u<N>_l<k>`, `u<N>_review`,
  `u<N>_t1`) cu N continuând după 25. Id-urile cuvintelor (`LessonWord.id`) sunt unice și nu se
  ciocnesc cu cele existente (1-28).

### 4. Cuvintele care nu-s substantive

Cele 2.458 de verbe + 2.685 de alte cuvinte:
- sunt **structurate complet în `dictionary.json`** (conjugări, exemple, IPA) — disponibile
  pentru funcții viitoare (search, antrenor de verbe).
- **NU** sunt plasate în lecții acum: niciun tip de lecție existent nu le consumă, iar un tip
  nou (ex. conjugare) e o funcție separată, la alegerea utilizatorului ulterior. (YAGNI.)

### 5. Git & artefacte

- `data-source/enriched_vocab_full.json` (21 MB brut) → `gitignore`-d. Scriptul îl citește local.
- `public/vocab/dictionary.json` → **comis** (se livrează pe Vercel la runtime).
- `src/data/generated/lessonWords.ts` → **comis** (intră în bundle, type-checked).
- README: secțiune scurtă despre cum se obține fișierul sursă și cum se rulează scriptul.

## Testare & verificare

- **Test unitar pentru normalizarea genului** (fixture mic): cele 3 trepte + cazul „irecuperabil
  → exclus". Plus mapare articol→gen RO.
- **Verificare de integritate** în script: numără utilizabile vs. excluse, cu motive.
- **Type-check** (`tsc`): `lessonWords.ts` malformat → build-ul aplicației pică.
- **Verificare id-uri**: unicitate și fără coliziune cu 1-28.
- **Smoke manual**: pornește aplicația, intră într-o unitate generată, confirmă că jocul
  der/die/das primește cuvintele corecte și pronunția (TTS) funcționează.

## Ce NU intră în scop (explicit)

- Tipuri noi de lecții (conjugare verbe, declinare cazuri, flashcard generic).
- UI de căutare/dicționar (deși stratul de date îl pregătește).
- Popularea nodurilor reading/listening/speaking/writing/adventure/chest.
- Recategorizarea tematică a unităților 1-25.
