export function firstCharsNameOfUserData<T>(obj: T & { username?: string; firstName: string; lastName?: string }): string {
    if (obj.username) {
        return obj.username[0].toUpperCase();
    }

    if (obj.firstName && obj.lastName) {
        return obj.firstName[0].toUpperCase() + obj.lastName[0].toUpperCase();
    }

    return obj.firstName[0].toUpperCase();
}
