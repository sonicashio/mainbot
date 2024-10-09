export class Result<T, E extends Error = Error> {
    #ok: T | null;
    #err: E | null;

    constructor(ok: T | null, err: E | null) {
        if (!ok && !err) {
            throw new Error("Result must have a value or an error");
        }
        if (ok && err) {
            throw new Error("Result cannot have both a value and and error");
        }

        if (ok !== null) {
            this.#ok = ok;
            this.#err = null;
        } else {
            this.#ok = null;
            this.#err = err as E;
        }
    }

    public static ok<T>(value: T): Result<T, Error> {
        return new Result(value, null);
    }

    public static err<E extends Error>(error: E): Result<never, E> {
        return new Result(<never>null, error);
    }

    public unwrap(): T {
        if (this.isOk()) {
            return this.#ok as T;
        }

        if (this.isErr()) {
            throw this.#err as E;
        }

        throw new Error("Unknown error");
    }

    public expect(msg: string): T {
        if (this.isOk()) {
            return this.#ok as T;
        }

        if (this.isErr()) {
            const err = this.#err as E;
            throw (err.message = msg + ":\n " + err.message);
        }

        throw new Error(msg);
    }

    public isOk(): this is Result<T, never> {
        return this.#ok !== null;
    }

    public isErr(): this is Result<never, E> {
        return this.#err !== null;
    }

    public getErr(): this extends Result<never, E> ? E : E | null {
        return this.#err as E;
    }
}
