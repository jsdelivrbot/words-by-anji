// @flow

class Action{
  type: string;

  constructor(type: string) {
    this.type = type;
  }
}

class EventCycle<State> {
  state: State;
  render: (prev: ?State, curr: State) => void;
  reducers: Array<(action: Action, state: State) => State>;

  constructor(config: {state: State, render: (prev: ?State, curr: State) => void}) {
    this.state = config.state;
    this.render = config.render;
    this.reducers = [];
    this.render(null, this.state);
  }

  _handleDispatch(action: Action, state: State): State {
    return this.reducers.reduce(
      (state, reducer) => reducer(action, state),
      state,
    );
  }

  dispatch(action: Action) {
    const prev = this.state;
    this.state = this._handleDispatch(action, this.state);
    this.render(prev, this.state);
  }

  register(reducer: (action: Action, state: State) => State) {
    this.reducers.push(reducer);
  }
}
module.exports = {
  EventCycle,
  Action,
};
