// @flow

function nullthrows<T>(d: ?T): T {
  if (!d) {
    throw new Error('something should be not null');
  }

  return d;
}

function debounce(fn: (a: any, b: any) => void, ms: number = 500) {
  let last: number = 0;
  let token: ?TimeoutID = null;

  const debounced = (a: any, b: any, auto: boolean = false) => {
    const next = Date.now();
    if (next - last < ms && token) {
      last = next;
      clearTimeout(token);
      token = setTimeout(() => {
        fn(a, b);
        token = null;
      }, ms / 2);
      return;
    }

    token = setTimeout(() => {
      fn(a, b);
      token = null;
    }, ms / 2);
  };
  return debounced;
}


module.exports = {
  nullthrows,
  debounce,
};
