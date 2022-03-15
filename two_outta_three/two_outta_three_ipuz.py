# -*- coding: utf-8 -*-
"""
Created on Sun Mar 13 21:12:26 2022

@author: Alex Boisvert

Convert an iPuz from CrossFire into a "two outta three ain't bad" iPuz file
"""

import json
import re

filename = r'supermajority.ipuz'

with open(filename, 'r') as fid:
    puz = json.load(fid)
    
#%% Do some bookeeping
puz['fakeclues'] = True
# First, sort the components of the clues (just to be safe)
# and make them uppercase
# and remove the numbers
# then sort the clue list
clues = puz['clues']
for key, cluelist in clues.items():
    new_clue_arr = []
    for clue_arr in cluelist:
        num, clue = clue_arr
        clue = clue.upper()
        w1, w2 = re.split(r'\s+\/\s+', clue)
        new_clue = ' / '.join(sorted([w1, w2]))
        new_clue_arr.append(['', new_clue])
    new_clue_arr = sorted(new_clue_arr, key=lambda x: x[1])
    clues[key] = new_clue_arr
    
# Also write the "notes" part to be the "intro" part
if puz['intro']:
    puz['notes'] = puz['intro']

#%% Write the file
with open(filename, 'w') as fid:
    json.dump(puz, fid, indent=2)
