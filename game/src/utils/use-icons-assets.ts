import { filename } from "pathe/utils";

export function useIconsAssets(): Record<string, string> {
    const glob = import.meta.glob("@/assets/img/icons/*.png", { eager: true });
    const files = Object.fromEntries(
        Object.entries(glob).map(([key, value]) => [
            filename(key),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            value.default,
        ]),
    );

    return files;
}
