import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { get, put, ListResponse, delete_, DeleteResponse } from "../utils/api";
import { Button, Checkbox, Input, message, Radio, RadioChangeEvent, Row, Select, Table } from "antd";
import { useNavigate } from "react-router";
import "antd/dist/antd.css";
import { RadioGroup } from "@material-ui/core";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

type Item = {
	id: number,
	description: string,
	has_answered: boolean,
}

export const List = ({ vote_id }: { vote_id: string }) => {
	const [state, setState] = useState<ListResponse<Item>>({ list: [], total: 0 });
	const nav = useNavigate();
	useEffect(() => {
		get<ListResponse<Item>>(`/votes/${vote_id}/questions`).then((res) => {
			setState(res);
		}).catch(reason => { console.log(reason) });
	}, [vote_id]);

	const _delete = (item: Item, i: number) => {
		delete_<DeleteResponse>(`/questions/${item.id}`).then(res => {
			const newList = [...state.list];
			newList.splice(i, 1);
			setState({ list: newList, total: state.total - 1 })

		}).catch(reason => {
			console.log(reason);
		});
	}


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
			title: "Has Updated",
			dataIndex: "has_updated",
			key: "has_updated",
			render: (result: boolean) => { return result.toString() }
		},
		{
			title: "Actions",
			render: (_: any, record: Item, i: number) => {
				return <div>
					<Button onClick={(event) => { event.stopPropagation(); nav(`/questions/${record.id}/update`); }}>Update</Button>
					<Button onClick={(event) => { event.stopPropagation(); _delete(record, i) }}>Delete</Button>
				</div>
			}
		}
	]

	return <Table columns={columns} dataSource={state.list} onRow={(item: Item) => {
		return {
			onClick: () => {
				nav(`/questions/${item.id}`);
			}
		}
	}} />
}

type QuestionDetail = {
	id: number,
	description: string,
	type_: "Single" | "Multi",
}

export const Detail = ({ question_id }: { question_id: string }) => {
	const [state, setState] = useState<QuestionDetail>();
	useEffect(() => {
		get<QuestionDetail>(`/questions/${question_id}`).then(resp => {
			setState(resp);
		}).catch(reason => { throw reason })
	}, [question_id]);

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

export type _Report = {
	question: string,
	options: {
		option: string,
		percentage: number,
	}[],
}

export const Report = ({ report }: { report: _Report }) => {
	return <div>
		<h2>{report.question}</h2>
		{report.options.map(o => {
			return <li><span>{o.option}</span><span>{o.percentage / 100}%</span></li>
		})}
	</div>
}

export type FillingProps = {
	questionID: number,
	setAnswer: (vals: number[]) => void,
	answer?: number[],
}

enum QuestionType {
	SINGLE = 'Single',
	MULTI = 'Multi'
}

type Option = {
	id: number,
	option: String,
}

type Question = {
	id: number,
	description: String,
	type_: QuestionType,
	opts: Option[],
}

export const Filling = ({questionID, setAnswer, answer}: FillingProps) => {
	console.log(`passed answer: ${answer}`)
	const [question, setQuestion] = useState<Question|null>(null);
	const [selected, setSelected] = useState<number[]>([]);
	const nav = useNavigate();
	const fetch_data = async () => {
			let res = await fetch(`/questions/${questionID}`);
			if (res.status !== 200) {
				throw res.body;
			}
			try {
				let q = await res.json();
				return q
			} catch(e) {
				throw e;
			}
	}
	useEffect(() => {
		console.log(`question id: ${questionID}`)
		fetch_data().then(q => {
			setQuestion(q);
			if (answer) setSelected(answer);
		}).catch(e => message.error(e));
	}, [questionID])

	useEffect(() => {
		setAnswer(selected);
	}, [selected])


	const radioOnChange = (e: RadioChangeEvent) => {
		setSelected([e.target.value]);
	}

	const checkboxOnChange = (e: CheckboxChangeEvent) => {
		if (e.target.checked) {
			setSelected((old) => {
				old.push(e.target.value!);
				return Array.from(old);
			})
			return
		}
		setSelected((old) => {
			const i = old.indexOf(e.target.value);
			old.splice(i, 1);
			return Array.from(old);
		})
	}
	return <div>
		<Row>ID: { question?.id }</Row>
		<Row>Description: { question?.description }</Row>
		<Row>Type: { question?.type_ }</Row>
		<Row>Options:</Row>
		{ question?.type_ === QuestionType.SINGLE 
		? <Radio.Group value={selected[0]}> {question?.opts.map(o => { 
			console.log(`option id: ${o.id}, answer: ${answer}`);
			return <Row>
				<Radio value={o.id} onChange={ radioOnChange }>{o.option}</Radio>
				</Row> }) }
			</Radio.Group>
		: <Checkbox.Group>{ question?.opts.map(o => { 
				return <Row>
					<Checkbox value={o.id} checked={ answer ? answer.indexOf(o.id) >= 0 : false } onChange={ checkboxOnChange }>{o.option}</Checkbox> 
					</Row>}) }
			</Checkbox.Group>}
	</div>
}