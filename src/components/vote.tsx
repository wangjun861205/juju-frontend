import { useState, useEffect, ChangeEvent, Dispatch, SetStateAction } from "react";
import { Tooltip, Input, Button, Table, DatePicker, message, Row, Radio, Checkbox, RadioChangeEvent, Form, Steps, Descriptions } from "antd";
import { get, ListResponse, delete_, DeleteResponse, Pagination, put, UpdateResponse } from "../utils/api";
import { useNavigate } from "react-router";
import moment, { Moment } from "moment-timezone";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { question_ids_within_vote } from "../apis/question";
import { Filling as FillingComponent } from "./questions";
import { Create as VoteCreateModel } from "../models/vote";
import { Question } from "../models/question";
import dayjs, { Dayjs } from "dayjs";
import { DeleteOutlined, EditOutlined, LineChartOutlined, HighlightOutlined } from "@ant-design/icons"
import { Filling as QuestionFilling } from "./questions"

enum Status {
	Closed,
	Collecting,
}

type Vote = {
	id: number,
	name: string,
	deadline: string | null,
	status: Status,

}

export const Detail = ({ id }: { id: string }) => {
	const [data, setData] = useState<Vote>({ id: 0, name: "", deadline: null, status: Status.Closed });
	useEffect(() => {
		get<Vote>(`/votes/${id}`).then(
			res => {
				setData(res)
			}
		).catch(reason => {
			console.log(reason);
		})
	}, [id]);

	return <Descriptions title="Vote Detail" bordered column={2}>
		<Descriptions.Item label="ID">{data.id}</Descriptions.Item>
		<Descriptions.Item label="Name">{data.name}</Descriptions.Item>
		<Descriptions.Item label="Deadline">{data.deadline}</Descriptions.Item>
		<Descriptions.Item label="Status">{data.status}</Descriptions.Item>
	</Descriptions>

	return <div>
		<Input disabled={true} value={data.id} />
		<Input disabled={true} value={data.name} />
		<Input disabled={true} value={data.deadline || ""} />
		<Input disabled={true} value={data.status} />

	</div>
}

export const List = ({ organization_id }: { organization_id: string }) => {
	const nav = useNavigate();
	const [data, setData] = useState<ListResponse<Vote>>({ list: [], total: 0 });
	const [{ page, size }, setPagination] = useState<Pagination>({ page: 1, size: 10 });
	useEffect(() => {
		get<ListResponse<Vote>>(`/organizations/${organization_id}/votes`, { params: { page: page, size: size } }).then(res => {
			setData(res);
		}).catch(
			reason => { throw reason }
		)
	}, [organization_id, page, size]);

	const remove = (id: number, i: number) => {
		delete_<DeleteResponse>(`/votes/${id}`).then(({ deleted }) => {
			if (deleted > 0) {
				const newList = [...data.list];
				newList.splice(i, 1);
				setData({ ...data, list: newList });
			} else {
				throw Error(`vote not exists(id: ${id})`);
			}
		}).catch(e => {
			throw e;
		})
	}

	const columns = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
		},
		{
			title: "Deadline",
			dataIndex: "deadline",
			key: "deadline",
		},
		{
			title: "Number of Questions",
			dataIndex: "num_of_questions",
			key: "num_of_questions",
		},
		{
			title: "Has Updated",
			dataIndex: "has_updated",
			key: "has_updated",
			render: (v: boolean) => { return <div>{`${v}`}</div> }
		},
		{
			title: "Actions",
			dataIndex: "",
			key: "action",
			render: (_: string, { id }: { id: number }, i: number) => {
				return <div className='max-w-[220px]'>
					<Tooltip title='Edit'>
						<Button className='w-[50px] m-[4px]' icon={<EditOutlined rev={false} />} onClick={(event) => { event.stopPropagation(); nav(`/votes/${id}/update/`) }} />
					</Tooltip>
					<Tooltip title='Delete'>
						<Button className='w-[50px] m-[4px]' icon={<DeleteOutlined rev={false} />} onClick={(event) => { event.stopPropagation(); remove(id, i) }} />
					</Tooltip>
					<Tooltip title='Statistic Report'>
						<Button className='w-[50px] m-[4px]' icon={<LineChartOutlined rev={false} />} onClick={(evnet) => { evnet.stopPropagation(); nav(`/votes/${id}/report`) }} />
					</Tooltip>
					<Tooltip title='Filling'>
						<Button className='w-[50px] m-[4px]' icon={<HighlightOutlined rev={false} />} onClick={(evnet) => { evnet.stopPropagation(); nav(`/votes/${id}/filling`) }} />
					</Tooltip>
				</div >
			}
		}
	]

	const onRow = (record: { id: number }) => {
		return {
			onClick: () => {
				nav(`/votes/${record.id}/detail`);
			}
		}
	}

	return <div>
		<Table rowKey="id" dataSource={data.list} columns={columns} onRow={onRow} pagination={{ total: data.total, current: page, onChange: (p, s) => setPagination({ page: p, size: s }) }} />
	</div>
}


type Updation = {
	name: string,
	deadline: string | null,
	status: "Collecting" | "Closed",
}

export const Update = ({ id }: { id: string }) => {
	const [data, setData] = useState<Updation>({ name: "", deadline: null, status: "Collecting" });
	const nav = useNavigate();
	useEffect(() => {
		get<Updation>(`/votes/${id}`).then(res => setData(res)).catch(e => { throw e });
	}, [id])

	const update = () => {
		put<UpdateResponse>(`/votes/${id}`, { body: data }).then(res => { message.success("Successfully updated"); nav(-1)}).catch(e => { throw e });
	}

	return <div>
		<Input value={data.name} onChange={event => setData({ ...data, name: event.target.value })} />
		{/* <DatePicker mode="date" value={moment(data.deadline)} picker="date" onChange={d => {
			if (d && d.format("YYYY-MM-DD") < moment().format("YYYY-MM-DD")) {
				setData({ ...data, deadline: d.format("YYYY-MM-DD"), status: "Closed" });
			} else {
				setData({ ...data, deadline: d ? d.format("YYYY-MM-DD") : null, status: "Collecting" });
			}
		}} /> */}
		<Input disabled={true} value={data.status} />
		<Button onClick={update}>Update</Button>
	</div>
}

type QuestionWithOptions = {
	id: number,
	description: string,
	type_: string,
	opts: {
		id: number,
		option: string,
	}[],
}

export const Filling = ({ id }: { id: number }) => {
	const [questions, setQuestions] = useState<Question[]>([]);
	const nav = useNavigate();
	useEffect(() => {
		fetch(`/votes/${id}/questions`)
		.then(res => {
			if (res.status !== 200) {
				res.text()
				.then(t => message.error(t))
				.catch(reason => message.error(reason));
				return
			}
			res.json()
			.then(qs => setQuestions(qs.list))
			.catch(reason => message.error(reason));
		})
	}, [])

	return <>
		{ questions?.map((q, i) => {
			return <QuestionFilling key={q.id} question={q} setAnswer={(answer: number[]) => setQuestions(prev => {const res = [...prev]; res[i].answer = answer; return res;})}/>
		})}
		<div className='flex justify-center m-10'>
		<Button type='primary' onClick={() => {
			fetch(`/votes/${id}/answers`, {method: "POST",headers: { "Content-Type": "application/json" }, body: JSON.stringify(questions.map(q => {
				return {
					question_id: q.id,
					option_ids: q.answer,
				}	
			}))})
			.then(res => {
				if (res.status !== 200) {
					res.text()
					.then(t => message.error(t))
					.catch(reason => console.error(reason));
					return;
				}
				message.success("Successfully Submitted");
				nav(-1);
			})
			
		}} >Submit</Button>
		</div>
	</>
}

interface VoteCreateProps {
	data: VoteCreateModel,
	setData: Dispatch<SetStateAction<VoteCreateModel>>,
	className?: string,
}

export const Create = ({data, setData, className}: VoteCreateProps) => {
	return <Form className={className ?? "m-10 text-center items-center"}>
				<Form.Item label="Name"><Input value={data.name} onChange={(e) => setData(prev => { return {...data, name: e.target.value}})}/></Form.Item>
				<Form.Item label="Deadline"><DatePicker value={data.deadline ? dayjs(data.deadline) : dayjs()} onChange={(v) => setData(prev => { return { ...data, deadline: v ? v.format("YYYY-MM-DD") : null}})}/></Form.Item>
				<Form.Item label="Visibility">
					<Radio.Group value={data.visibility} onChange={(e) => setData(prev => { return { ...data, visibility: e.target.value}})}>
						<Radio value="Public">Public</Radio>
						<Radio value="Organization">Organization</Radio>
						<Radio value="WhiteList">White List</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
}