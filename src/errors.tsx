export class HttpError extends Error {
	status: number;
	statusText: string;
	constructor(status: number, statusText: string) {
		super();
		this.status = status;
		this.statusText = statusText;
	}

	toString() {
		return `http error(status: ${this.status}, status text: ${this.statusText})`
	}
}


export const ErrForbidden = new Error("401 Forbidden");