# RDR2 Collectibles Map

Interactive Red Dead Redemption 2 (story mode) map for 100% completion. Click a region to list everything in it, tick items off and they disappear from the map. Progress is saved in your browser.

**Live:** https://hughdwill-byte.github.io/Rdr2map/

Covers: Dinosaur Bones (30), Rock Carvings (10), Dreamcatchers (20), Cigarette Cards (144 in 12 sets), Treasure Maps (7 hunts), Graves (9), Legendary Animals (16), Legendary Fish (13), Hunting Requests (5), Exotics (5 lists, with orchid/plume/egg spawn spots), Gang Member Requests (17), Unique Weapons & Hats, and Valuable Stashes (gold bars, homestead stashes and other sellable valuables).

Story-aware: set your chapter (or tick missions) in the Story progress tab and each collection unlocks when the game allows it. People you must meet first (Deborah MacGuinness, Francis Sinclair, Jeremy Gill, Algernon Wasp…) are pinned on the map, treasure hunts reveal one step at a time, and New Austin waits for the Epilogue. Story data lives in `story.js`.

Built phone-first for iPhone: a bottom-sheet list you drag or tap, safe-area support for the notch and home bar, and *Add to Home Screen* support so it runs full-screen like an app. Progress can be backed up and restored with a code.

## Hosting

Static site, no build step. GitHub → Settings → Pages → *Deploy from a branch* → `main` / `(root)`.

## Data & credits

- Map tiles (zoom 2–7): scraped from IGN by [the0neWhoKnocks/red-dead-redemption-2-map](https://github.com/the0neWhoKnocks/red-dead-redemption-2-map) (MIT). Map art © Rockstar Games.
- Dinosaur bones, graves, orchids, alligator eggs and the game-style icons: [jeanropke/RDOMap](https://github.com/jeanropke/RDOMap) (public domain).
- Cigarette card sets, numbers and descriptions: [patreiCH72/rdr2-interactive-map](https://github.com/patreiCH72/rdr2-interactive-map) (MIT).
- Everything else (rock carvings, dreamcatchers, treasure, legendaries, gear): IGN marker data via the0neWhoKnocks.
- Region borders are approximate: generated from the map art (water = border) with seed points per region.

`tools/` holds the Python scripts that align the three datasets into one coordinate system and generate `data.js` (run them next to clones of the repos above).

Fan project, not affiliated with Rockstar Games.
