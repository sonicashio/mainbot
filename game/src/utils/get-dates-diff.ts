export interface DateDiff {
    year: number;
    month: number;
    week: number;
    day: number;
    hour: number;
    minute: number;
    second: number;

    [key: string]: number;
}

export function getDateDiff(dateFuture: number, dateNow: number): DateDiff {
    let d: number = Math.abs(dateFuture - dateNow) / 1000; // delta
    const s: DateDiff = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    const r: { [key: string]: number } = {};
    Object.keys(s).forEach((key) => {
        r[key] = Math.floor(d / s[key]);
        d -= r[key] * s[key];
    });

    return r as DateDiff;
}

export function getFormattedDateDiff(dateFuture: number, dateNow: number): string {
    const diff = getDateDiff(dateFuture, dateNow);
    return Object.keys(diff)
        .filter(key => diff[key] > 0)
        .map(key => `${diff[key]} ${key}${diff[key] > 1 ? "s" : ""}`)
        .join(", ");
}
