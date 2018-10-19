import { createAction } from 'redux-act';

export const saveCallerDisplayName = createAction((callerDisplayName) => ({ callerDisplayName }));
