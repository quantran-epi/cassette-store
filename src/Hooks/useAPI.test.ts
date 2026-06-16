import {useAPI} from "./useAPI";

const fetchMock = jest.fn();

const buildResponse = (body: unknown, overrides: Partial<Response> = {}): Response => ({
    ok: true,
    status: 200,
    statusText: "OK",
    text: jest.fn(() => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body))),
    ...overrides
} as Response);

const createAPI = () => useAPI({
    root: "https://api.example.test/1",
    defaultParams: new URLSearchParams({
        key: "key-value",
        token: "token-value"
    })
});

beforeEach(() => {
    fetchMock.mockReset();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    global.fetch = fetchMock as jest.Mock;
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("useAPI", () => {
    it("keeps endpoint, caller, and default query params as separate entries", async () => {
        fetchMock.mockResolvedValue(buildResponse({id: "card-1"}));
        const api = createAPI();

        await api.get("/cards?idList={idList}", {"{idList}": "list-1"}, new URLSearchParams({
            fields: "id,name"
        }));

        const requestedUrl = new URL(fetchMock.mock.calls[0][0]);
        expect(requestedUrl.toString()).toContain("/1/cards");
        expect(requestedUrl.searchParams.get("idList")).toBe("list-1");
        expect(requestedUrl.searchParams.get("fields")).toBe("id,name");
        expect(requestedUrl.searchParams.get("key")).toBe("key-value");
        expect(requestedUrl.searchParams.get("token")).toBe("token-value");
    });

    it("rejects non-2xx responses with HTTP status details", async () => {
        fetchMock.mockResolvedValue(buildResponse({message: "rate limited"}, {
            ok: false,
            status: 429,
            statusText: "Too Many Requests"
        }));
        const api = createAPI();

        await expect(api.get("/cards/{id}", {"{id}": "card-1"})).rejects.toMatchObject({
            status: 429,
            statusText: "Too Many Requests",
            body: {message: "rate limited"},
            method: "GET"
        });
    });

    it("returns parsed JSON for successful requests", async () => {
        fetchMock.mockResolvedValue(buildResponse({id: "card-1", name: "Order 1"}));
        const api = createAPI();

        await expect(api.get("/cards/{id}", {"{id}": "card-1"})).resolves.toEqual({
            id: "card-1",
            name: "Order 1"
        });
    });

    it("posts file form data without url-encoding the body", async () => {
        fetchMock.mockResolvedValue(buildResponse({id: "attachment-1"}));
        const api = createAPI();
        const formData = new FormData();
        formData.append("name", "Order attachment");

        await expect(api.postForFile("/cards/{id}/attachments", {"{id}": "card-1"}, formData)).resolves.toEqual({
            id: "attachment-1"
        });

        expect(fetchMock.mock.calls[0][1]).toMatchObject({
            method: "POST",
            body: formData
        });
    });
});
