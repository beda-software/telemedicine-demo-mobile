import { Cursor } from 'src/contrib/typed-baobab';
import { failure, loading, RemoteData, RemoteDataResult, success } from 'src/libs/schema';

export interface Subscribable<T> {
    on: (eventName: string, callback: (event: T) => void) => void;
    off: (eventName: string, callback: (event: T) => void) => void;
}

export async function wrapService<T>(
    cursor: Cursor<RemoteData<T>>,
    fn: () => Promise<T>
): Promise<RemoteDataResult<T>> {
    cursor.set(loading);

    try {
        const result = success(await fn());
        cursor.set(result);

        return result;
    } catch (err) {
        const result = failure(err);
        cursor.set(result);

        return result;
    }
}

// TODO: pass action-function into catchEvent
export function catchEvent<T>(
    service: Subscribable<T>,
    eventName: string,
    predicate = (data: T) => true,
    asyncTimeout = 10000
) {
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            service.off(eventName, handler);
            reject({ message: 'No events caught' });
        }, asyncTimeout);

        function handler(event: T) {
            console.log('CAUGHT', event);
            if (!predicate(event)) {
                return;
            }

            clearTimeout(timeout);
            service.off(eventName, handler);

            resolve(event);
        }

        service.on(eventName, handler);
    });
}
