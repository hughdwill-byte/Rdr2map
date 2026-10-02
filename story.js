// Story progression and unlock requirements.
// Requirement tokens: 'chN' = reached chapter N (chapter N-1 marked complete); anything else = a story/start id that must be ticked.
// Chapters 7/8 are Epilogue parts 1/2. Pins marked approx are placed by area, not exact spot.
RDR.story = {
  chapters: [
    { n: 1, name: 'Chapter 1', place: 'Colter', camp: [-34.5, 121.5], missions: [
      ['outlaws', 'Outlaws from the West'], ['enter-memory', 'Enter, Pursued by a Memory'], ['old-friends', 'Old Friends'],
      ['leviticus', 'Who the Hell is Leviticus Cornwall?'], ['eastward', 'Eastward Bound'],
    ] },
    { n: 2, name: 'Chapter 2', place: 'Horseshoe Overlook', camp: [-80.6, 148.9], missions: [
      ['bruised-ego', 'Exit Pursued by a Bruised Ego'], ['americans-rest', 'Americans at Rest'], ['first-last', 'The First Shall Be Last'],
      ['social-call', 'Paying a Social Call'], ['not-without-sin', 'Who Is Not Without Sin'], ['quiet-time', 'A Quiet Time'],
      ['polite-society', 'Polite Society, Valentine Style'], ['money-1', 'Money Lending and Other Sins I'], ['money-2', 'Money Lending and Other Sins II', 1],
      ['money-3', 'Money Lending and Other Sins III', 1], ['spines', 'The Spines of America'], ['snake-oil', 'Good, Honest Snake Oil'],
      ['loved-1', 'We Loved Once and True I'], ['loved-2', 'We Loved Once and True II'], ['loved-3', 'We Loved Once and True III', 1],
      ['oil-1', 'Pouring Forth Oil I'], ['oil-2', 'Pouring Forth Oil II', 1], ['oil-3', 'Pouring Forth Oil III'], ['oil-4', 'Pouring Forth Oil IV'],
      ['american-pastoral', 'An American Pastoral Scene'], ['fisher-men', 'A Fisher of Men'], ['sheep-goats', 'The Sheep and the Goats'],
      ['blessed-meek', 'Blessed are the Meek?'],
    ] },
    { n: 3, name: 'Chapter 3', place: 'Clemens Point', camp: [-106.5, 161.2], missions: [
      ['new-south', 'The New South'], ['female-suffrage', 'Further Questions of Female Suffrage'], ['money-4', 'Money Lending and Other Sins IV', 1],
      ['distillation', 'American Distillation'], ['true-love-1', 'The Course of True Love I', 1], ['true-love-2', 'The Course of True Love II', 1],
      ['advertising', 'Advertising, the New American Art'], ['horse-flesh', 'Horse Flesh for Dinner'], ['preaching', 'Preaching Forgiveness as He Went', 1],
      ['sodom', 'Sodom? Back to Gomorrah'], ['pretty-town', 'A Short Walk in a Pretty Town'], ['peacemakers', 'Blessed are the Peacemakers'],
      ['shady-belle', 'The Battle of Shady Belle'], ['tobacco', 'The Fine Joys of Tobacco'], ['blood-feuds', 'Blood Feuds, Ancient and Modern'],
    ] },
    { n: 4, name: 'Chapter 4', place: 'Saint Denis (camp: Shady Belle)', camp: [-124.0, 188.7], missions: [
      ['joys-civ', 'The Joys of Civilization'], ['bronte', 'Angelo Bronte, a Man of Honor'], ['money-5', 'Money Lending and Other Sins V', 1],
      ['fatherhood-1', 'Fatherhood and Other Dreams I'], ['fatherhood-2', 'Fatherhood and Other Dreams II', 1], ['thrice-no', 'No, No and Thrice, No'],
      ['gilded-cage', 'The Gilded Cage'], ['debauchery', 'A Fine Night of Debauchery'], ['american-fathers-1', 'American Fathers I'],
      ['american-fathers-2', 'American Fathers II'], ['country-pursuits', 'Country Pursuits'], ['urban-pleasures', 'Urban Pleasures'],
      ['revenge', 'Revenge is a Dish Best Eaten'], ['horsemen', 'Horsemen, Apocalypses'], ['true-love-3', 'The Course of True Love III', 1],
      ['banking', 'Banking, the Old American Art'],
    ] },
    { n: 5, name: 'Chapter 5', place: 'Guarma', missions: [
      ['new-world', 'Welcome to the New World'], ['savagery', 'Savagery Unleashed', 1], ['despot', 'A Kind and Benevolent Despot'],
      ['no-fury', 'Hell Hath No Fury'], ['paradise', 'Paradise Mercifully Departed'],
    ] },
    { n: 6, name: 'Chapter 6', place: 'Beaver Hollow', missions: [
      ['fleeting-joy', 'Fleeting Joy'], ['uncle-tacitus', 'Dear Uncle Tacitus'], ['icarus', 'Icarus and Friends'], ['fork-road', 'A Fork in the Road'],
      ['murfree', "That's Murfree Country"], ['visiting-hours', 'Visiting Hours'], ['men-angels', 'Of Men and Angels', 1],
      ['absolution-1', 'Do Not Seek Absolution I', 1], ['absolution-2', 'Do Not Seek Absolution II', 1], ['social-call-2', 'Just a Social Call'],
      ['rage', 'A Rage Unleashed'], ['van-horn', 'The Delights of Van Horn'], ['bridge', 'The Bridge to Nowhere'],
      ['archeology', 'Archeology for Beginners', 1], ['honor-thieves', 'Honor, Amongst Thieves', 1], ['goodbye', 'Goodbye, Dear Friend'],
      ['best-selves', 'Our Best Selves'], ['finale', 'Red Dead Redemption / My Last Boy'],
    ] },
    { n: 7, name: 'Epilogue Part 1', place: 'Pronghorn Ranch', missions: [
      ['wheel', 'The Wheel'], ['simple-pleasures', 'Simple Pleasures'], ['farming', 'Farming, for Beginners'],
      ['fatherhood-b', 'Fatherhood, for Beginners'], ['old-habits', 'Old Habits'], ['jim-milton', 'Jim Milton Rides, Again'],
    ] },
    { n: 8, name: 'Epilogue Part 2', place: "Beecher's Hope", missions: [
      ['bare-knuckle', 'Bare Knuckle Friendships'], ['honest-labors', "An Honest Day's Labors"], ['tool-box', 'The Tool Box'],
      ['new-jerusalem', 'A New Jerusalem'], ['quick-favor', 'A Quick Favor for an Old Friend'], ['uncle-bad-day', "Uncle's Bad Day"],
      ['best-women', 'The Best of Women'], ['trying-again', 'Trying Again'], ['new-future', 'A New Future Imagined'], ['american-venom', 'American Venom'],
    ] },
  ],

  // People to meet / things to pick up before a collection opens. Shown as pins until ticked.
  starts: [
    { id: 'start-deborah', ch: 2, who: 'Deborah MacGuinness', mission: 'A Test of Faith', unlocks: 'dino', l: [-89.0, 148.5], approx: 1,
      d: 'Elderly woman crouched in a crater in The Heartlands, northeast of Flatneck Station. Mail bone locations to her from any post office.' },
    { id: 'start-sinclair', ch: 3, who: 'Francis Sinclair', mission: 'Geology for Beginners', unlocks: 'carving', l: [-91.5, 103.8], approx: 1,
      d: 'Sitting outside his cabin northwest of Strawberry (north of the "S" in Strawberry). Available once Chapter 2 is complete.' },
    { id: 'start-gill', ch: 3, who: 'Jeremy Gill', mission: 'A Fisher of Fish', unlocks: 'fish', l: [-96.8, 161.5], approx: 1,
      d: 'At his pier on the northeast bank of Flat Iron Lake, south of the "R" in The Heartlands. Buy special lures at the Lagras bait shop.' },
    { id: 'start-hunt', ch: 2, who: 'Hunting Request letter', mission: 'Hunting Requests', unlocks: 'hunt', l: [-70.6, 141.4], approx: 1,
      d: 'Pick up the first Hunting Request at a post office or train station (Valentine shown; also Strawberry, Rhodes, Saint Denis, Van Horn). Mail carcasses to Mrs. Hobbs.' },
    { id: 'start-wasp', ch: 4, who: 'Algernon Wasp', mission: 'Duchesses and Other Animals', unlocks: 'exotic', l: [-103.5, 205.5], approx: 1, after: 'gilded-cage',
      d: 'In the iron greenhouse behind the big blue house in north Saint Denis. Appears after "The Gilded Cage".' },
    { id: 'start-charlotte', ch: 6, who: 'Charlotte Balfour', mission: 'The Widow of Willard\'s Rest', unlocks: 'loot', l: [-39.4, 211.6],
      d: "Willard's Rest, far northeast Roanoke Ridge. Help her and she leaves you a box of money (Willard's Rest stash)." },
  ],

  // Category-wide requirements (everything also needs Chapter 2: free roam opens after Colter).
  catReq: {
    dino: ['ch2', 'start-deborah'], carving: ['ch3', 'start-sinclair'], dream: ['ch2'], card: ['ch2'], treasure: ['ch2'], grave: ['ch7'],
    animal: ['ch2', 'bruised-ego'], fish: ['ch3', 'start-gill'], hunt: ['ch2', 'start-hunt'],
    exotic: ['ch4', 'gilded-cage', 'start-wasp'], gang: ['ch2'], gear: ['ch2'], loot: ['ch2'],
  },
  // Extra per-item requirements, on top of the category ones.
  itemReq: {
    'treasure-stakes-map1': ['ch3', 'new-south'],
    'treasure-elemental-map1': ['ch7'],
    'hunt-5-waxwing': ['ch7'], 'hunt-5-bat': ['ch7'], 'hunt-5-blue-jay': ['ch7'], 'hunt-5-crow': ['ch7'], 'hunt-5-beaver': ['ch7'],
    'gang-03': ['ch3'], 'gang-06': ['ch3'], 'gang-14': ['ch3'], 'gang-15': ['ch3'], 'gang-17': ['ch3'],
    'loot-gold-braithwaite': ['ch4'], 'loot-gold-shady-belle': ['ch3'],
    'loot-home-willard': ['ch6', 'start-charlotte'], 'loot-home-lonnie': ['ch3'],
  },
};
