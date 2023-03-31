import { useState, useEffect, ChangeEvent } from "react";
import { Input, Button, Table, DatePicker, message, Row, Radio, Checkbox, RadioChangeEvent } from "antd";
import { get, ListResponse, delete_, DeleteResponse, Pagination, put, UpdateResponse } from "../utils/api";
import { useNavigate } from "react-router";
import moment, { Moment } from "moment-timezone";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

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
			title: "Has Updated",
			dataIndex: "has_updated",
			key: "has_updated",
			render: (v: boolean) => { return <div>{`${v}`}</div> }
		},
		{
			title: "Actions",
			dataIndex: "",
			key: "",
			render: (_: string, { id }: { id: number }, i: number) => {
				return <div>
					<Button onClick={(event) => { event.stopPropagation(); nav(`/votes/${id}/update/`) }}>Update</Button>
					<Button onClick={(event) => { event.stopPropagation(); remove(id, i) }}>Delete</Button>
					<Button onClick={(evnet) => { evnet.stopPropagation(); nav(`/votes/${id}/report`) }}>View Report</Button>
					<Button onClick={(evnet) => { evnet.stopPropagation(); nav(`/votes/${id}/filling`) }}>Filling</Button>
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
		<DatePicker mode="date" value={moment(data.deadline)} picker="date" onChange={d => {
			if (d && d.format("YYYY-MM-DD") < moment().format("YYYY-MM-DD")) {
				setData({ ...data, deadline: d.format("YYYY-MM-DD"), status: "Closed" });
			} else {
				setData({ ...data, deadline: d ? d.format("YYYY-MM-DD") : null, status: "Collecting" });
			}
		}} />
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
	const [questions, setQuestions] = useState<QuestionWithOptions[]>();
	const [answers, setAnswers] = useState<number[][]>();
	const [idx, setIdx] = useState<number>();
	const nav = useNavigate();
	useEffect(() => {
		fetch(`/votes/${id}/questions_with_options`).then(res => {
			if (res.status !== 200) {
				res.text().then(v => {
					message.error(v);
					nav(-1);
				}).catch(e => {
					message.error(e);
					nav(-1);
				});
				return;
			}
			res.json().then((v: ListResponse<QuestionWithOptions>) => {
				console.log(v);
				setQuestions(v.list);
			}).catch(e => {
				message.error(e);
				nav(-1);
				return
			});
		})
	}, [])

	useEffect(() => {
		if (questions) { 
			setAnswers(questions.map(q => [q.opts[0].id]));
			setIdx(0);
		}
	}, [questions])


	const singleOnChange = (e: RadioChangeEvent) => {
		setAnswers(old => {
			if (old && idx !== undefined) {
				old[idx] = [e.target.value];
				return Array.from(old);
			}
			return old;
		})
	}

	const multiOnChange = (e: CheckboxChangeEvent) => {
		setAnswers(old => {
			if (old && idx !== undefined) {
				console.log(`is checked: ${e.target.checked}, value: ${e.target.value}`)
				if (e.target.checked) {
					old[idx].push(e.target.value);
					console.log(old);
					return Array.from(old);
				}
				console.log(old);
				old[idx] = old[idx].filter(v => v !== e.target.value);
				return Array.from(old);
			}
			return old;
		})
	}

	const prev = () => {
		setIdx((old) => {
			if (old === null) {
				return old;
			}
			if (old! > 0) {
				return old! - 1;
			}
			return old;
		});
	}

	const next = () => {
		setIdx((old) => {
			if (old === undefined) {
				return old;
			}
			return old + 1;
		});
	}

	const submit = () => {
		if (answers?.some(v => v === undefined)) {
			message.warning("Please answer all questions");
			return
		}
		fetch(
			`/votes/${id}/answers`, 
			{
				method: "POST", 
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(answers?.map((v, i) => { return { question_id: questions![i].id, option_ids: answers[i] } }))
			}
		)
		.then(res => {
			switch (res.status) {
				case 401:
					message.error("not logined");
					nav("/login");
					return
				case 201:
					message.success("submit answers successfully");
					nav(-1);
					return
				default:
					res.text().then(e => {
						message.error(e);
						nav(-1);
					}).catch(e => {
						message.error(e);
						nav(-1);
					})
			}
		})
	}


	return <>
	{ questions && answers && idx !== undefined
	  ? <div>
			<Row>ID: { questions[idx].id } </Row>
			<Row>Description: {questions[idx].description }</Row>
			<Row>Type: { questions[idx].type_ }</Row>
			{ 
				questions[idx].type_ === 'Single' 
				? <Radio.Group value={ answers[idx][0] }>
					{
						questions[idx].opts.map(o => {
								return <Row key={o.id}><Radio onChange={ singleOnChange } value={o.id}>{ o.option }</Radio></Row>
						})
					}
					</Radio.Group>
				: <Checkbox.Group value={ answers[idx] }>
					{
						questions[idx].opts.map(o => {
								return <Row key={o.id}><Checkbox onChange={ multiOnChange } value={o.id}>{ o.option }</Checkbox></Row>
						})
					}
				</Checkbox.Group>
			}
			<Row>
				{ idx > 0 ? <Button onClick={prev}>Previous</Button> : <></> }
				{ idx < questions.length - 1? <Button onClick={next}>Next</Button> : <Button onClick={submit}>Submit</Button> }
			</Row>
		</div>
	  : <></>
	}
	</>
}