import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { get, put } from "../utils/api";
import { Button, Input, Select, Table } from "antd";
import "antd/dist/antd.css";
import { StringGradients } from "antd/lib/progress/progress";
import { stringLiteral } from "@babel/types";
import { differenceInQuartersWithOptions } from "date-fns/fp";

type QuestionItem = {
	id: number,
	description: string,
	has_answered: boolean,
}

export const List = (props: { onError: (err: Error) => void }) => {
	const nav = useNavigate();
	const { vote_id } = useParams();
	const [state, setState] = useState<{ list: QuestionItem[], total: number } | undefined>();

	useEffect(() => {
		get<{ list: QuestionItem[], total: number }>(`/votes/${vote_id}/questions`).then(({ list, total }) => {
			setState({ list: list, total: total });
		}).catch(reason => { props.onError(reason) });
	}, [vote_id]);

	const columns = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
		},
		{
			title: "Has Answered",
			dataIndex: "has_answered",
			key: "has_answered",
			render: (result: boolean) => { return result.toString() }
		},
		{
			title: "Actions",
			render: (record: { id: number }) => {
				return <div>
					<Button>Update</Button>
				</div>
			}
		}
	]

	return <Table columns={columns} dataSource={state?.list} />
}

type QuestionDetail = {
	id: number,
	description: string,
	type_: "Single" | "Multi",
}

export const Detail = (props: { onError: (err: Error) => void, question_id: string }) => {
	const [state, setState] = useState<QuestionDetail>();
	useEffect(() => {
		get<QuestionDetail>(`/questions/${props.question_id}`).then(resp => {
			setState(resp);
		}).catch(reason => { props.onError(reason) })
	}, [props]);

	return <div>
		<p><label>ID: </label> {state?.id}</p>
		<p><label>Description: </label> {state?.description}</p>
		<p><label>Type: </label>{state?.type_}</p>
	</div >
}

type QuestionUpdate = {
	description: string,
	type_: "Single" | "Multi",
}




export const Update = (props: { onError: (err: Error) => void, question_id: string }) => {
	const [state, setState] = useState<QuestionUpdate>();
	useEffect(() => {
		get<QuestionUpdate>(`/questions/${props.question_id}`).then(resp => {
			setState(resp);
		}).catch(reason => props.onError(reason));
	});
	const update = () => {
		put(`/questions/${props.question_id}`, { body: state }).then().catch(reason => props.onError(reason));
	}

	return <div>
		<Input value={state?.description} onChange={(event) => { setState({ ...state!, description: event.target.value }) }} />
		<Select options={[{ label: "Single", value: "Single" }, { label: "Multi", value: "Multi" }]} onChange={(event) => { setState({ ...state!, type_: event.target.value }) }} />
		<Button onClick={update}>Update</Button>
	</div>
}

type QuestionCreate = {
	description: string,
	type_: "Single" | "Multi",
}

export const Create = (props: { onError: (err: Error) => void, question: QuestionCreate, setQuestion: (question: QuestionCreate) => void }) => {
	return <div>
		<Input value={props.question.description} placeholder="Description" onChange={(event) => { props.setQuestion({ ...props.question, description: event.target.value }) }} />
		<Select options={[{ label: "Single", value: "Single" }, { label: "Multi", value: "Multi" }]} value={props.question.type_} onChange={(value) => { props.setQuestion({ ...props.question, type_: value }) }} />
	</div>

}