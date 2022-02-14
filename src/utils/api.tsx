
export class HttpError extends Error {
	status: number;
	statusText: string;

	constructor(status: number, statusText: string) {
		super(`invalid http response status: ${statusText}(${status})`);
		this.status = status;
		this.statusText = statusText;
	}
}

export const get = async <T extends {}>(url: string, atta?: { params?: any }): Promise<T> => {
	url = atta?.params ? url + "?" + new URLSearchParams(atta.params) : url;
	const resp = await fetch(url);
	if (resp.status / 100 > 3) {
		throw new HttpError(resp.status, resp.statusText);
	}
	return JSON.parse(await resp.text())

}

export const post = async <T extends {}>(url: string, atta?: { params?: any, body?: any }): Promise<T> => {
	url = atta?.params ? url + "?" + new URLSearchParams(atta.params) : url;
	const resp = await fetch(url, {
		method: "POST",
		headers: atta?.body && { "Content-Type": "application/json" },
		body: atta?.body && JSON.stringify(atta.body),
	});
	if (resp.status / 100 > 3) {
		throw new HttpError(resp.status, resp.statusText);
	}
	return JSON.parse(await resp.text());
}

export const put = async <T extends {}>(url: string, atta?: { params?: any, body?: any }): Promise<T> => {
	url = atta?.params ? url + "?" + new URLSearchParams(atta.params) : url;
	const resp = await fetch(url, {
		method: "PUT",
		headers: atta?.body && { "Content-Type": "application/json" },
		body: atta?.body && JSON.stringify(atta.body)
	});
	if (resp.status / 100 > 3) {
		throw new HttpError(resp.status, resp.statusText);
	}
	return JSON.parse(await resp.text());
}

export const delete_ = async <T extends {}>(url: string, atta?: { params?: any }): Promise<T> => {
	url = atta?.params ? url + "?" + new URLSearchParams(atta.params) : url;
	const resp = await fetch(url, {
		method: "DELETE",
	});
	if (resp.status / 100 > 3) {
		throw new HttpError(resp.status, resp.statusText);
	}
	return JSON.parse(await resp.text());
}