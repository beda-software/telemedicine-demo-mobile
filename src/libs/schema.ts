import { Cursor } from '../contrib/typed-baobab';

type Initializer<k> = k | ((tree: Cursor<k>) => void);

export type CursorInitializer<M = any> = { [k in keyof M]: Initializer<M[k]> };

enum Status {
    Success,
    Failure,
    Loading,
    NotAsked,
}

interface RemoteDataNotAsked {
    status: Status.NotAsked;
}

export const notAsked: RemoteDataNotAsked = {
    status: Status.NotAsked,
};

interface RemoteDataLoading {
    status: Status.Loading;
}

export const loading: RemoteDataLoading = {
    status: Status.Loading,
};

interface RemoteDataSuccess<s> {
    status: Status.Success;
    data: s;
}

export function success<d = any>(data: d): RemoteDataSuccess<d> {
    return {
        status: Status.Success,
        data,
    };
}

interface RemoteDataFailure<f> {
    status: Status.Failure;
    error: f;
}

export function failure<e = any>(error: e): RemoteDataFailure<e> {
    return {
        status: Status.Failure,
        error,
    };
}

export type RemoteData<s = any, f = any> =
    | RemoteDataNotAsked
    | RemoteDataLoading
    | RemoteDataSuccess<s>
    | RemoteDataFailure<f>;

export function isNotAsked(remoteData: RemoteData): remoteData is RemoteDataNotAsked {
    return remoteData.status === Status.NotAsked;
}

export function isLoading(remoteData: RemoteData): remoteData is RemoteDataLoading {
    return remoteData.status === Status.Loading;
}

export function isSuccess<S>(remoteData: RemoteData<S>): remoteData is RemoteDataSuccess<S> {
    return remoteData.status === Status.Success;
}

export function isFailure<F>(remoteData: RemoteData<any, F>): remoteData is RemoteDataFailure<F> {
    return remoteData.status === Status.Failure;
}

export function isNotAskedCursor<S, F>(
    remoteDataCursor: Cursor<RemoteData<S, F>>
): remoteDataCursor is Cursor<RemoteDataNotAsked> {
    return remoteDataCursor.status.get() === Status.NotAsked;
}

export function isLoadingCursor<S, F>(
    remoteDataCursor: Cursor<RemoteData<S, F>>
): remoteDataCursor is Cursor<RemoteDataLoading> {
    return remoteDataCursor.status.get() === Status.Loading;
}

export function isFailureCursor<S, F>(
    remoteDataCursor: Cursor<RemoteData<S, F>>
): remoteDataCursor is Cursor<RemoteDataFailure<F>> {
    return remoteDataCursor.status.get() === Status.Failure;
}

export function isSuccessCursor<S, F>(
    remoteDataCursor: Cursor<RemoteData<S, F>>
): remoteDataCursor is Cursor<RemoteDataSuccess<S>> {
    return remoteDataCursor.status.get() === Status.Success;
}
