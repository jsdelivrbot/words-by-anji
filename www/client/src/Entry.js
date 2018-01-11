// @flow

import type {Word} from './../../src/DataTypes.js';
import type {WithID} from './../../src/DB.js';

function render({index, entry}: {index: number, entry: WithID<Word>}) {
  const definition = entry.data;
  const pattern = `
    <div class="card u-clearfix">
      <div class="card-body">
        <span id="num" class="card-number card-circle subtle">${index}</span>
        <span id="spelling" class="card-author subtle">
          ${definition.spelling}
        </span>
        <h2 id="word" class="card-title">${entry.data.word}</h2>
        <span class="card-description">
          ${entry.data.context}
        </span>
        <span class="card-description subtle">
          Definition: ${definition.definition} <br>
          Example: ${definition.example}
        </span>
        </span>
      </div>
      <div class="card-media">
        <a href="#" >
        <div class="icon icon-play audio-control">
          <svg xmlns="http://www.w3.org/2000/svg" height="26" width="21" viewBox="0 0 21 26" id="play" y="58">
            <g transform="translate(-606 -232)" fill="#fff">
              <g id="play-Player" transform="translate(125 60)">
                <g id="play-Play" transform="translate(453 149)">
                  <path
                  d="m47.193 33.899l-7.721-5.346-6.666-4.615c-1.835-1.27-4.341 0.043-4.341 2.275v9.96 9.96c0 2.232 2.506 3.545 4.341 2.275l6.666-4.615 7.721-5.346c1.589-1.099 1.589-3.448 0-4.548z"/>
                </g>
              </g>
            </g>
          </svg>
          </a>
        </div>
        <audio class="word-audio">
          <source src="${definition.audio}" type="audio/mpeg" />
        </audio>
      </div>
    </div>
    <div class="card-shadow"></div>
  `;
  const div = document.createElement('div');
  div.innerHTML = pattern;
  div.className = "card-container";
  div.getElementsByClassName('audio-control')[0].onclick = () => {
    (div.getElementsByClassName('word-audio')[0]: any).play();
  };
  return div;
}

const Entry = {
  render,
}

module.exports = Entry;
