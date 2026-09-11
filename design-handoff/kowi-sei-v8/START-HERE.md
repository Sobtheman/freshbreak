# KOWI SEI Brand Book V8 — design handoff

Dropped here so the `Kowi landing page` session can read the design directly,
instead of going through the Claude Design share link (which was getting blocked
by a bot check).

Everything below is **reference material**, not app code. Nothing here is wired
into the Next.js app.

## What to read

| Path | What it is |
| --- | --- |
| `project/KOWI SEI Brand Book V8 - DECK.dc.html` | **The primary file.** 68 slides, 1920×1080, inline-styled `<section>` siblings. |
| `chats/chat1.md`, `chat2.md`, `chat3.md` | Full design conversation — where the intent lives. `chat3.md` is a short summary of where things landed. |
| `project/assets/` | Logo lockups (PNG + SVG) in every colorway. |
| `project/uploads/KOWI FINAL ART/` | Photography referenced by the deck (PNG). |
| `project/export-img/` | Same photography as JPG — smaller, better for web. |

## How the deck file is built

It depends on the Claude Design runtime, which is **not** something you want in
production:

- `project/support.js` — React-based `<x-dc>` template parser.
- `project/deck-stage.js` — web component: auto-scale to viewport, keyboard nav,
  thumbnail rail, speaker notes, print-to-PDF.

The slide content itself is plain inline-styled HTML and carries no dependency on
either. To extract a slide, take the `<section>` and its children as-is.

## Brand tokens (pulled from the deck)

```
Azul Marea      #2E5468
Verde Manglar   #3A5C42
Oro Sagrado     #C9A24B
Caliza          #F2ECDC
Negro           #000000
Dark Navy       #0A121A   (ceremonial support only — openers/covers)
```

Type: **Cinzel** (500/600) for display and numerals, **Marcellus** for body and
UI text. Both Google Fonts. Letter-spacing is heavy and deliberate — display
lockups run `0.32em`–`0.34em`, section eyebrows `0.1em`–`0.14em`.

## Deck structure — 8 chapters, 68 slides

| # | Chapter | Opens on page |
| --- | --- | --- |
| 01 | KOWI (manifiesto, creencia, personalidad, voz, vocabulario) | 03 |
| 02 | Logo (jerarquía, fondos, una tinta, reserva, usos incorrectos) | 13 |
| 03 | Color (paleta, jerarquía, combinaciones) | 23 |
| 04 | Tipografía (Cinzel, Marcellus, escala, estilos editoriales) | 29 |
| 05 | Fotografía (tierra, agua, sombra, vida + láminas) | 35 |
| 06 | Elementos (el filete, el marco, el campo) | 50 |
| 07 | Aplicaciones (sitio web, redes, señalización, papelería) | 55 |
| 08 | Movimiento (principios, cámara, sonido, digital) | 63 |

Section openers alternate Azul Marea / Verde Manglar.

**For a landing page, chapter 07 (`Aplicaciones · Sitio web`) is the slide that
matters most** — it's the web layout the brand book specifies. Chapters 03–05
give you the color, type and photography rules to hold to.

## Asset colorway naming

`m-` = master lockup, `c-`/`b-`/`a-` = supporting marks.

- `m-symbol-*` — symbol only
- `m-word-*` — wordmark only
- `m-kowi-*` / `m-sei-*` — split lockups
- Suffixes: `gold`, `white`, `black`, `ink`, `blueink`, `greenink`, `blue`, `green`
