type StringKV = { [key: string]: string | null };

export function queryStringToJson(queryString: string): unknown {
    function urlSafeDecode(urlencoded: string): string {
        try {
            urlencoded = urlencoded.replace(/\+/g, "%20");
            return decodeURIComponent(urlencoded);
        } catch {
            return urlencoded;
        }
    }

    function urlParseQueryString(queryString: string): StringKV {
        const params: StringKV = {};
        if (!queryString.length) {
            return params;
        }

        const queryStringParams = queryString.split("&");
        for (let i = 0; i < queryStringParams.length; i++) {
            const param = queryStringParams[i].split("=");
            const paramName = urlSafeDecode(param[0]);
            const paramValue = param[1] == null ? null : urlSafeDecode(param[1]);

            params[paramName] = paramValue;
        }

        return params;
    }

    const params: StringKV = urlParseQueryString(queryString);

    for (const key in params) {
        const val: string | null = params[key];
        if (val === null) {
            params[key] = null;
            continue;
        }

        try {
            if ((val.slice(0, 1) == "{" && val.slice(-1) == "}") || (val.slice(0, 1) == "[" && val.slice(-1) == "]")) {
                params[key] = JSON.parse(val);
            }
        } catch { /* empty */ }
    }

    return params;
}
