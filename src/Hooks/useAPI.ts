type UseAPI = {
    post: <T>(url: string, replacer: Record<string, string>, body: any, params?: URLSearchParams, headers?: Headers) => Promise<T>;
    postForFile: <T>(url: string, replacer: Record<string, string>, body: any, params?: URLSearchParams, headers?: Headers) => Promise<T>;
    get: <T>(url: string, replacer: Record<string, string>, params?: URLSearchParams) => Promise<T>;
    put: <T>(url: string, replacer: Record<string, string>, body: any, params?: URLSearchParams, headers?: Headers) => Promise<T>;
    remove: <T>(url: string, replacer: Record<string, string>, params?: URLSearchParams) => Promise<T>;
}

type UseAPIProps = {
    root: string;
    defaultParams: URLSearchParams;
}

export type UseAPIError = Error & {
    status: number;
    statusText: string;
    body: unknown;
    url: string;
    method: string;
}

export const useAPI = (props: UseAPIProps): UseAPI => {
    const _buildUrl = (url: string, replacer: Record<string, string>, params?: URLSearchParams): string => {
        let replacedUrl = Object.entries(replacer).reduce((prev, cur) => {
            return prev.replace(cur[0], cur[1]);
        }, url)

        const root = props.root.endsWith("/") ? props.root.slice(0, -1) : props.root;
        const path = replacedUrl.startsWith("/") ? replacedUrl : `/${replacedUrl}`;
        const targetUrl = new URL(`${root}${path}`);
        [params, props.defaultParams].forEach(searchParams => {
            searchParams?.forEach((value, key) => {
                targetUrl.searchParams.append(key, value);
            });
        });
        return targetUrl.toString();
    }

    const _log = (msg: string) => {
        console.log("API: " + msg);
    }

    const _readBody = async (response: Response): Promise<unknown> => {
        const text = await response.text();
        if (!text) return null;
        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    }

    const _buildHeaders = (defaults: Record<string, string>, headers?: Headers): Headers => {
        const combinedHeaders = new Headers(defaults);
        headers?.forEach((value, key) => {
            combinedHeaders.set(key, value);
        });
        return combinedHeaders;
    }

    const _createHTTPError = (response: Response, body: unknown, url: string, method: string): UseAPIError => {
        const error = new Error(`HTTP ${response.status} ${response.statusText}`) as UseAPIError;
        error.status = response.status;
        error.statusText = response.statusText;
        error.body = body;
        error.url = url;
        error.method = method;
        return error;
    }

    const _request = async <T>(url: string, replacer: Record<string, string>, init: RequestInit, params?: URLSearchParams): Promise<T> => {
        const method = init.method || "GET";
        const requestUrl = _buildUrl(url, replacer, params);
        try {
            const response = await fetch(requestUrl, init);
            const body = await _readBody(response);
            _log(`Response: ${response.status} ${response.statusText}`);
            if (!response.ok) throw _createHTTPError(response, body, requestUrl, method);
            return body as T;
        } catch (err) {
            _log(err instanceof Error ? err.message : String(err));
            throw err;
        }
    }

    const get = <T>(url: string, replacer: Record<string, string>, params?: URLSearchParams): Promise<T> => {
        return _request<T>(url, replacer, {
            method: 'GET',
            headers: _buildHeaders({
                'Accept': 'application/json'
            })
        }, params)
    }

    const post = <T>(url: string, replacer: Record<string, string>, body: any, params?: URLSearchParams, headers?: Headers): Promise<T> => {
        return _request<T>(url, replacer, {
            method: 'POST',
            headers: _buildHeaders({
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            }, headers),
            body: (new URLSearchParams(body || {})).toString()
        }, params)
    }

    const postForFile = <T>(url: string, replacer: Record<string, string>, body: any, params?: URLSearchParams, headers?: Headers): Promise<T> => {
        return _request<T>(url, replacer, {
            method: 'POST',
            headers: _buildHeaders({
                "Accept": "application/json"
            }, headers),
            body: body
        }, params)
    }

    const put = <T>(url: string, replacer: Record<string, string>, body: any, params?: URLSearchParams, headers?: Headers): Promise<T> => {
        return _request<T>(url, replacer, {
            method: 'PUT',
            headers: _buildHeaders({
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            }, headers),
            body: (new URLSearchParams(body || {})).toString()
        }, params)
    }

    const remove = <T>(url: string, replacer: Record<string, string>, params?: URLSearchParams): Promise<T> => {
        return _request<T>(url, replacer, {
            method: 'DELETE',
            headers: _buildHeaders({
                'Accept': 'application/json'
            })
        }, params)
    }

    return {
        get,
        post,
        put,
        remove,
        postForFile
    }
}
