// @flow

const WordsAPI = require('./WordsAPI.js');
const Entry = require('./Entry.js');

require('./WordsAPI.js').getWords({
  done: words => {
    console.log(words);
    words.forEach((word, idx) => entries.append(
      Entry.render({
        index: words.length - idx,
        entry: word,
      }),
    ));
  },
  error: (err) => console.log(err.message),
})
