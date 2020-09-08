import sys
import os.path
import random

import json

#Root directory
ROOT_DIR = os.path.expanduser('~/Documents/01. School Projects/UC Classes/04. Junior/01. Interaction Design/02. Projects/02. Tag Platform/04. Build/application/models/')

# ===============
#  Configuration
# ===============

CONFIG = { }
CONFIG['match_count'] = 80;
CONFIG['play_times'] = ['05:00','06:00','07:00','08:00','09:00','10:00','11:00']
CONFIG['match_titles'] = [
	"League Night - Rumble in the Jungle!",
	"(CS:GO) Friday Night Frags! (Week 4)",
	"Team Action Sack (ZOMBIES!) (Reach)",
]

# ==================
#  Script Functions
# ==================

def getRandomDate():
	return '2013-' + str(random.randint(11,12)).zfill(2) + '-' + str(random.randint(0,28)).zfill(2)

def getRandomTime():
	return CONFIG['play_times'][random.randint(0, len(CONFIG['play_times']) - 1)]

def getRandomTitle():
	return random.randint(0,2)

def getRandomTeamPair():
	a = random.randint(0,3)
	b = random.randint(0,3)
	while(a == b):
		b = random.randint(0,3)
	return [a,b]

# ==============
#  Begin Script
# ==============

#Create an empty Python dictionary to be saved as a JSON object
matches = [ ]

for id in range(0,CONFIG['match_count']):
	teams = getRandomTeamPair()
	match = { }
	match['id'] = id
	match['offered_by'] = teams[0]
	match['offered_to'] = teams[1]
	match['accepted'] = bool(random.randint(0,5)) #20% of matches have beeb accepted
	match['time'] = getRandomDate() + 'T' + getRandomTime()
	
	#Conditionally add a winner
	if(match['time'][5:7] == '11' or (
	   match['time'][5:7] == '12' and int(match['time'][8:10]) < 9)):
		match['winner'] = teams[random.randint(0,1)]
	
	match['title'] = random.randint(0,2)
	match['bounty'] = random.randrange(15,51,5)
	match['match_title'] = CONFIG['match_titles'][match['title']]
	match['match_desc'] = 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos'
	matches.append(match)

#Create (or overwrite) an output file with new JSON
outputFile = open(ROOT_DIR + 'generated_matches.json', 'w+')
outputFile.write(json.dumps(matches, indent = 4))
outputFile.close()

