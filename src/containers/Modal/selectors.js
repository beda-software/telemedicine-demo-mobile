import { createSelector } from 'reselect';

export const selectModal = (state) => state.modal;

export const selectIsModalVisible = createSelector(
    selectModal,
    (modalState) => modalState.isVisible,
);

export const selectModalText = createSelector(
    selectModal,
    (modalState) => modalState.text,
);
