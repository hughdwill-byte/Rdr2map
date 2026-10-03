# Builds challenges.js: the 9 story-mode challenge lists (90 ranks) with how-to tips and map pins.
# Task wording: rdr2-complete-guide challenges.json (Bandit, Explorer, Gambler, Herbalist, Horseman) and, where that file
# carries Red Dead Redemption 1 lists, RDR2 guides (rdr2.org, gamerguides). Positions: RDOMap game data via rdr2-complete-guide (MIT).
import json, numpy as np, os
SP = os.environ.get('SP', 'tools')
Mv = np.load(f'{SP}/Mv.npy')
V = lambda x, y: [round(float(v), 2) for v in np.array([x, y, 1]) @ Mv]
# shops / towns (game data)
VAL_STORE, VAL_DOC, VAL_GUN = [-68.65, 142.43], [-68.65, 143.18], [-69.17, 143.31]
STR_STORE, RHO_STORE, RHO_GUN = [-93.53, 111.93], [-112.43, 176.8], [-113.03, 176.65]
VAL_SALOON, SDN_SALOON, RHO_SALOON, VH_SALOON = [-68.57, 142.64], [-110.94, 204.05], [-114.12, 177.0], [-74.38, 210.47]
VAL, STR, RHO, SDN, VH, BW, ER = [-71.98, 145.29], [-94.07, 113.02], [-112.38, 175.08], [-116.05, 204.62], [-72.17, 209.51], [-111.45, 133.68], [-76.29, 180.67]
FLATNECK = V(0.60715, 0.44454)
CLEMENS_COVE, ER_FENCE = [-111.52, 165.46], [-79.72, 178.64]
TRAP = {'Saint Denis': [-110.95, 207.99], 'Riggs Station': [-96.79, 128.21], 'Tall Trees': [-125.3, 102.24], 'Emerald Ranch area': [-64.47, 192.32]}
s = open('data.js').read(); D = json.loads(s[s.index('RDR.data=') + 9:s.rstrip().rindex(';')])
LOC = {i['id']: i['l'][0] for i in D['items'] if i['l']}
T = lambda id, label: LOC[id] + [label]

C = [
 dict(id='bandit', n='Bandit', unlock='Hold up anyone in a town (aim at them and press the hold-up prompt).', ranks=[
  dict(t='Hold up five townsfolk.', how='Valentine works well: pull your bandana up, aim at a lone pedestrian and choose “Hold up”. Ride off after each one so the law doesn’t pile up.', pts=[VAL + ['Valentine']]),
  dict(t='Rob two coaches along the road, or complete any two coach-robbery missions.', how='Gang members (Sean, Bill, Charles) offer coach-robbery tips in camp; each one finished counts. Or block a passing stagecoach, hold up the driver and loot the lockbox on the roof.'),
  dict(t='Rob the cash register in any four shops in one day.', how='Start when shops open (around 7am), mask up and follow the numbers: three Valentine shops in a row, then ride west over the Dakota River into West Elizabeth for the fourth, so the New Hanover law can’t follow you. Don’t save or reload mid-way: the count resets. Backup if Valentine gets too hot: Rhodes general store + gunsmith.', route=1,
       pts=[VAL_STORE + ['1. Valentine General Store'], VAL_DOC + ['2. Valentine Doctor'], VAL_GUN + ['3. Valentine Gunsmith'], STR_STORE + ['4. Strawberry General Store']]),
  dict(t='Rob three coaches in a day.', how='Wait on the busy Saint Denis–Rhodes road or the Valentine–Strawberry road; coaches pass every few in-game minutes. Rob, hide your horse off-road, then wait for the next.', pts=[RHO + ['Rhodes road'], SDN + ['Saint Denis road']]),
  dict(t='Amass a $250 bounty in one state.', how='Pick one state (New Hanover is easiest) and keep committing crimes there: robbing Valentine shops and fighting the posse adds up fast. Pay it off at any post office afterwards.'),
  dict(t='Steal five horses and sell them to the horse fence at Clemens Cove.', how='The horse fence opens after “Horse Flesh for Dinner” (Chapter 3). Steal horses tied up in Rhodes, ride them to the fence one by one and sell them.', q=['horse-flesh-for-dinner'], route=1,
       pts=[RHO + ['1. Steal a horse in Rhodes'], CLEMENS_COVE + ['2. Clemens Cove horse fence']]),
  dict(t='Rob $50 of cash and valuables from townsfolk and travellers.', how='Hold people up and loot them, or rob camps of hostile gangs on the roads. Valuables only count once sold to a fence.'),
  dict(t='Steal seven wagons and sell them to the fence at Emerald Ranch.', how='Wagons parked around Emerald Ranch and Emerald Station are right next to the fence: take one, drive it into the fence’s barn and sell it.', route=1, pts=[ER + ['1. Steal a wagon around Emerald Ranch'], ER_FENCE + ['2. Emerald Ranch fence']]),
  dict(t='Hogtie someone and leave them on the railroad three times.', how='Lasso a lone traveller near Emerald Station, hogtie them, carry them to the tracks and wait for a train. Quiet stretches of track keep witnesses away.', pts=[ER + ['Emerald Station tracks']]),
  dict(t='Complete five train robberies without dying or being caught.', how='Jump on a train from horseback, or block the line with a wagon, hold up the passengers and loot the safe. Ride far away before the law arrives.')]),
 dict(id='explorer', n='Explorer', unlock='Pick up your first treasure map: buy the Jack Hall Gang map from Máximo near Flatneck Station ($10, or $5 if you haggle) from Chapter 2.', ranks=[
  dict(t='Find a treasure map.', how='Buy the Jack Hall Gang map from Máximo at Flatneck Station.', pts=[T('treasure-jack-map1', 'Máximo')], q=['ch2']),
  dict(t='Find a treasure (Jack Hall Gang map 2).', how='Caliban’s Seat, south of Valentine: climb up, keep to the right-hand rock wall and drop into the crack at the bottom.', pts=[T('treasure-jack-map2', 'Caliban’s Seat')]),
  dict(t='Find a treasure (Jack Hall Gang map 3).', how='Cotorra Springs, above Fort Wallace: the central rock pillar between the second “o” and the “r” of Cotorra.', pts=[T('treasure-jack-map3', 'Cotorra Springs')]),
  dict(t='Find a treasure (Jack Hall Gang gold).', how='Swim to the central island of O’Creagh’s Run; the rock beside the mossy patch on the north side.', pts=[T('treasure-jack-gold', 'O’Creagh’s Run')]),
  dict(t='Find a treasure (High Stakes map 2).', how='Kill or loot the treasure hunter (Explorer map 1) for the High Stakes map, then search behind Cumberland Falls.', pts=[T('treasure-stakes-map1', 'Treasure hunter'), T('treasure-stakes-map2', 'Cumberland Falls')], route=1),
  dict(t='Find a treasure (High Stakes map 3).', how='Barrow Lagoon.', pts=[T('treasure-stakes-map3', 'Barrow Lagoon')]),
  dict(t='Find a treasure (High Stakes gold).', how='Near Fort Wallace.', pts=[T('treasure-stakes-gold', 'Near Fort Wallace')]),
  dict(t='Find a treasure (Poisonous Trail map 2).', how='Get the Poisonous Trail map from the cabin at Cairn Lodge (deal with the gang there), then the hollow tree at Face Rock.', pts=[T('treasure-poison-map1', 'Cairn Lodge'), T('treasure-poison-map2', 'Face Rock')], route=1),
  dict(t='Find a treasure (Poisonous Trail map 3).', how='Serpent Mound.', pts=[T('treasure-poison-map3', 'Serpent Mound')]),
  dict(t='Find a treasure (Poisonous Trail gold).', how='The cave at Elysian Pool.', pts=[T('treasure-poison-gold', 'Elysian Pool')])]),
 dict(id='gambler', n='Gambler', unlock='Win a hand of poker (Valentine saloon, from Chapter 2).', ranks=[
  dict(t='Win five hands of Poker.', how='Smithfield’s Saloon in Valentine. Fold weak hands early; you only need hand wins, not a whole game.', pts=[VAL_SALOON + ['Valentine saloon']]),
  dict(t='In Blackjack, double down and win the hand five times.', how='Only double down on 10 or 11 against a dealer showing 2–6. Blackjack is in Rhodes and Van Horn (and Blackwater in the Epilogue).', pts=[RHO_SALOON + ['Rhodes saloon'], VH_SALOON + ['Van Horn saloon']]),
  dict(t='Win three games of Five Finger Fillet.', how='Press the button exactly as the knife lands on each gap; slow and steady beats fast.', pts=[VAL_SALOON + ['Valentine'], VH_SALOON + ['Van Horn']]),
  dict(t='Bust one poker table out in each location: Flatneck Station, Saint Denis, Valentine.', how='Each table must lose all its players to you. Play tight and go all-in only with strong hands.', route=1,
       pts=[FLATNECK + ['1. Flatneck Station'], VAL_SALOON + ['2. Valentine'], SDN_SALOON + ['3. Saint Denis']]),
  dict(t='Win three rounds of Dominoes without drawing tiles against two or fewer opponents.', how='Dominoes is played in camp and at Saint Denis/Lagras. Play one opponent and lead with your doubles.'),
  dict(t='Beat the blackjack dealer in two locations: Rhodes and Van Horn Trading Post.', how='Win at least one hand at each.', route=1, pts=[RHO_SALOON + ['1. Rhodes'], VH_SALOON + ['2. Van Horn']]),
  dict(t='Beat the Five Finger Fillet opponent in each location: Strawberry, Valentine, Van Horn Trading Post.', how='Strawberry first, then east along the road through Valentine to Van Horn.', route=1, pts=[STR + ['1. Strawberry'], VAL_SALOON + ['2. Valentine'], VH_SALOON + ['3. Van Horn']]),
  dict(t='Win three hands of Blackjack with three or more hits.', how='Hit on low totals (under 12) to rack up hits safely; small cards are common in a fresh shoe.'),
  dict(t='Win three games of Dominoes in a row.', how='Pick the “All Fives” variant against one opponent.'),
  dict(t='Win three hands of Poker in a row.', how='Bet small to keep weak players in, and fold anything marginal; folding doesn’t break the streak, losing a hand at showdown does.', pts=[VAL_SALOON + ['Valentine'], SDN_SALOON + ['Saint Denis']])]),
 dict(id='herbalist', n='Herbalist', unlock='Pick a Yarrow plant.', ranks=[
  dict(t='Pick six Yarrow plants.', how='White flat-topped flowers, common in the Heartlands around Valentine. Look along the roads.', pts=[VAL + ['Around Valentine']]),
  dict(t='Pick and eat four species of berry.', how='Blackberry, Red Raspberry, Wintergreen Berry and Evergreen Huckleberry all count. Wintergreen and huckleberries grow in the forests north of Valentine.'),
  dict(t='Craft seven items using Sage as an ingredient.', how='Use Desert or Red Sage at a campfire to season meat or make tonics.'),
  dict(t='Pick five mushrooms and feed them to your horse.', how='Parasol, Chanterelle and Oyster mushrooms grow in Lemoyne and Roanoke forests. Feed from the horse’s inventory.'),
  dict(t='Craft nine items using Indian Tobacco as an ingredient.', how='Indian Tobacco grows on the Heartlands plains; craft Potent Bitters/Tonics or season meat.'),
  dict(t='Pick 15 different species of herb.', how='Ride through several biomes: Heartlands, Lemoyne bayou, Big Valley.'),
  dict(t='Craft and use five Special Miracle Tonics.', how='Needs Ginseng (American or Alaskan) and Bay Bolete plus a Miracle Tonic.'),
  dict(t='Use Oleander Sage to craft six poison weapons.', how='Oleander Sage grows in the Lemoyne bayou; craft poison arrows or poison throwing knives (see Crafting Pamphlets).'),
  dict(t='Pick one of each species of herb.', how='Includes rare ones: Alaskan Ginseng (Ambarino), Desert Sage (New Austin, Epilogue), Creeping Thyme, Vanilla Flower and others.'),
  dict(t='Season and cook all 11 types of meat.', how='Season each kind of meat at a campfire with an herb.')]),
 dict(id='horseman', n='Horseman', unlock='Kill a rabbit from horseback.', ranks=[
  dict(t='Kill five rabbits from horseback.', how='Rabbits are everywhere in the Heartlands; use a varmint rifle or bow at a slow canter.', wild=['animal_rabbit']),
  dict(t='Jump over three obstacles in 15 seconds.', how='Fences along the Heartlands ranches line up nicely; build speed and press jump just before each.'),
  dict(t='Ride from Valentine to Rhodes in less than five minutes.', how='Follow the road south-east through Emerald Ranch with a fast horse and full stamina cores; the timer starts as you leave Valentine.', route=1, pts=[VAL + ['Start: Valentine'], ER + ['Emerald Ranch'], RHO + ['Finish: Rhodes']]),
  dict(t='While mounted, drag a victim for 3,300 feet using your lasso.', how='Lasso a hogtied enemy (or bounty) and ride in long straight lines along the road.'),
  dict(t='Trample five animals while on horseback.', how='Ride through flocks of chickens or birds at ranches; small animals count.'),
  dict(t='Ride from Strawberry to Saint Denis in less than nine minutes without touching water.', how='Cross the rivers by bridges only: Strawberry → Valentine → Emerald Ranch → Rhodes road → Saint Denis.', route=1, pts=[STR + ['Start: Strawberry'], VAL + ['Valentine'], ER + ['Emerald Ranch'], SDN + ['Finish: Saint Denis']]),
  dict(t='Kill seven enemies from horseback without dismounting.', how='Ride at hostile gang camps or use a bounty mission; Dead Eye helps.'),
  dict(t='Kill nine predators from horseback.', how='Wolves, cougars, bears and alligators count. Switch on the wolf habitat: packs come to you.', wild=['animal_wolf_gray']),
  dict(t='Ride from Van Horn to Blackwater in less than 17 minutes without touching water.', how='Use bridges only: Van Horn → Emerald Ranch → Valentine → Strawberry road → Blackwater. Blackwater is only open in the Epilogue.', q=['ch7'], route=1, pts=[VH + ['Start: Van Horn'], ER + ['Emerald Ranch'], VAL + ['Valentine'], BW + ['Finish: Blackwater']]),
  dict(t='Break every wild horse breed.', how='Switch on the Wild horses in the Wildlife tab to see where each breed roams.', wild=['animal_horse_wild_mustang', 'animal_horse_wild_nokota'])]),
 dict(id='hunter', n='Master Hunter', unlock='Skin a deer.', ranks=[
  dict(t='Skin three deer.', how='Deer graze in the Heartlands and Big Valley at dawn and dusk; varmint rifle or bow to the head.', wild=['animal_deer']),
  dict(t='Collect three perfect-quality rabbit pelts.', how='Use Small Game Arrows or the varmint rifle; check the stars with binoculars first.', wild=['animal_rabbit']),
  dict(t='Track ten different species using your binoculars.', how='Study an animal first, then hold the track button while aiming binoculars at it.'),
  dict(t='Call an animal and get a clean kill five times.', how='Use the animal call (hold the left d-pad / whistle) to make a deer or elk look at you, then a clean headshot.'),
  dict(t='Skin three black or grizzly bears.', how='Black bears roam Roanoke Ridge and the forests north of Valentine; grizzlies live in the Grizzlies. Use a rifle with Express ammo.', wild=['animal_bear_black', 'animal_bear']),
  dict(t='Kill five cougars with your bow, then skin them.', how='Cougars are rare: Big Valley and the Grizzlies cliffs. Use poison or improved arrows, and bait if you have it.', wild=['animal_cougar']),
  dict(t='Use bait to lure and kill both a herbivore and a predator.', how='Drop herbivore bait in the Heartlands for deer, predator bait in the woods for wolves or coyotes, then hide downwind.'),
  dict(t='Catch three small fish without using a fishing rod.', how='Shoot or arrow fish in shallow streams, or catch them by hand where they flop.'),
  dict(t='Kill an opossum playing possum.', how='Startle an opossum so it plays dead, then kill it. Common in the Lemoyne swamps.', wild=['animal_possum']),
  dict(t='Find and kill the Legendary Giaguaro Panther.', how='Only appears after reaching rank 9. East of Braithwaite Manor, by the water. Use Express ammo and a high-calibre rifle.', pts=[T('animal-panther', 'Legendary Giaguaro Panther')], wild=['legendary_animal_panther'])]),
 dict(id='sharpshooter', n='Sharpshooter', unlock='Kill a flying bird.', ranks=[
  dict(t='Kill three flying birds.', how='Shotgun or varmint rifle; ducks over the lakes near Valentine.', wild=['animal_duck_mallard']),
  dict(t='Kill two different animal species in the same Dead Eye use.', how='Find mixed herds (deer with birds nearby), activate Dead Eye, paint both.'),
  dict(t='Kill five flying birds while on a moving train.', how='Ride a train through the Heartlands or Bayou; shoot birds from the platform at the back.'),
  dict(t='Kill an enemy at least 80 feet away with a thrown tomahawk.', how='Throw upward to give it an arc; Homing Tomahawks help (Crafting Pamphlets).'),
  dict(t='Kill six animals without switching or reloading your weapon.', how='Use a weapon with a big magazine (Litchfield repeater) on a herd or a flock.'),
  dict(t='Kill someone at least 660 feet away with a long scoped rifle.', how='Find a high spot overlooking a gang hideout; use the Rolling Block or Carcano rifle.'),
  dict(t='Get seven headshots in a row.', how='Use Dead Eye on human enemies; a miss resets the count.'),
  dict(t='Disarm three enemies without reloading or switching your weapon.', how='Shoot the weapon hand in Dead Eye; a revolver with 6 rounds is enough.'),
  dict(t='Shoot three people’s hats off in the same Dead Eye use.', how='Pick a group of townsfolk, paint each hat in Dead Eye. Better done after Dead Eye upgrades.'),
  dict(t='Kill three flying birds with three consecutive long scoped shots.', how='Big slow birds (vultures, eagles) over open plains; any miss resets the count.', wild=['animal_vulture_western'])]),
 dict(id='survivalist', n='Survivalist', unlock='Catch a fish.', ranks=[
  dict(t='Catch three Bluegill.', how='The lakes around Valentine and Flat Iron Lake, with bread or cheese bait.', wild=['fish_bluegill']),
  dict(t='Hand in five animals to camp or a trapper.', how='Donate carcasses to Pearson in camp, or sell to a trapper.', pts=[[*v, f'Trapper: {k}'] for k, v in TRAP.items()]),
  dict(t='Kill five animals with a varmint rifle.', how='Buy the Varmint Rifle at a gunsmith; rabbits and squirrels are easy targets.'),
  dict(t='Craft a dynamite, fire, improved, poison and small-game arrow.', how='Needs those five arrow pamphlets: see the Crafting Pamphlets category for where to get each.'),
  dict(t='Catch a fish in the Bayou from a riverboat and while standing on train tracks.', how='Fish from the Saint Denis riverboat deck, and from the rail bridge over the bayou.'),
  dict(t='Kill a scavenging animal while it is feeding on a corpse five times.', how='Leave carcasses out and come back: vultures and coyotes soon arrive.'),
  dict(t='Kill eight small game animals with consecutive shots using small-game arrows.', how='Small Game Arrow pamphlet first. A miss resets the count; target slow birds and rabbits.'),
  dict(t='Craft a homing tomahawk, improved tomahawk, volatile dynamite and volatile fire bottle.', how='All need pamphlets: see Crafting Pamphlets.'),
  dict(t='Catch a fish weighing at least 19 lb.', how='Large Muskie, Lake Sturgeon or Northern Pike from big lakes (Flat Iron Lake, Owanjila).', wild=['fish_lake_sturgeon', 'fish_muskie_clear']),
  dict(t='Catch one of each type of fish.', how='Use the Fish groups in the Wildlife tab to find each species; some live only in New Austin (Epilogue).')]),
 dict(id='weapons', n='Weapons Expert', unlock='Kill three enemies with a knife.', ranks=[
  dict(t='Kill three enemies with a knife.', how='Melee a hostile gang member or bounty target.'),
  dict(t='Kill three enemies in 10 seconds using only throwing knives.', how='Buy throwing knives at a gunsmith; hit quickly in Dead Eye.'),
  dict(t='Kill three birds of prey using only a tomahawk.', how='Hawks and eagles perch on fence posts and dead animals; throw from close.', wild=['animal_hawk_ferruginous', 'animal_eagle_golden']),
  dict(t='Kill ten enemies with a shotgun using crafted ammo.', how='Craft slugs or incendiary buckshot (Crafting Pamphlets), then raid a gang hideout.'),
  dict(t='Kill five mounted enemies using one throwing knife per kill.', how='Wait for riders on the road, or face a mounted posse.'),
  dict(t='Kill four enemies at the same time with a single stick of dynamite.', how='Hostile camps cluster around the fire: throw it into the middle.'),
  dict(t='Kill four consecutive enemies by throwing and retrieving the same tomahawk.', how='Throw, then pick it back up after each kill.'),
  dict(t='Kill 15 enemies using a long-barrelled sidearm.', how='Customise a revolver/pistol with a long barrel at a gunsmith.'),
  dict(t='Kill nine unaware enemies from behind using the bow.', how='Stealth into gang camps at night with the bow; no alert means it still counts.'),
  dict(t='Kill a grizzly bear without taking damage, using only throwing knives.', how='Use poison throwing knives and Dead Eye; hit from your horse and keep moving.', wild=['animal_bear'])]),
]
open('challenges.js', 'w').write('// Generated by tools/build_challenges.py\nRDR.challenges=' + json.dumps(C, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(sum(len(c['ranks']) for c in C), 'ranks')
