# IluminAconciencia design system

Captured from application sources for standalone design prototypes. This is an existing system, not a proposed starter.
Artboards use system font fallbacks only; production font files are not embedded or fetched.

## Colors — 16 tokens

Source: `app/_styles/globals.css`, `@theme`.

| Token        | Value                  | Use                                                |
| ------------ | ---------------------- | -------------------------------------------------- |
| background   | #0e0929                | Page, buttons and panels                           |
| foreground   | #fcf8ff                | Headings, strong text                              |
| primary      | #f4bd63                | Information affordances, borders, selected buttons |
| text         | rgb(252 248 255 / 80%) | Reading text                                       |
| border       | rgb(244 189 99 / 50%)  | Dividers and outlines                              |
| accent       | #ff5a3d                | Focus ring and action hover                        |
| accent-hover | #ff745c                | Accent hover                                       |
| bortle-1     | #17112f                | Bortle level 1                                     |
| bortle-2     | #66677d                | Bortle level 2                                     |
| bortle-3     | #4a6abc                | Bortle level 3                                     |
| bortle-4     | #55ad83                | Bortle level 4                                     |
| bortle-5     | #dfc85c                | Bortle level 5                                     |
| bortle-6     | #e99a4f                | Bortle level 6                                     |
| bortle-7     | #d95c62                | Bortle level 7                                     |
| bortle-8     | #f2edf5                | Bortle level 8                                     |
| bortle-9     | #f2edf5                | Bortle level 9                                     |

## Typography — 4 aliases

Source: `app/_styles/globals.css`; font loading: `app/layout.tsx`.

- heading: Baskervville (`--font-baskerville`); artboard fallback Georgia, Cambria, 'Times New Roman', Times, serif.
- body: Ubuntu Sans (`--font-ubuntu`); artboard fallback -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif.
- serif: heading with the serif fallback above.
- sans: body with the sans fallback above.
  Source: `app/_components/SectionHeading.tsx`: eyebrow 12px/16px, tracking 3px; heading 30px or 48px with tight leading.
  Source: `app/_components/InfoPopover.tsx`: panel 14px with relaxed leading.
  Source: `app/(site)/(proyecto)/_components/ProjectContent.tsx`: body 16px with relaxed leading; section headings 30px; subsection headings 20px.

## Spacing — 7 observed steps

Sources: `app/_components/InfoPopover.tsx`, `app/_components/Button.tsx`, `app/(site)/(proyecto)/_components/ProjectContent.tsx`.
4px (panel gap, button py-1); 8px (gap-2); 12px (gap-3); 16px (panel p-4); 20px (button px-5); 24px (space-y-6); 32px (gap-8).

## Radius — 3 observed rules

Sources: `app/_components/Button.tsx`, `app/_components/InfoPopover.tsx`.
4px (rounded buttons); 8px (rounded-lg panel); fully rounded (help trigger).
These are utility-resolved values; globals.css declares no custom radius tokens.

## Shadows — 1 observed rule

Source: `app/_components/InfoPopover.tsx`: shadow-lg utility. globals.css declares no custom shadow color or value.
Prototypes omit shadows rather than introducing a new color outside this captured palette.

## Component rules

- Gold information affordances on the dark background, serif headings, sans-serif reading text.
- Button outline uses primary; filled primary button uses background text. Source: `app/_components/Button.tsx`.
- Visible 2px accent focus outline with background separation. Source: `app/_components/Button.tsx`.
- Information panel uses background, border, foreground, 16px padding and 14px relaxed text. Source: `app/_components/InfoPopover.tsx`.
- Current information trigger uses a question mark; size sm 20px trigger / 16px SVG, md 32px / 24px SVG. Source: `app/_components/InfoPopover.tsx`.
- Reduced motion disables nonessential transitions. Source: `app/_styles/globals.css`.
- New popover dimensions, delays and marker treatments in artboards are design proposals, not existing system tokens.

## Artboard self-check

Only the captured colors and system fallback font families are permitted. Transparent borders/backgrounds and currentColor are allowed. No remote fonts or assets.
