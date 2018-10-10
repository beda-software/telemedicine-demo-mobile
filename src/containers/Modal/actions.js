import { createAction } from 'redux-act';

export const showModal = createAction((text) => ({ text }));
export const hideModal = createAction();
