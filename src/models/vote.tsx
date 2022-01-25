import { ListItem as QuestionListItem } from "./question";

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