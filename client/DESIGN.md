# Melodify design

Dark and warm. The interface stays quiet so album art brings the colour, and one coral accent marks what you can act on.

## Tokens (`src/styles.scss`, mapped in `tailwind.config.js`)

| Token | Value | Use |
| --- | --- | --- |
| `bg` | `#0E0E10` | Page |
| `surface` | `#17171A` | Cards, quick picks |
| `raised` | `#1F1F23` | Hover rows, menus, skeletons |
| `line` | `#F2EFEA` at 6 to 14% | Borders and dividers |
| `ink` | `#F2EFEA` | Main text (warm off-white) |
| `ink-muted` | `#A39F99` | Secondary text |
| `ink-faint` | `#6F6C68` | Meta, numbers, labels |
| `accent` | `#FF6B5A` | Play buttons, liked hearts, current track, chart bars |
| `accent-ink` | `#1A0A07` | Text and icons on coral |
| `danger` | `#EF6353` | Destructive actions |

Type: Inter Variable. Page titles 28 to 34px semibold with tight tracking; item headers (playlist, artist, album) up to 60px bold. Body 15px. Numbers use tabular figures.

Radius: 12px cards, 8px covers, full pills for buttons and chips. Selected chips and tabs are filled with `ink` (not coral), so coral stays for actions and data.

## Components

- **Play button**: coral circle, the only filled coral control. Media cards reveal it on hover.
- **Track row**: number turns into a play icon on hover, the current track is coral with a speaker icon. Like and "more" appear on hover on desktop; on touch screens "more" is always visible and holds "Save to Liked songs".
- **Player bar**: fixed at the bottom (above the tabs on mobile). The device button turns coral when a device is active. When nothing is playing anywhere, a play command opens the device picker instead of failing.
- **Charts**: one hue (coral) on `surface`; bars carry exact values as text, and the listening clock has a table view and a full text label for screen readers.
- **Empty states**: dashed card with an icon, one sentence and at most one action.

## Layout

- Desktop: 256px sidebar (navigation, Liked songs, your playlists, account), content up to 1280px, player bar at the bottom.
- Mobile (< 768px): no sidebar, five bottom tabs (Home, Search, Library, Stats, New) and a compact player bar above them. Quick picks become two columns, track durations hide below 640px.
- Reduced motion turns off transitions and skeleton pulses.
