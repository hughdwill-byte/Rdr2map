# Hunting info per species: size class (decides the ideal weapon for a perfect pelt), temperament, notes, and the
# scientific name used to look up a real recording of the animal on Wikimedia Commons.
# size class -> perfect-pelt loadout: (label, weapon, ammo, also works, where to aim). Too strong a round ruins the pelt
# (the game drops it to 1-2 stars); too weak wounds the animal. Per RDR2 hunting guides (rdr2.org, gamerguides).
SIZE = {
 'tiny':    ('Tiny', 'Bow', 'Small Game Arrows', 'Varmint Rifle', 'Body shot is fine with small game arrows.'),
 'small':   ('Small', 'Varmint Rifle', 'Varmint Rifle ammo (.22)', 'Bow with Small Game Arrows', 'Head or upper body.'),
 'medium':  ('Medium', 'Bow', 'Regular or Improved Arrows', 'Repeater with regular ammo', 'Head, or heart/lungs behind the front leg.'),
 'large':   ('Large', 'Rifle (Springfield or Bolt Action)', 'Regular or High Velocity rifle ammo', 'Bow with Improved or Poison Arrows', 'Head or heart: one clean shot.'),
 'massive': ('Massive', 'Rifle (Bolt Action, Rolling Block or Carcano)', 'Express or High Velocity rifle ammo', 'Bow with Poison Arrows (body shot, then wait)', 'Head, or heart behind the front leg; use Dead Eye to see the weak spots.'),
}
# key: (size, temperament, note, latin name for the sound lookup or None)
S = {
 'animal_alligator_medium': ('massive','Dangerous','Lurks in shallow water; keep away from the bank and shoot before it lunges.','Alligator mississippiensis'),
 'animal_alligator_little': ('large','Dangerous','Basks on muddy banks; bites if you get close.','Alligator mississippiensis'),
 'animal_armadillo': ('small','Harmless','Slow and easy to approach; scurries into scrub when spooked.','Dasypus novemcinctus'),
 'animal_badger': ('small','Defensive','Will bite if cornered; often around burrows at dusk.','Taxidea taxus'),
 'animal_bat': ('tiny','Harmless','Only comes out at night, mostly around caves; shoot in flight.',None),
 'animal_bear': ('massive','Very dangerous','Charges when it sees or smells you. Approach downwind, use cover scent, and aim for the head.','Ursus arctos horribilis'),
 'animal_bear_black': ('massive','Dangerous','Usually flees but may attack at close range.','Ursus americanus'),
 'animal_beaver': ('medium','Shy','Works around dams and slow rivers; dives when it hears you.','Castor canadensis'),
 'animal_buffalo': ('massive','Defensive','Moves in herds on open plains; a hurt bull may charge.','Bison bison'),
 'animal_boar': ('large','Dangerous','Charges when hurt; hunt from horseback or high ground.','Sus scrofa'),
 'animal_buck': ('large','Skittish','Very alert; use cover scent and herbivore bait, stay downwind and crouch.','Odocoileus virginianus'),
 'animal_bull_devon': ('massive','Defensive','Farm animal: may charge, and killing it on a ranch is a crime.','Bos taurus'),
 'animal_frogbull': ('tiny','Harmless','Croaks loudly at night along swamp edges.','Lithobates catesbeianus'),
 'animal_cat': ('small','Harmless','Domestic; mostly in towns.','Felis catus'),
 'animal_chipmunk': ('tiny','Skittish','Darts around logs and rocks in woodland.','Tamias striatus'),
 'animal_cougar': ('large','Very dangerous','Ambush predator that stalks you; listen for its scream and keep your back to rocks.','Puma concolor'),
 'animal_cow': ('massive','Harmless','Farm animal: killing it on a ranch is a crime.','Bos taurus'),
 'animal_coyote': ('medium','Skittish','Often in pairs or packs; predator bait brings them in.','Canis latrans'),
 'animal_crab': ('tiny','Harmless','Scuttles along beaches and marsh edges.',None),
 'animal_deer': ('large','Skittish','Grazes in clearings at dawn and dusk; herbivore bait and cover scent help.','Odocoileus virginianus'),
 'animal_dog_street': ('medium','Varies','Domestic dogs around towns and farms.','Canis familiaris'),
 'animal_elk_rocky': ('massive','Skittish','Herds in high meadows; bugles in the morning. Approach slowly from downwind.','Cervus canadensis'),
 'animal_mountain_cow_elk': ('massive','Skittish','Stays with the herd; spooks easily.','Cervus canadensis'),
 'animal_fox_red': ('medium','Shy','Hunts small prey at dusk and night; predator bait works.','Vulpes vulpes'),
 'animal_fox_grey': ('medium','Shy','Woodland fox of the Grizzlies; most active at night.','Urocyon cinereoargenteus'),
 'animal_gilamonster': ('small','Venomous','Slow but has a venomous bite; desert rocks in New Austin.',None),
 'animal_goat': ('large','Harmless','Farm and hillside animal.','Capra hircus'),
 'animal_iguana': ('small','Harmless','Basks in the sun near water.',None),
 'animal_iguanadesert': ('small','Harmless','Basks on desert rocks.',None),
 'animal_moose': ('massive','Defensive','Often near lakes and marshy ground; a bull may charge.','Alces alces'),
 'animal_muskrat': ('small','Shy','Swims along riverbanks and marsh channels.','Ondatra zibethicus'),
 'animal_possum': ('small','Harmless','Nocturnal; plays dead when threatened.','Didelphis virginiana'),
 'animal_ox_angus': ('massive','Harmless','Farm animal: killing it on a ranch is a crime.','Bos taurus'),
 'animal_panther': ('large','Very dangerous','Ambushes from dense cover in the bayou; very hard to spot.','Puma concolor'),
 'animal_javelina': ('large','Defensive','Moves in small groups in New Austin scrub; will charge.','Pecari tajacu'),
 'animal_pig_berkshire': ('medium','Harmless','Farm animal: killing it on a ranch is a crime.','Sus domesticus'),
 'animal_rabbit': ('small','Skittish','Bolts in a zig-zag; easiest from horseback with the Varmint Rifle.','Sylvilagus floridanus'),
 'animal_racoon': ('small','Shy','Nocturnal forager near water and farms.','Procyon lotor'),
 'animal_bighornram_rocky': ('large','Skittish','On steep rocky slopes; shoot from below and expect a fall.','Ovis canadensis'),
 'animal_bighornram_desert': ('large','Skittish','Rocky desert hills in New Austin.','Ovis canadensis'),
 'animal_bighornram_sierra': ('large','Skittish','High rocky slopes.','Ovis canadensis'),
 'animal_bighornram_rocky_f': ('large','Skittish','Stays near the rams on steep slopes.','Ovis canadensis'),
 'animal_bighornram_desert_f': ('large','Skittish','Rocky desert hills.','Ovis canadensis'),
 'animal_bighornram_sierra_f': ('large','Skittish','High rocky slopes.','Ovis canadensis'),
 'animal_rat_black': ('tiny','Harmless','Around towns, docks and barns.','Rattus rattus'),
 'animal_sheep': ('large','Harmless','Farm animal: killing it on a ranch is a crime.','Ovis aries'),
 'animal_skunk': ('small','Defensive','Sprays if you get too close, which makes you smell; shoot from range.','Mephitis mephitis'),
 'animal_snake': ('tiny','Venomous','Hides in grass and rocks; watch your step.',None),
 'animal_snakeblacktailrattle': ('tiny','Venomous','Listen for the rattle before it strikes.','Crotalus molossus'),
 'animal_snake_copperhead_northern': ('tiny','Venomous','Hides in leaf litter.',None),
 'animal_snakewater': ('tiny','Venomous','Swims in rivers and swamps.',None),
 'animal_squirrel_grey': ('tiny','Skittish','Runs along branches and fallen logs.','Sciurus carolinensis'),
 'animal_toad': ('tiny','Harmless','Near ponds and rivers, often after rain.','Anaxyrus americanus'),
 'animal_toad_sonoran': ('tiny','Harmless','Desert pools in New Austin.','Incilius alvarius'),
 'animal_turtle_snapping': ('large','Defensive','Rests on logs and banks; bites hard.',None),
 'animal_wolf_gray': ('large','Very dangerous','Hunts in packs and surrounds you; use a fast-firing weapon and keep moving.','Canis lupus'),
}
BIRD = {  # birds: size class + scientific name; flying birds are easiest with the Varmint Rifle or small game arrows
 'animal_bluejay':('tiny','Cyanocitta cristata'),'animal_cardinal':('tiny','Cardinalis cardinalis'),'animal_chicken_leghorn':('small','Gallus gallus domesticus'),
 'animal_californiancondor':('medium','Gymnogyps californianus'),'animal_cormorant_doublecrested':('medium','Phalacrocorax auritus'),'animal_cormorant_neotropic':('medium','Phalacrocorax brasilianus'),
 'animal_cranewhooping_whooping':('medium','Grus americana'),'animal_crow':('small','Corvus brachyrhynchos'),'animal_duck_mallard':('small','Anas platyrhynchos'),
 'animal_eagle_golden':('medium','Aquila chrysaetos'),'animal_egret_reddish':('medium','Egretta rufescens'),'animal_goosecanada':('medium','Branta canadensis'),
 'animal_seagull_herring':('small','Larus argentatus'),'animal_hawk_ferruginous':('medium','Buteo regalis'),'animal_heron_greatblue':('medium','Ardea herodias'),
 'animal_loon_pacific':('medium','Gavia pacifica'),'animal_oriole_baltimore':('tiny','Icterus galbula'),'animal_oriole_hooded':('tiny','Icterus cucullatus'),
 'animal_owl_great':('small','Bubo virginianus'),'animal_owl_californian':('small','Strix occidentalis'),'animal_pelican_white':('medium','Pelecanus erythrorhynchos'),
 'animal_pheasant_ringneck':('small','Phasianus colchicus'),'animal_pigeon_bandtailed':('small','Patagioenas fasciata'),'animal_prairiechicken':('small','Tympanuchus cupido'),
 'animal_quail':('small','Callipepla californica'),'animal_raven':('small','Corvus corax'),'animal_robin':('tiny','Turdus migratorius'),
 'animal_rooster_dominique':('small','Gallus gallus domesticus'),'animal_songbird_scarlet':('tiny','Piranga olivacea'),'animal_songbird_western':('tiny','Piranga ludoviciana'),
 'animal_sparrow_eurasian':('tiny','Passer montanus'),'animal_roseatespoonbill':('medium','Platalea ajaja'),'animal_turkey_eastern':('medium','Meleagris gallopavo'),
 'animal_vulture_western':('medium','Cathartes aura'),'animal_vulture_eastern':('medium','Coragyps atratus'),'animal_cedarwaxwing':('tiny','Bombycilla cedrorum'),
 'animal_woodpecker_redbellied':('tiny','Melanerpes carolinus'),
}
LEGEND_LATIN = {'alligator':'Alligator mississippiensis','grizzly-bear':'Ursus arctos horribilis','beaver':'Castor canadensis','boar':'Sus scrofa','buck':'Odocoileus virginianus',
 'cougar':'Puma concolor','coyote':'Canis latrans','elk':'Cervus canadensis','fox':'Vulpes vulpes','moose':'Alces alces','panther':'Puma concolor',
 'pronghorn':'Antilocapra americana','ram':'Ovis canadensis','tatanka-bison':'Bison bison','white-bison':'Bison bison','wolf':'Canis lupus'}

def info(key, group, cond):
  night = '(night)' in cond
  if group == 'Birds':
    size, latin = BIRD.get(key, ('small', None))
    temper, note = 'Harmless', ('Shoot it in flight or while perched; ' + ('mostly active at night.' if night else 'most active in daylight.'))
  elif group == 'Wild horses':
    size, temper, note, latin = 'massive', 'Skittish', 'Approach slowly and calm it, then lasso and break it (Horseman challenges). Don\'t shoot it.', 'Equus caballus'
  elif group in ('Fish', 'Legendary fish'):
    return {}
  else:
    size, temper, note, latin = S.get(key, ('medium', 'Skittish', '', None))
  label, weapon, ammo, alt, aim = SIZE[size]
  tips = []
  if group not in ('Wild horses',):
    tips.append('Study it with binoculars first and only hunt 3-star animals: lower stars can never give a perfect pelt.')
  if temper in ('Very dangerous', 'Dangerous'):
    tips.append('Predator: predator bait draws it in; keep your horse close.')
  elif group == 'Animals' and size in ('large', 'massive') and temper == 'Skittish':
    tips.append('Herbivore bait plus cover scent lotion lets you get close.')
  if night: tips.append('Most spawn spots are only active at night.')
  out = {'size': label, 'temper': temper, 'tips': ([note] if note else []) + tips}
  if group != 'Wild horses': out['kit'] = [weapon, ammo, alt, aim]
  if latin: out['latin'] = latin
  return out
