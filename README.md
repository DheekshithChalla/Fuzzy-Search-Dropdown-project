# Fuzzy Search Dropdown

A complete HTML/CSS/JavaScript implementation of a fuzzy-search dropdown.

## Features

- Exact full matches get the highest priority.
- Exact prefix matches are prioritized above fuzzy matches.
- Word-prefix matches are supported.
- Typo-tolerant fuzzy matching uses Levenshtein distance.
- Results are sorted by relevance.
- Maximum 8 results are displayed.
- Keyboard navigation with Arrow Up / Arrow Down.
- Enter selects the highlighted result.
- Escape closes the dropdown.
- Click-to-select support.
- Responsive UI.
- No frameworks, dependencies, build tools, or API keys required.

## Run
### Option 1 — Direct link:
[Fuzzy Search](https://dheekshithchalla.github.io/Fuzzy-Search-Dropdown-project/)

### Option 2 — Directly
Open `index.html` in your browser.

### Option 3 — VS Code
Open this folder in VS Code and use Live Server if you have it installed.

## Test searches

Try:

- `app` → Apple, Application, Apricot
- `apl` → Apple / Application through fuzzy matching
- `ban` → Banana, Bandana
- `key` → Keyboard, Keychain
- `wless` → Wireless Mouse / Wireless Keyboard through fuzzy matching

## How prioritization works

The ranking order is:

1. Exact match
2. Exact prefix match
3. Prefix of any individual word
4. Fuzzy similarity using edit distance
5. Alphabetical order as a tie-breaker

This makes the component suitable as a starting point for an autocomplete/search UI challenge.
