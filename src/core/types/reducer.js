// @flow

type PromiseAction<A> = Promise<A>;

// eslint-disable-next-line no-use-before-define
type Dispatch<A, S> = (action: A | ThunkAction<A, S> | PromiseAction<A>) => any;

type GetState<S> = () => S;

export type ThunkAction<A, S> = (dispatch: Dispatch<A, S>, getState: GetState<S>) => any;
