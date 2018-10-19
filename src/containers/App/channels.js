import { eventChannel } from 'redux-saga';
import { AppState } from 'react-native';

export function createAppStateChangedChannel() {
    return eventChannel((emit) => {
        const handler = (newState) => {
            emit(newState);
        };
        AppState.addEventListener('change', handler);

        return () => {
            AppState.removeEventListener('change', handler);
        };
    });
}
