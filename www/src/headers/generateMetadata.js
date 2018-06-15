// @flow

import type {Word} from '../DataTypes.js';
import type {WithID} from '../DB.js';

const getLink = require('../routing/getLink.js');

function getRandomEntry(words: Array<WithID<Word>>): Word {
  const randomIndex = Math.floor(Math.random() * Math.floor(words.length));
  return words[randomIndex].data;
}

const TABLE = [];
for (let i = 0; i < 101; i++) {
  TABLE.push([]);
  for (let j = 0; j < 101; j++) {
    TABLE[i].push(0);
  }
}

/*
dp[i][0] = i;
dp[0][j] = j;

dp[i][j] = min(
  min(dp[i][j-1], dp[i-1][j]) + 1,
  dp[i-1][j-1] + (word[i] != hint[j]),
)
*/

function getMatchScore(e: Word, hint: string): number {
  const word = e.word.toLowerCase();
  if (word.trim() == hint) {
    return -1;
  }

  if (word.length > 100 || hint.length > 100) {
    return 100 + Math.random();
  }
  for (let i = 0; i < word.length; i++) {
    for (let j = 0; j < hint.length; j++) {
      if (j == 0) {
        TABLE[i][0] = i;
      } else if (i == 0) {
        TABLE[0][j] = j;
      } else {
        const removeOne = Math.min(TABLE[i][j-1], TABLE[i-1][j]) + 1;
        const match = (word[i] != hint[j]) + TABLE[i-1][j-1];
        TABLE[i][j] = Math.min(removeOne, match);
      }
    }
  }
  return TABLE[word.length-1][hint.length-1];
}

function getClosestMatch(
  words: Array<WithID<Word>>,
  hint: string,
): Word {
  hint = hint.toLowerCase();
  let word: Word = words[0].data;
  let score = getMatchScore(word, hint);
  words.forEach(cur => {
    const curScore = getMatchScore(cur.data, hint);
    if (score > curScore) {
      score = curScore;
      word = cur.data;
    }
  });
  return word;
}

function generateMetadata(
  words: Array<WithID<Word>>,
  hint: string,
): string {
  const entry = hint ? getClosestMatch(words, hint) : getRandomEntry(words);
  return `
    <meta
      property="og:image"
      content="${getLink('piyomaru.png', true)}"
    />
    <meta
      property="og:description"
      content="Get literate, one word at a time. '${entry.context} - by Anji'"
    />
    <meta
      property="og:url"
      content="https://andreq.me/words-by-anji${
        hint ? `/lucky/${hint.trim()}` : ''
      }"
    />
    <meta
      property="og:title"
      content="Words by Anji"
    />
  `;
}

module.exports = generateMetadata;
