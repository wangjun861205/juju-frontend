import { ListItem as QuestionListItem, Create as QuestionCreate } from "./question";

export type Status = "Collecting" | "Closed";


export type Detail = {
	vote: {
		id: number,
		name: string,
		deadline: string | null | undefined,
		status: Status,
	}
	dates: string[],
	questions: QuestionListItem[],
}

export type Update = {
	name: string,
	deadline: string | null | undefined,
}

export type Visibility = "Public" | "Organization" | "WhiteList"

export interface Create {
	name: string,
	deadline: string | null,
	visibility: Visibility,
	questions: QuestionCreate[],
	organization_id: number,
}