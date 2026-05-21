# Netlight Brand Reference
Source: Visual Identity Guidelines v2.0 (2025)

---

## 1. Design Principles

These five principles form the foundation of every Netlight design decision:

| Principle | Description |
|---|---|
| **Precision through Simplicity** | Minimal, bold, tight layouts. Use colour blocks and emphasise key elements. Impactful, never cluttered. |
| **Distinctive Spaces** | Generous negative space, clear framing, embrace individuality. Elements breathe. |
| **Playful Professionalism** | Creative and lively, but balanced with competence and polish. Fun, not childish. |
| **Sophisticated Fusion** | Draws from print layouts. Polished, refined, editorial feel. |
| **Technology Infusion** | Edgy layouts, code visual language, tech-driven touch. |

---

## 2. Logo

### Primary Logo
- Combination of the **Boid icon** (triangular shape in three shades of purple) + **wordmark** ("netlight" lowercase)
- The Boid icon uses three shades of purple: Light Purple, Netlight Purple, Dark Purple
- Boid and wordmark can be used independently when context makes the brand clear
- Use for all corporate-heavy designs, digital and print

### Primary Logo — Stacked Variation
- Boid icon stacked above the wordmark
- Use for square/vertical layouts, digital environments (apps, social media, browsers)
- The standalone Boid is OK for internal systems

### Secondary Logo
- Simplified version, **single shade** (not three)
- Available in: purple, black, white
- Use for non-corporate/casual designs, printing with limited palette, embroidery
- First choice: purple version. White on dark backgrounds. Black on light backgrounds.

### Logo Don'ts
- Do NOT change colours outside of specified palette
- Do NOT place other logos or graphic elements too close
- Do NOT change direction of the Boid
- Do NOT stretch or compress proportions
- Do NOT apply effects (shadows, glows, etc.)
- Do NOT rotate or angle the logo
- Do NOT ignore contrast — always ensure logo is legible against its background

---

## 3. Colours

### Primary — Purple
The strongest visual attribute of the Netlight brand. Versatile — use on backgrounds, shapes, text.

| Name | Hex | Tailwind Token |
|---|---|---|
| Light Purple | `#C6C6FF` | `nl-purple-light` |
| **Netlight Purple** ← main | `#A29AFF` | `nl-purple` |
| Dark Purple | `#6664F1` | `nl-purple-dark` |

### Secondary — Yellow
Strong contrast against purple (opposite on colour wheel). Conveys energy, creativity, innovation.

| Name | Hex | Tailwind Token |
|---|---|---|
| Light Yellow | `#FFF4A4` | `nl-yellow-light` |
| **Yellow** ← main | `#FFF400` | `nl-yellow` |
| Dark Yellow | `#EFD500` | `nl-yellow-dark` |

### Neutrals
| Name | Hex | Tailwind Token | Usage |
|---|---|---|---|
| Black | `#000000` | `nl-black` | Text, backgrounds, high contrast, dark mode |
| White | `#FFFFFF` | `nl-white` | Backgrounds, clean layouts |
| Beige | `#FFF0E6` | `nl-beige` | Background only — never on text. Soft, corporate feel. Do not overuse. |

### Complementary (accent use only — not primary)
Use orange/pink first when more colour is needed, then blue/green.

| Name | Hex | Tailwind Token |
|---|---|---|
| Light Orange | `#FFD8BB` | `nl-orange-light` |
| Orange | `#FFDA70` | `nl-orange` |
| Dark Orange | `#FFB010` | `nl-orange-dark` |
| Light Pink | `#FF04FE` | `nl-pink-light` |
| Pink | `#FF99FF` | `nl-pink` |
| Dark Pink | `#E166D5` | `nl-pink-dark` |
| Light Blue | `#C2F9FF` | `nl-blue-light` |
| Blue | `#6CDBFF` | `nl-blue` |
| Dark Blue | `#00AADF` | `nl-blue-dark` |
| Light Green | `#CBFFC0` | `nl-green-light` |
| Green | `#77FFF8` | `nl-green` |
| Dark Green | `#32DF19` | `nl-green-dark` |

### Approved Colour Combinations
**Two-colour pairings:**
- Purple + Beige
- Purple + Black
- Purple + White
- Purple + Yellow
- Black + Yellow

**Three-colour:**
- Purple + Beige + Black
- Purple + White + Black
- Purple + Yellow + Black
- Purple + Yellow + Complementary

**Text on backgrounds (approved):**
| Background | Text colour |
|---|---|
| Black | Purple, White, Yellow, Orange, Pink, Green, Blue |
| White | Purple, Dark Purple, Black, Orange, Pink |
| Beige | Purple, Dark Purple, Black |
| Yellow | Purple, Dark Purple, Black |
| Light Purple | White, Dark Purple, Black |
| Purple | White, Yellow, Black |

### Gradients
Very limited use — special cases only. Never overuse.
- Always use more than two colours
- Direction: 45-degree angle or radial
- Aim to represent light reflection

---

## 4. Typography

### Font Stack
| Role | Font | Restriction |
|---|---|---|
| **Primary** | **Proxima Nova** | Use for all UI text — headings, body, labels, captions |
| Complementary | Utopia | Editorial/sophisticated contexts only. Brand-restricted — not for general UI. |
| Complementary | Video | Playful/tech contexts only. Brand-restricted — design team use only. |

### Proxima Nova — Weights Available
All weights loaded in this project via `@font-face` in `src/index.css`:

| Weight | Name | CSS value | Use for |
|---|---|---|---|
| 100 | Thin | `font-thin` | Decorative large display only |
| 300 | Light | `font-light` | Body text, captions |
| 400 | Regular | `font-normal` | Default body text |
| 500 | Medium | `font-medium` | Slightly emphasised UI text |
| 600 | SemiBold | `font-semibold` | Labels, buttons, UI elements |
| 700 | Bold | `font-bold` | Subheadings |
| 800 | ExtraBold | `font-extrabold` | Headings |
| 900 | Black | `font-black` | Hero text, large display headings |

### Typography Rules
- **Letter spacing:** Normal by default. Loose spacing is a special design effect — use sparingly. Never negative.
- **Outlines:** Can be used as a design feature for headings/short captions only. Use Bold/ExtraBold weight.
- **All caps:** OK for headings and short labels. Never for long body copy.
- **Utopia:** Do not use for headings or long body copy. No all-caps. Default kerning.
- **Video:** All-caps only. Numbers look especially good. No outlined text in this font.

### Practical type scale for this app (px equivalents)
| Role | Size | Weight |
|---|---|---|
| Hero heading | 48–64px | Black (900) |
| Section heading | 28–36px | ExtraBold (800) |
| Card heading | 20–24px | Bold (700) |
| Body | 14–16px | Regular (400) |
| Label / caption | 11–13px | SemiBold (600) |

---

## 5. Core Icons & Brand Symbols

### Boid
- The triangular flock-movement symbol in the logo
- Represents Netlight's organisational structure (individuals leading collectively)
- Use with purpose — not as pure decoration
- Primary context: communicating the Netlight organisation itself

### Horse
- Personification of Netlight / the genuine consultant
- Playful brand attribute, shared identity of all Netlighters
- Main use: profile pictures, social media (Instagram), internal/social contexts
- Flat, illustrative style on purple background

### Rainbow
- Symbol of diversity and inclusivity; "the Coming of Age" symbol
- Use as 3D element in mash-up designs, or flat outline as subtle background/corner element
- Can be cropped — works well cut in half placed in a corner
- Available styles: flat colour, outline, 3D material, neon

### Boom (★ star/sparkle)
- 8-pointed star — represents direction, spark, energy, ideas
- First appeared 2023. Used in mash-up styles or as standalone
- Available styles: flat (purple/yellow), outline, 3D chrome, illustration

---

## 6. Design Elements & Textures

### Flat 3D / Isometric
- Adds depth to flat/minimalistic vector illustrations
- Use in combination with other design styles
- Avoid if it looks too much like WordArt or unprofessional

### Material Design 3D (Chrome)
- Inspired by physical world — adds realism and wow factor
- Use as centrepiece in a minimalistic design or in mash-ups

### Digital Squares / Frames
- Bounding boxes, browser windows, QR-code-style frames
- Creates "distinctive spaces" — boxes things in, adds tech vibe
- Use to put focus on elements or to tune up the tech feel

### Blueprint
- Outline-only (stroke, no fill) version of design elements
- Adds technical/industrial dimension
- Use in combination with other styles or on its own for infographics

### Grids
- Technical drawing / pixel grid aesthetic
- Use as background texture or decorative element
- Can be zoomed in (single-line frame) or zoomed out (pattern)

### Grain Texture
- Subtle noise/grain overlay — adds tactile quality
- Use sparingly over colour blocks for depth

---

## 7. Applied to This App

For Nest Checkout, the relevant guidelines are:

**Do:**
- White or beige background with purple accents
- Proxima Nova throughout (Black/ExtraBold for headings, Regular for body)
- Bold colour blocks (full-bleed purple sections for key moments like start screen)
- Generous whitespace between sections
- Use the secondary logo (single-shade purple) in the header
- Use yellow as a highlight/accent colour for CTAs and selected states
- Complementary colours (orange, pink, blue, green) work great for the sticky note colour palette per participant

**Don't:**
- Don't use Utopia or Video in the UI
- Don't use gradients as primary backgrounds
- Don't use the Boid icon as decoration — only if meaningful
- Don't place logo on non-approved background colours
- Don't use negative letter spacing

---

## 8. Tailwind Token Reference
All tokens defined in `src/index.css` under `@theme`:

```
bg-nl-purple        text-nl-purple        #A29AFF
bg-nl-purple-light  text-nl-purple-light  #C6C6FF
bg-nl-purple-dark   text-nl-purple-dark   #6664F1
bg-nl-yellow        text-nl-yellow        #FFF400
bg-nl-yellow-light  text-nl-yellow-light  #FFF4A4
bg-nl-yellow-dark   text-nl-yellow-dark   #EFD500
bg-nl-black         text-nl-black         #000000
bg-nl-white         text-nl-white         #FFFFFF
bg-nl-beige         text-nl-beige         #FFF0E6
bg-nl-orange        text-nl-orange        #FFDA70
bg-nl-pink          text-nl-pink          #FF99FF
bg-nl-blue          text-nl-blue          #6CDBFF
bg-nl-green         text-nl-green         #77FFF8
```
