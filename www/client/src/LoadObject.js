// @flow

type Status = 'loaded' | 'loading' | 'error';

function nullthrows<T>(data?: ?T): T {
  if (data == null) {
    throw new Error('this is null');
  }
  return (data: T);
}

class LoadObject<T> {
  data: ?T;
  error: ?Error;
  status: Status;
  constructor(status: Status, data?: T, error: ?Error) {
    this.status = status;
    this.data = data || null;
    this.error = error || null;
  }

  static loaded(data: T): LoadObject<T> {
    return new LoadObject('loaded', data);
  }

  static loading(data?: T): LoadObject<T> {
    return new LoadObject('loading', data);
  }

  static error(error: Error): LoadObject<*> {
    return new LoadObject('error', null, error);
  }

  fail(error: Error): LoadObject<T> {
    return LoadObject.error(error);
  }

  finish(data: T): LoadObject<T> {
    if (this.status !== 'loading') {
      throw new Error('data is not loading');
    }

    return LoadObject.loaded(data);
  }

  apply<D>(matchers: {
    loaded: (data: T) => D,
    loading: (data: ?T) => D,
    error: (error: Error) => D,
  }): D {
    switch (this.status) {
      case 'loaded':
        return matchers.loaded(nullthrows(this.data));
      case 'loading':
        return matchers.loading(this.data);
      case 'error':
        return matchers.error(nullthrows(this.error));
      default:
        (this.status: empty);
    }
    throw new Error('unreachable matcher');
  }
}

module.exports = LoadObject;
