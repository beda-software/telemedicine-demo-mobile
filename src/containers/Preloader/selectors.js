import { createSelector } from 'reselect';

export const selectPreloader = (state) => state.preloader;

export const selectIsPreloaderVisible = createSelector(
    selectPreloader,
    (preloaderState) => preloaderState.isVisible
);
