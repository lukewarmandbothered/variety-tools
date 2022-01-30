/* Helper function to reverse a string */
function reverseString(str) {
    return str.split("").reverse().join("");
}

function new_word_options(forward_words, backward_words) {
  // The maximum number of words to return
  MAX_RET_WORDS = 20;
  // Find the words we've already used
  var used_words = new Set(forward_words.concat(backward_words));
  // Get the last word
  var this_word = forward_words[forward_words.length - 1];
  // To find out where we need to add a new word
  var new_len = forward_words.join('').length - backward_words.join('').length;
  var this_dict = window.spiralData['end'];
  var this_str;
  // Switch to "begin" depending on new_len
  if (new_len < 0) {
    this_word = backward_words[backward_words.length - 1];
    new_len = -1 * new_len;
    this_dict = window.spiralData['begin'];
    this_str = reverseString(this_word.substr(0, new_len));
  }
  else {
    this_str = reverseString(this_word.substr(this_word.length - new_len));
  }
  // Get our initial return words
  var ret = this_dict[this_str];
  // Sort this by score descending
  ret.sort(function(x, y) {return y['score'] - x['score'];})
  var ret2 = [];
  // Remove anything that's already been used
  ret.forEach(function (r) {
    var good_word = True
    r.forEach(function(w) {
      if used_words.has(w) {
        good_word = False;
      }
    });
    if (good_word) {
      ret2.push(r);
    }
  });
  return ret2.slice(0, MAX_RET_WORDS);
}

/* add a word or pair of words to the relevant place */
function add_word(forward_words, backward_words, this_word) {
  var new_len = forward_words.join('').length - backward_words.join('').length;
  var w0 = this_word[0]; var w1 = this_word[1];
  if (new_len > 0 ) {
    // add "main" word to backwards words
    backward_words = [w0].concat(backward_words);
    if (w1) {
      forward_words.push(w1);
    }
  }
  else {
    forward_words.push(w0);
    if (w1) {
      backward_words = [w1].concat(backward_words);
    }
  }
  return [forward_words, backward_words];
}

/* Process the words in the textareas and write results */
