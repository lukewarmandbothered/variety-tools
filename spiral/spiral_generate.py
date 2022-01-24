#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Spiral-generating code

Created on Fri Jan 14 14:21:10 2022

@author: Alex Boisvert
"""
import itertools

# The smallest length for words in the spiral
MIN_WORD_LENGTH = 4
# The minimum overlap of words
MIN_OVERLAP = 2
# Minimum score of word list entries
MIN_SCORE = 70

# Initial pass through word list
all_words = set()
beginnings = set()
ends = set()

#%% Helper functions

# Make partitions of a string
def multiSlice(s, cutpoints):
    """
    Helper function for allPartitions
    """
    k = len(cutpoints)
    if k == 0:
        return [s]
    else:
        multislices = [s[:cutpoints[0]]]
        multislices.extend(s[cutpoints[i]:cutpoints[i+1]] for i in range(k-1))
        multislices.append(s[cutpoints[k-1]:])
        return multislices

# This includes partitions of length 0
def allPartitions(s, num=None):
    n = len(s)
    cuts = list(range(0,n+1))
    if num:
        num_arr = [num-1]
    else:
        num_arr = range(n)
    for k in num_arr:
        for cutpoints in itertools.combinations_with_replacement(cuts,k):
            yield multiSlice(s,cutpoints)


#%% Read in word list
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
                this_word = (word, None)
                begin_dict[w1] = begin_dict.get(w1, set()).union([this_word])
                end_dict[w2] = end_dict.get(w2, set()).union([this_word])
                gw.add(word)
    #prev_word_count = len(good_words)
    #new_word_count = len(gw)
    good_words = gw.copy()
    
    prev_word_count = len(beginnings)
    beginnings = set(begin_dict.keys())
    ends = set(end_dict.keys())
    new_word_count = len(beginnings)
    
    
print(len(good_words))

# Now add any words that have a hidden word in them
# but that still work with a beginning / end
for word in all_words:
    for p in allPartitions(word, 3):
        w1, w_m, w2 = p
        bw1, bw_m, bw2 = w1[::-1], w_m[::-1], w2[::-1]
        if bw1 in beginnings and bw2 in ends and bw_m in all_words:
            this_word = (word, bw_m)
            begin_dict[w1] = begin_dict.get(w1, set()).union([this_word])
            end_dict[w2] = end_dict.get(w2, set()).union([this_word])
            good_words.add(word)
            
print(len(good_words))

    

#%%
forward_words = []
backward_words = []

forward_words = ['REDLOBSTER']
backward_words = ['BOLDER']

#forward_words = '''GARDENING ROBROY AMINOR OMEGA TOOFAR AGAINST OPEDPAGE DARTED ISAIDNO IBET'''.split(' ')
#backward_words = '''BIONDI ASIDE TRADEGAP DEPOTS NIAGARA FOOTAGE MORONI MAYOR BORGNINE DRAG'''.split(' ')

forward_word = forward_words[-1]
backward_word = backward_words[0]
new_len = len(''.join(forward_words)) - len(''.join(backward_words))
end_string = forward_word[-new_len:][::-1]

def new_word_options(forward_words, backward_words):
    this_word = forward_words[-1]
    new_len = len(''.join(forward_words)) - len(''.join(backward_words))
    this_dict = end_dict
    if new_len < 0:
        this_word = backward_words[0]
        new_len = -1 * new_len
        this_dict = begin_dict
        this_str = this_word[:new_len][::-1]
    else:
        this_str = this_word[-new_len:][::-1]
    return this_dict[this_str]

def add_word(forward_words, backward_words, this_word):
    new_len = len(''.join(forward_words)) - len(''.join(backward_words))
    w0, w1 = this_word
    if new_len > 0: # add "main" word to backwards words
        backward_words = [w0] + backward_words
        if w1:
            forward_words.append(w1)
    else:
        forward_words.append(w0)
        if w1:
            backward_words = [w1] + backward_words
    return forward_words, backward_words

def remove_last_word(forward_words, backward_words):
    pass

#%% The main loop
while True:
    print(new_word_options(forward_words, backward_words))
    _input = input().strip().upper().split(',')
    if len(_input) == 1:
        _input = [_input[0], None]
    forward_words, backward_words = add_word(forward_words, backward_words, _input)
    
    print(' '.join(forward_words))
    print(' '.join(backward_words))
    print(len(''.join(forward_words)))
    