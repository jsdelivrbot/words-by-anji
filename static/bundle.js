/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/static/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {



const clientEnv = __webpack_require__(3);

function getWords({ done, error }) {
  fetch(`${clientEnv.api_url}/words`, { method: 'GET', mode: 'cors' }).then(resp => resp.json().then(json => done(json), err => {
    console.log(err);
    error(err);
  }), err => console.log(err));
}

const WordsAPI = {
  getWords
};

module.exports = WordsAPI;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const WordsAPI = __webpack_require__(0);
const Entry = __webpack_require__(4);

__webpack_require__(0).getWords({
  done: words => {
    console.log(words);
    words.forEach((word, idx) => entries.append(Entry.render({
      index: words.length - idx,
      entry: word
    })));
  },
  error: err => console.log(err.message)
});

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = {"api_url":"http://localhost:5000"}

/***/ }),
/* 4 */
/***/ (function(module, exports) {

function render({ index, entry }) {
  const { definition } = entry.data;
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
    div.getElementsByClassName('word-audio')[0].play();
  };
  return div;
}

const Entry = {
  render
};

module.exports = Entry;

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map