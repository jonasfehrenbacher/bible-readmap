# Bible Readmap Requirements

Bible Readmap is a web app for creating a personalized Bible reading plan to print. The landing screen guides users through configuring the plan and ends with direct printing and optional file downloads.

Each requirement has a stable ID. **Must** identifies required behavior. **May** identifies an optional implementation or design choice.

## Web app and user flow

| ID | Requirement |
| --- | --- |
| APP-01 | The reading plan generator must run as a web app. |
| APP-02 | The app must be responsive. Users must be able to configure, print, and download a plan on phone, tablet, and desktop layouts. |
| APP-03 | The app must open with a visually engaging, modern, fullscreen hero. |
| APP-04 | The hero must guide users through plan creation using interactive controls. The flow must lead directly from configuration to a finished plan with print and download actions. |

## Configuration

| ID | Requirement |
| --- | --- |
| CONFIG-01 | Users must be able to choose a plan duration from one week to five years. The default must be one year. |
| CONFIG-02 | Users must be able to show or hide the calendar date on every daily entry. Dates must be visible by default. |
| CONFIG-03 | Users must be able to choose which weekday appears first in the weekly layout. Sunday must be the default. |
| CONFIG-04 | Users must be able to choose between balancing daily readings by word count and balancing them by chapter count. Both modes must assign whole chapters. |
| CONFIG-05 | In word-count mode, the generator must use chapter word counts to give each day approximately the same reading volume, allowing variation where whole-chapter boundaries require it. |
| CONFIG-06 | In chapter-count mode, the generator must assign an equal number of chapters per day when possible and distribute any remainder as evenly as possible. |
| CONFIG-07 | Users must be able to show or hide sequential numbers on daily entries. Numbers must be visible by default. |
| CONFIG-08 | Users must be able to show or hide the marker legend. The legend must be visible by default and must reflect the configured book and month markers. |
| CONFIG-09 | Users must be able to show or hide the plan header. The header must be visible by default. |
| CONFIG-10 | Users must be able to show or hide the plan subheader independently of the header. The subheader must be visible by default. |
| CONFIG-11 | The default reading order must follow all 66 books in book and chapter order, from Genesis 1 to Revelation 22. The generator must be structured to support additional reading orders in the future. |
| CONFIG-12 | Users must be able to configure whether and how the beginning of a Bible book is marked. The marker must identify each book start, including when a daily reading spans multiple books. |
| CONFIG-13 | Users must be able to configure whether and how the first day of a new calendar month is marked. |
| CONFIG-14 | Book and month marker settings must be independent. Both markers must be visible when they apply to the same daily entry and are enabled. |
| CONFIG-15 | Each marker must offer a symbol option with a selectable symbol. The diamond must be the default marker style. |
| CONFIG-16 | Each marker must offer a colored border option with a selectable color, such as red. |
| CONFIG-17 | The first reading date is by default today in the user's local calendar, but that can be configured. The generator must calculate dates using the calendar and include February 29 when it falls within the plan. |
| CONFIG-18 | Users must be able to include or omit a printed checkbox on each daily entry. |
| CONFIG-19 | Users must be able to choose one or two years per printed page. A page must contain at most two years of the plan. The checkbox setting must be available with both layouts. |
| CONFIG-20 | Users must be able to choose German or English for the interface and plan output. |

## Printing and downloads

| ID | Requirement |
| --- | --- |
| OUT-01 | Printing must be the primary action for a generated plan. Users must be able to print directly from the web app without downloading a file first. |
| OUT-02 | The print layout must support A4 and must include the complete plan with readable entries. App controls must be omitted from the printed pages. |
| OUT-03 | Users must be able to download the generated plan as a `.pdf` file. |
| OUT-04 | Users must be able to download the generated plan as an `.html` file that opens in a browser. |
| OUT-05 | The printed plan and both downloads must reflect the selected readings, display settings, marker styles, and output language. |

The [sample A4 plan](docs/Bibelleseplan_365_Tage_A4.pdf) illustrates a landscape, 365-day layout with weekday columns, chapter references, checkboxes, a diamond at the start of a Bible book, and a red border at the start of a month. It is a layout reference.

## Data

| ID | Requirement |
| --- | --- |
| DATA-01 | The app must not collect or persist personal data, reading plans, or user preferences. Generating, printing, and downloading a plan must work without an account. |
| DATA-02 | The generator must use `src/assets/elberfelder1871.json` as the source for per-chapter word counts. |
| DATA-03 | The app must use `de.json` and `en.json` for German and English translations. Interface and output text, including controls, headings, weekday labels, Bible book names or abbreviations, and legends, must follow the selected language. Dates must use that language's locale. |

## Visual design and CSS

| ID | Requirement |
| --- | --- |
| STYLE-01 | The app must use a restrained theme with primary, secondary, accent, and neutral color roles and no more than 10 theme colors. |
| STYLE-02 | `src/styles/theme.css` must define all application theme colors. App styles must reference those definitions. |
| STYLE-03 | CSS class names must follow BEM. |
| STYLE-04 | The app must apply a global CSS reset in `src/styles/reset.css`. |
| STYLE-05 | The supplied `public/logo.png` may be used as the favicon. It may also appear as an in-app icon if it fits the design. The logo may be recolored, replaced, or omitted. |

The color roles follow the [palette guide](https://elainetsung.com/how-many-colors-should-a-website-have/).

## Implementation and project structure

| ID | Requirement |
| --- | --- |
| TECH-01 | The app must use vanilla TypeScript and Lit and keep the implementation simple. |
| TECH-02 | The UI must be composed of reusable Lit components, from individual controls to larger sections. Components may be nested. Each component must keep its template, TypeScript logic, and scoped CSS together in a single file under `src/components/`. |
| TECH-03 | The app must use Lit server-side rendering and client-side hydration. The initial HTML must contain meaningful page content for search indexing, and hydration must make the interface interactive. |
| TECH-04 | The app must use Vite for local development and optimized production builds. |
| TECH-05 | The project must follow the directory responsibilities below. |

| Directory | Responsibility |
| --- | --- |
| `src/components/` | Reusable Lit components |
| `src/layouts/` | Shared page structure |
| `src/pages/` | Composition of layouts and components |
| `src/styles/` | Global styles, reset, and theme tokens |
| `src/assets/` | Assets referenced by the build |
| `scripts/` | Build-time logic |
| `public/` | Static assets served as-is |
