import { FetchError } from "ofetch";

// export function getErrorMsg(error: unknown): string {
//     if (error instanceof Error || (typeof error === "object" && error !== null)) {
//         if ("statusMessage" in error) {
//             return error.statusMessage as string;
//         }

//         if ("message" in error) {
//             return error.message as string;
//         }
//     }

//     return String(error);
// }

export function getErrorMsg(error: unknown): string {
    if (error instanceof FetchError) {
        const e = error as FetchError;
        // const status = e.response?.status ?? "Unknown Status";
        // const statusText = e.response?.statusText ?? "Unknown Status Text";
        // const hasMessage = e.data?.message !== undefined || e.data?.statusMessage !== undefined;

        if (e.data?.statusMessage) {
            return e.data?.statusMessage;
        }

        if (e.data?.message) {
            return e.data?.message;
        }

        return String(error);
    } else if (((typeof error === "object" && error !== null) && ("statusMessage" in error || "message" in error))) {
        const e = error as FetchError;

        if (e.statusMessage) {
            return e.statusMessage;
        }

        if (e.message) {
            return e.message;
        }

        return String(error);
    } else if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}
