import { createAction } from 'redux-act';

export const signUp = createAction((values) => ({ values }));
export const signUpSuccess = createAction();
export const signUpFailed = createAction((error) => ({ error }));
