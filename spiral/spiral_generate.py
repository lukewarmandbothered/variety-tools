#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Spiral-generating code

Created on Fri Jan 14 14:21:10 2022

@author: Alex Boisvert
"""
# The smallest length for words in the spiral
MIN_WORD_LENGTH = 4
# The minimum overlap of words
MIN_OVERLAP = 2
# Minimum score of word list entries
MIN_SCORE = 80

# Initial pass through word list
all_words = set()
beginnings = set()
ends = set()

with open(r'xwordlist.dict', 'r') as fid:
    for line in fid:
        word, score = line.split(';')
        score = int(score)
        if score >= MIN_SCORE and len(word) >= MIN_WORD_LENGTH:
            all_words.add(word)
            # Partition the word to take the beginning and end parts
            for n in range(MIN_OVERLAP, len(word) - MIN_OVERLAP + 1):
                w1, w2 = word[:n], word[n:]
                beginnings.add(w1)
                ends.add(w2)

#%%
prev_word_count = 1e6
new_word_count = 0
good_words = all_words.copy()
# Now go through the words again to see if it's admissible

while new_word_count < prev_word_count:
    gw = set()
    starter_words = dict()
    begin_dict = dict()
    end_dict = dict()
    for word in good_words:
        for n in range(MIN_OVERLAP, len(word) - MIN_OVERLAP + 1):
            w1, w2 = word[:n], word[n:]
            bw1, bw2 = w1[::-1], w2[::-1]
            if bw1 in all_words and len(bw1) >= 4 and bw2 in ends:
                starter_words[word] = starter_words.get(word, set()).union([bw2])
            if bw1 in beginnings and bw2 in ends:
                begin_dict[w1] = begin_dict.get(w1, set()).union([word])
                end_dict[w2] = end_dict.get(w2, set()).union([word])
                gw.add(word)
    #prev_word_count = len(good_words)
    #new_word_count = len(gw)
    good_words = gw.copy()
    
    prev_word_count = len(beginnings)
    beginnings = set(begin_dict.keys())
    ends = set(end_dict.keys())
    new_word_count = len(beginnings)
    
    
print(len(good_words))
    

#%%
forward_words = []
backward_words = []

forward_words = ['GARDENING']
backward_words = ['DRAG']

forward_words = '''GARDENING ROBROY AMINOR OMEGA TOOFAR AGAINST OPEDPAGE DARTED ISAIDNO IBET'''.split(' ')
backward_words = '''BIONDI ASIDE TRADEGAP DEPOTS NIAGARA FOOTAGE MORONI MAYOR BORGNINE DRAG'''.split(' ')

forward_word = forward_words[-1]
backward_word = backward_words[0]
new_len = len(''.join(forward_words)) - len(''.join(backward_words))
end_string = forward_word[-new_len:][::-1]

while True:
    
    # Choose a "forward" word from the options
    print(end_dict[end_string])
    backward_word = input().strip().upper()
    backward_words = [backward_word] + backward_words
    forward_string = backward_word[:-len(end_string)][::-1]
    
    # Choose a "backward" word from the options
    print(begin_dict[forward_string])
    forward_word = input().strip().upper()
    forward_words.append(forward_word)
    
    print(len(''.join(forward_words)))
    print(' '.join(forward_words))
    print(' '.join(backward_words))
    print()
    
    new_len = len(forward_word) - len(forward_string)
    end_string = forward_word[-new_len:][::-1]
    
