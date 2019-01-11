type SubType<T, K extends keyof T> = T[K];

interface GetSet<M> {
    get: () => Readonly<M>,
    set: (x: M) => void,
    apply: (fun: ((x: M) => M)) => void,
}

type CursorSelection<M> = {[K in keyof M]: Cursor<SubType<M, K>>}

export type Cursor<M=any> = GetSet<M> & CursorSelection<M>;

export function getTree<M>(initialData: M, options: any): Cursor<M>;
