import { Item as OptItem } from "./opt";
export type ListItem = {
	id: number,
	description: string,
	hasAnswered: boolean,
}

export type Create = {
	description: string,
}

export type Detail = {
	id: number,
	description: string,
	opts: OptItem[],
}