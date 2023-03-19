import { Input, Button, Alert, Modal, Select, Table } from "antd";
import { useEffect, useState, useReducer } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert as AlertModel } from "../models/alert";
import { Detail as QuestionDetail } from "../models/question";
import { Create as OptCreate, Item as OptItem } from "../models/opt";
import { get, post, put, delete_ } from "../utils/api";
import "antd/dist/antd.css";
import { List as CQuestionList } from "../components/questions";

import { Create as QuestionCreate, Detail as CQuestionDetail } from "../components/questions";
import { Create as OptionCreate, List as COptionList } from "../components/options";



export const Create = () => {
	const { vote_id } = useParams();
	const [question, setQuestion] = useState<{ description: string, type_: "Single" | "Multi" }>({ description: "", type_: "Single" });
	const [options, setOptions] = useState<string[]>([]);
	const navigate = useNavigate();
	const create = async () => {
		const res = await fetch(`/votes/${vote_id}/questions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ question: question, options: options }),
		});
		if (res.status !== 200) {
			throw Error(res.statusText);
		}
	}

	return <div>
		<Button onClick={() => {navigate(-1)}}>Back</Button>
		<QuestionCreate onError={(err: Error) => { console.log(err) }} question={question} setQuestion={setQuestion} />
		<OptionCreate onError={(err: Error) => { console.log(err) }} options={options} setOptions={setOptions} />
		<Button onClick={create}>Create</Button>
	</div>

}


export const Detail = () => {
	const { question_id } = useParams();
	const [data, setData] = useState<{ alert: AlertModel | undefined, question: QuestionDetail | undefined, modalVisible: boolean, newOpts: OptCreate[] }>({ alert: undefined, question: undefined, modalVisible: false, newOpts: [] });
	const navigate = useNavigate();
	const addOpts = async () => {
		const res = await fetch(`/questions/${question_id}/options`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data.newOpts),
		});
		if (res.status !== 200) {
			throw Error(res.statusText)
		}
		setData({ ...data, modalVisible: false, newOpts: [] });
	}
	useEffect(() => {
		get<QuestionDetail>(`/questions/${question_id}`).then((qst) => {
			setData({ ...data, question: qst || undefined });
		}).catch((reason) => {
			setData({ ...data, alert: { type: "error", message: reason.toString() } });
			setTimeout(() => {
				setData({ ...data, alert: undefined })
			}, 2000);
		})
	}, [])

	return <div>
		<Button onClick={() => {navigate(-1)}}>Back</Button>
		<CQuestionDetail question_id={question_id!} />
		<COptionList question_id={question_id!} />

	</div>
}

export const Update = () => {
	const { question_id } = useParams();
	const reducer = (state: any, action: any) => {
		switch (action.type) {
			case "SetQuestion":
				return { ...state, question: action.data }
			case "SetOptions":
				return { ...state, options: action.data }
			case "SetAlert":
				setTimeout(() => {
					dispatch({ type: "UnsetAlert" })
				}, 3000)
				return { ...state, alert: action.data }
			case "UnsetAlert":
				const newState = { ...state };
				delete newState.alert;
				return newState;
			case "SetModalVisible":
				return { ...state, modal: { ...state.modal, visible: action.data } }
			case "SetModalOptions":
				return { ...state, modal: { ...state.modal, options: action.data } }
			case "NewOption":
				return { ...state, modal: { ...state.modal, options: state.modal?.options?.concat({ option: "" }) } }
		}
	}
	const [state, dispatch] = useReducer(reducer, {})

	useEffect(() => {
		get<QuestionDetail>(`/questions/${question_id}`).then((qst) => {
			dispatch({ type: "SetQuestion", data: qst })
		}).catch((reason) => {
			dispatch({ type: "SetAlert", data: { type: "error", message: reason.toString() } });
		});
		get<{ list: OptItem[] }>(`/questions/${question_id}/options`, { params: { page: 1, size: 10 } }).then(resp => {
			dispatch({ type: "SetOptions", data: resp.list });
		}).catch(reason => {
			dispatch({ type: "SetAlert", data: { type: "error", message: reason.toString() } });
		})
	}, []);

	const update = () => {
		put(`questions/${question_id}`, { body: state.question }).then(() => {
			dispatch({ type: "SetAlert", data: { type: "info", message: "Update Successfully" } });
		}).catch(reason => {
			dispatch({ type: "SetAlert", data: { type: "error", message: reason.toString() } });
		})
	}

	const removeOption = (option_id: number) => {
		delete_(`/questions/${question_id}/options`).then(() => {
			dispatch({ type: "SetOptions", data: state.options.filter((v: { id: number }) => v.id !== option_id) });
		}).catch(reason => {
			dispatch({ type: "SetAlert", data: { type: "error", message: reason.toString() } });
		})
	}

	const addOptions = () => {
		post(`/questions/${question_id}/options`, { body: state.modal.options }).then(() => {
			get<{ list: OptItem[] }>(`/questions/${question_id}/options`).then((resp) => {
				dispatch({ type: "SetOptions", data: resp.list });
				dispatch({ type: "SetModalOptions", data: [{ option: "" }] });
			}).catch(reason => {
				dispatch({ type: "SetAlert", data: { type: "error", message: reason.toString() } });
			}).finally(() => {
				dispatch({ type: "SetModalVisible", data: false });
			});
		}).catch(reason => {
			dispatch({ type: "SetAlert", data: { type: "error", message: reason.toString() } })
		})
	}

	const clearModal = () => {
		dispatch({ type: "SetModalOptions", data: [{ option: "" }] });
		dispatch({ type: "SetModalVisible", data: false });
	}

	const columns = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id"
		},
		{
			title: "Option",
			dataIndex: "option",
			key: "option",
		},
		{
			title: "Actions",
			dataIndex: "",
			key: "",
			render: (record: { id: number }) => {
				return <div>
					<Button onClick={() => { removeOption(record.id) }}>Remove</Button>
				</div>
			}
		}

	];

	return <div>
		{state.alert && <Alert type={state.alert.type} message={state.alert.type} />}
		<Input value={state.question?.description} />
		<Select value={state.question?.type_}>
			<option value="Single">Single</option>
			<option value="Multi">Multi</option>

		</Select>
		<div>
			<Button onClick={update}>Update</Button>
			<Button onClick={() => { dispatch({ type: "SetModalVisible", data: true }) }}>Add Option</Button>
		</div>
		<Modal visible={state.modal?.visible} onOk={addOptions} onCancel={clearModal}>
			<Button onClick={() => { dispatch({ type: "NewOption" }) }}>Add</Button>
			{state.modal?.options?.map((o: { option: string }) => {
				return <Input value={o.option} />
			})}
		</Modal>
		<Table columns={columns} dataSource={state.options}></Table>
	</div>
}


export const List = () => {
	const { vote_id } = useParams();
	return <CQuestionList vote_id={vote_id!} />
}