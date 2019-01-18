/*
 Each call of wrapped `func` will be delayed until the previous call is finished.
 It helps to avoid race condition when `func` called multiple times simultaneously
 */
export function runInQueue<F>(func: () => Promise<F>, timeToPoll = 100): () => Promise<F> {
    let isRunning = false;

    function waitForNotRunning() {
        return new Promise((resolve) => {
            const check = () => {
                if (!isRunning) {
                    resolve();
                } else {
                    setTimeout(check, timeToPoll);
                }
            };

            check();
        });
    }

    return async () => {
        try {
            await waitForNotRunning();
            isRunning = true;

            return await func();
        } finally {
            isRunning = false;
        }
    };
}
