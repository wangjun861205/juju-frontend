import { Input, Button, Alert, Modal, Select, Table, message } from "antd";
import { useEffect, useState, useReducer } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert as AlertModel } from "../models/alert";
import { Detail as QuestionDetail, Create as QuestionCreateModel, Question as QuestionModel, QuestionType} from "../models/question";
import { Create as OptCreate, Option as OptItem } from "../models/opt";
import { get, post, put, delete_ } from "../utils/api";
import "antd/dist/antd.css";
import { List as CQuestionList } from "../components/questions";
import { AddModal, List as OptionList } from "../components/options";

import { Create as QuestionCreateComponent, Detail as CQuestionDetail } from "../components/questions";
import { AddModal as OptionAddModal, List as COptionList } from "../components/options";
import { question as fetchQuestion, updateQuestion } from "../apis/question";
import { options_within_question } from "../apis/options";
import { delete_option } from "../apis/options";
import { add_options } from "../apis/options";



export const Create = () => {
	const { vote_id } = useParams();
	const [question, setQuestion] = useState<QuestionCreateModel>();
	const [options, setOptions] = useState<string[]>([]);
	const [visible, setVisible] = useState(false);
	const navigate = useNavigate();
	const create = async () => {
		const res = await fetch(`/votes/${vote_id}/questions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...question, options: options }),
		});
		if (res.status !== 200) {
			throw Error(res.statusText);
		}
	}

	return <div>
		<Button onClick={() => {navigate(-1)}}>Back</Button>
		<QuestionCreateComponent question={question} setQuestion={setQuestion} />
		<Button onClick={_ => setVisible(true)}>Add Options</Button>
		<OptionAddModal visible={visible} options={options} setOptions={setOptions} onOk={ () => { setVisible(false) }} onCancel={ () => {setVisible(false)}}/>
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
		<CQuestionDetail question_id={parseInt(question_id!)} />
		<COptionList question_id={parseInt(question_id!)} />

	</div>
}

export const Update = () => {
	const { question_id } = useParams();
	const [questionID, setQuestionID] = useState<number>();
	const [question, setQuestion] = useState<QuestionModel>();
	const [options, setOptions] = useState<string[]>([]);
	const [visible, setVisible] = useState(false);
	const [newOptions, setNewOptions] = useState<string[]>([]);
	const nav = useNavigate();

	useEffect(() => {
		if (!question_id) {
			message.error(`invalid question_id: ${question_id}`);
			nav(-1);
			return;
		}
		setQuestionID(parseInt(question_id));
	}, [])

	useEffect(() => {
		if (!questionID || visible)  {
			return
		}
		fetchQuestion(questionID)
		.then(q => setQuestion(q))
		.catch(err => {
			message.error(err);
			nav(-1);
			return;
		})
	}, [questionID, visible]);

	useEffect(() => {
		if (!questionID || visible) {
			return;
		}
		options_within_question(questionID)
		.then(opts => { setOptions(opts) })
		.catch(err => {
			message.error(err);
			nav(-1);
			return;
		})
	}, [questionID, visible])


	const update = () => {
		if (!question || !questionID) {
			return
		}
		updateQuestion(questionID, question)
		.then()
		.catch(err => {
			message.error(err);
		})
	}

	const addOptions = () => {
		if (!questionID || !newOptions) {
			return
		}
		add_options(questionID, newOptions)
		.then(_ => { setNewOptions([]); setVisible(false)})
		.catch(err => { message.error(err); setVisible(false) });
	}



	return <div>
		<Input value={question?.description} />
		<Select value={question?.type_}>
			<option value={QuestionType.SINGLE}>Single</option>
			<option value={QuestionType.MULTI}>Multi</option>

		</Select>
		<div>
			<Button onClick={update}>Update</Button>
			<Button onClick={() => { setVisible(true) }}>Add Option</Button>
		</div>
		<AddModal visible={visible} options={newOptions} setOptions={setNewOptions} onOk={addOptions} onCancel={() => setVisible(false)}></AddModal>
		{ questionID 
		? <OptionList question_id={questionID}></OptionList>
		: <></>}
	</div>
}


export const List = () => {
	const { vote_id } = useParams();
	return <CQuestionList vote_id={vote_id!} />
}