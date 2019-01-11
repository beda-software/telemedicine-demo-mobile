import { createAction } from 'redux-act';

export const login = createAction((values) => ({ values }));
export const loginSuccess = createAction();
export const loginFailed = createAction((error) => ({ error }));
export const voxImplantLogin = createAction();
