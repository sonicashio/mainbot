import CryptoJS from "crypto-js";

export function validateTelegramData(tgBotToken: string, tgInitData: string): boolean {
    const initData = new URLSearchParams(tgInitData);
    const initDataHash: string | null = initData.get("hash");
    const dataToCheck: string[] = [];

    initData.sort();
    initData.forEach((val, key) => key !== "hash" && dataToCheck.push(`${key}=${val}`));

    const fianlDataToCheck: string = dataToCheck.join("\n");

    // Mini app hash validation
    const miniAppSecret = CryptoJS.HmacSHA256(tgBotToken, "WebAppData");
    const miniAppHash = CryptoJS.HmacSHA256(fianlDataToCheck, miniAppSecret).toString(CryptoJS.enc.Hex);

    if (initDataHash === miniAppHash) {
        return true;
    }

    // Widget hash validation
    const widgetSecret = CryptoJS.SHA256(tgBotToken);
    const widgetHash = CryptoJS.HmacSHA256(fianlDataToCheck, widgetSecret).toString(CryptoJS.enc.Hex);

    return initDataHash === widgetHash;
}