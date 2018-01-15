// @flow

const WordsAPI = require('./WordsAPI.js');
const Entry = require('./Entry.js');

const preloadedWords = document.getElementById('preloaded');

function renderWords(words) {
  const entries: any = document.getElementById('entries');
  words.forEach((word, idx) => entries.append(
    Entry.render({
      index: words.length - idx,
      entry: word,
    }),
  ));
}

if(!preloadedWords || !preloadedWords.innerHTML) {
  require('./WordsAPI.js').getWords({
    done: renderWords,
    error: (err) => console.log(err.message),
  });
} else {
  renderWords(JSON.parse(preloadedWords.innerHTML));
}
