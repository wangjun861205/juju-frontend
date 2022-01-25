import { Input, Button, Alert, Modal } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Alert as AlertModel } from "../models/alert";
import { Create as QuestionCreate, Detail as QuestionDetail } from "../models/question";
import { Create as OptCreate } from "../models/opt";
import "antd/dist/antd.css";

export const Create = () => {
	const { organization_id, vote_id } = useParams();
	const [data, setData] = useState<{ alert?: AlertModel, question?: QuestionCreate, opts?: OptCreate[] }>({});
	const create = async () => {
		const res = await fetch(`/organizations/${organization_id}/votes/${vote_id}/questions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ description: data?.question?.description, opts: data?.opts }),
		});
		if (res.status !== 200) {
			throw Error(res.statusText);
		}
	}
	return <div>
		{data.alert && <Alert type={data.alert?.type} message={data.alert?.message}></Alert>}
		<Input placeholder={"Description"} onChange={(event) => { setData({ ...data, question: { description: event.target.value } }) }}></Input>
		<Button onClick={() => { setData({ ...data, opts: [...(data.opts || []), { option: "" }] }) }}>Add Option</Button>
		{data.opts?.map((o, i) => {
			return <div key={i} ><Input style={{ "display": "inline-block", "width": "50%" }} value={o.option} placeholder="Option" onChange={(event) => {
				const newList = [...(data.opts || [])];
				newList[i].option = event.target.value;
				setData({ ...data, opts: newList });
			}} /><Button style={{ "display": "inline-block" }} onClick={() => {
				const newList = [...(data.opts || [])];
				newList.splice(i, 1);
				setData({ ...data, opts: newList });
			}}>Remove</Button></div>
		})}
		<Button onClick={() => {
			create().catch(
				(reason) => { setData({ ...data, alert: { type: "error", message: reason as string } }) }
			).then(() => {
				setData({ ...data, alert: { type: "info", message: "Success" } });
				setTimeout(() => { setData({ ...data, alert: undefined }) }, 2000);
			})
		}}>Create</Button>
	</div>
}


export const Detail = () => {
	const { organization_id, vote_id, question_id } = useParams();
	const [data, setData] = useState<{ alert: AlertModel | undefined, question: QuestionDetail | undefined, modalVisible: boolean, newOpts: OptCreate[] }>({ alert: undefined, question: undefined, modalVisible: false, newOpts: [] });
	const fetchData = async () => {
		const res = await fetch(`/organizations/${organization_id}/votes/${vote_id}/questions/${question_id}`);
		if (res.status !== 200) {
			throw Error(res.statusText);
		}
		const qst: QuestionDetail = JSON.parse(await res.text());
		return qst;
	}
	const addOpts = async () => {
		const res = await fetch(`/organizations/${organization_id}/votes/${vote_id}/questions/${question_id}/options`, {
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
		fetchData().then((qst) => {
			console.log("==================")
			setData({ ...data, question: qst || undefined });
		}).catch((reason) => {
			setData({ ...data, alert: { type: "error", message: reason.toString() } });
			setTimeout(() => {
				setData({ ...data, alert: undefined })
			}, 2000);
		})
	}, [])

	return <div>
		{data.alert && <Alert type={data.alert.type} message={data.alert.message} banner={true} />}
		<Input disabled={true} value={data.question?.id} />
		<Input disabled={true} value={data.question?.description} />
		<label>Opts</label>
		<Button onClick={() => { setData({ ...data, modalVisible: true }) }}>Add Options</Button>
		{data.question?.opts.map((o, i) => {
			return <Input disabled={true} value={o.option} />
		})}
		<Modal title="Add Options" onCancel={() => { setData({ ...data, newOpts: [], modalVisible: false }) }} onOk={() => { addOpts().catch((reason) => { setData({ ...data, alert: { type: "error", message: reason } }) }) }} visible={data.modalVisible}>
			<Button onClick={() => { setData({ ...data, newOpts: [...data.newOpts, { option: "" }] }) }}>Add</Button>
			{
				data.newOpts.map((o, i) => {
					return <div>
						<Input style={{ "display": "inline-block", "width": "50%" }} placeholder="Option" value={o.option} onChange={(event) => {
							const newList = [...data.newOpts];
							newList[i].option = event.target.value;
							setData({ ...data, newOpts: newList });
						}} />
						<Button style={{ "display": "inline-block" }} onClick={() => {
							const newList = [...data.newOpts];
							newList.splice(i, 1);
							setData({ ...data, newOpts: newList });
						}}>Remove</Button>
					</div>
				})
			}
		</Modal>
	</div>

}