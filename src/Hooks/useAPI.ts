import {message} from "antd";

type UseAPI = {
    post: <T>(url: string, replacer: Record<string, string>, body: any, params?: URLSearchParams) => Promise<T>;
    get: <T>(url: string, replacer: Record<string, string>, params?: URLSearchParams) => Promise<T>;
    put: <T>(url: string, replacer: Record<string, string>, body: any, params?: URLSearchParams) => Promise<T>;
    remove: <T>(url: string, replacer: Record<string, string>, params?: URLSearchParams) => Promise<T>;
}

type UseAPIProps = {
    root: string;
    defaultParams: URLSearchParams;
}

export const useAPI = (props: UseAPIProps): UseAPI => {
    const _buildUrl = (url: string, replacer: Record<string, string>, params?: URLSearchParams): string => {
        let replacedUrl = Object.entries(replacer).reduce((prev, cur) => {
            return prev.replace(cur[0], cur[1]);
        }, url)
        return props.root.concat(replacedUrl).concat(replacedUrl.includes("?") ? "&" : "?").concat(`${params?.toString() || ""}`).concat(`${props.defaultParams.toString() || ""}`);
    }

    const _log = (msg: string) => {
        console.log("API: " + message);
    }

    const get = <T>(url: string, replacer: Record<string, string>, params: URLSearchParams): Promise<T> => {
        return new Promise((res, rej) => {
            fetch(_buildUrl(url, replacer, params), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    _log(`Response: ${response.status} ${response.statusText}`);
                    return res(response.json());
                })
                .catch(err => {
                    rej(err);
                    _log(err);
                });
        })
    }

    const post = <T>(url: string, replacer: Record<string, string>, body: any, params?: URLSearchParams): Promise<T> => {
        return new Promise((res, rej) => {
            fetch(_buildUrl(url, replacer, params), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: (new URLSearchParams(body)).toString()
            })
                .then(response => {
                    _log(`Response: ${response.status} ${response.statusText}`);
                    return res(response.json() as T);
                })
                .catch(err => {
                    rej(err);
                    _log(err);
                });
        })
    }

    const put = <T>(url: string, replacer: Record<string, string>, body: any, params?: URLSearchParams): Promise<T> => {
        return new Promise((res, rej) => {
            fetch(_buildUrl(url, replacer, params), {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: (new URLSearchParams(body)).toString()
            })
                .then(response => {
                    _log(`Response: ${response.status} ${response.statusText}`);
                    return res(response.json() as T);
                })
                .catch(err => {
                    rej(err);
                    _log(err);
                });
        })
    }

    const remove = <T>(url: string, replacer: Record<string, string>, params?: URLSearchParams): Promise<T> => {
        return new Promise((res, rej) => {
            fetch(_buildUrl(url, replacer, params), {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    _log(`Response: ${response.status} ${response.statusText}`);
                    return res(response.json() as T);
                })
                .catch(err => {
                    rej(err);
                    _log(err);
                });
        })
    }

    return {
        get,
        post,
        put,
        remove
    }
}