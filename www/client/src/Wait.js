// @flow

function wait<T>(p: Promise<T>, ms: number = 2000): Promise<T> {
  const busy = new Promise((resolve, reject) => setTimeout(resolve, ms));
  return Promise.all([busy, p]).then(
    values => values[1]
  );
}

module.exports = wait;
