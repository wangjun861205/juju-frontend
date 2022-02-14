import Calendar from "../components/calendar"
import { Input, Button, Alert, Table, Pagination, Select } from "antd";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Detail as VoteDetail, Update as VoteUpdate } from "../models/vote";
import { Alert as AlertModel } from "../models/alert";
import moment from "moment";
import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker
} from '@material-ui/pickers';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';


export type Vote = {
	id: number,
	name: string,
	deadline: string | null | undefined,
}

export const CreateVote = () => {
	const { organization_id } = useParams();
	const [data, setData] = useState<{
		organization_id: number,
		name: string,
		deadline: string | null | undefined,
	}>({
		organization_id: ~~organization_id!,
		name: "",
		deadline: null,
	})


	const [alert, setAlert] = useState("");
	const nav = useNavigate();

	const create = async () => {
		const res = await fetch("/votes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (res.status !== 200) {
			setAlert(res.statusText);
			setTimeout(() => {
				setAlert("");
			}, 2000)
			return
		}
		nav(`/organizations/${organization_id}`)
	}

	return <div>
		{alert !== "" && <Alert type="error" message={alert} banner={true} />}
		<Input placeholder="Name" onChange={(e) => { setData({ ...data, name: e.target.value }) }} />
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
			<KeyboardDatePicker label="deadline" value={data.deadline} onChange={(date) => { setData({ ...data, deadline: date?.toISOString().slice(0, 10) }) }} />
		</MuiPickersUtilsProvider>
		<Button onClick={() => { create().catch((r) => { setAlert(r) }) }}>Create</Button>

	</div>
}

export const VoteList = () => {
	const { organization_id } = useParams();
	const [data, setData] = useState({ list: [], total: 0, page: 1, size: 10, alert: "" });
	const nav = useNavigate();
	const fetchData = async () => {
		const res = await fetch(`/organizations/${organization_id}/votes?` + new URLSearchParams({ page: data.page.toString(), size: data.size.toString() }));
		if (res.status !== 200) {
			setData({ ...data, alert: res.statusText });
			setTimeout(() => {
				setData({ ...data, alert: "" });
			}, 2000);
			return
		}
		const { list, total } = JSON.parse(await res.text());
		setData({ ...data, list: list, total: total });
	}
	useEffect(() => {
		fetchData().catch((reason) => {
			setData({ ...data, alert: reason });
		});
	}, [data.page, data.size])

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
			title: "Actions",
			dataIndex: "",
			key: "",
			render: (record: { id: number }) => {
				return <Button onClick={(event) => { event.stopPropagation(); nav(`/organizations/${organization_id}/votes/${record.id}/update`) }}>Update</Button>
			}
		}

	]

	return <div>
		{data.alert !== "" && <Alert type="error" message={data.alert} banner={true} />}
		<Button onClick={() => { nav(`/organizations/${organization_id}/create_vote`) }}>Add</Button>
		<Table dataSource={data.list} columns={columns} />
		<Pagination pageSize={data.size} current={data.page} total={data.total} />
	</div>

}

interface Stringer {
	toString(): string
}



export const Detail = () => {
	const nav = useNavigate();
	const { organization_id, vote_id } = useParams();
	const [data, setData] = useState<{
		vote: VoteDetail | null,
		alert: AlertModel | null,
	}>({ vote: null, alert: null })
	const fetchData = async () => {
		try {
			const res = await fetch(`/votes/${vote_id}`);
			if (res.status !== 200) {
				setData({ ...data, alert: { type: "error", message: res.statusText } });
			}
			const vote: VoteDetail = JSON.parse(await res.text());
			setData({ ...data, vote: vote });
		} catch (reason) {
			setData({ ...data, alert: { type: "error", message: (reason as Stringer)?.toString() } });
			console.log(reason);
		}

	}
	useEffect(() => { fetchData() }, [])

	const questionColumns = [
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
			title: "HasAnswered",
			dataIndex: "has_answered"
		},
		{
			title: "Actions",
			dataIndex: "",
			key: "",
			render: (record: { id: number }) => {
				return <Button onClick={(event) => {
					event.stopPropagation();
					nav(`/questions/${record.id}/update`);
				}}>Update</Button>
			}
		}
	]

	const onRow = (record: { id: number }) => {
		return {
			onClick: () => {
				nav(`/organizations/${organization_id}/votes/${vote_id}/questions/${record.id}/detail`)
			}
		}
	}

	return <div>
		<Input disabled={true} value={data.vote?.vote.id} />
		<Input disabled={true} value={data.vote?.vote.name} />
		<Input disabled={true} value={data.vote?.vote.deadline || ""} />
		<Select disabled={true} value={data.vote?.vote.status} />
		<Calendar picked={new Set(data.vote?.dates)} />
		<Button onClick={() => { nav(`/organizations/${organization_id}/votes/${vote_id}/questions/create`) }}>Add Question</Button>
		<Table dataSource={data.vote?.questions} columns={questionColumns} onRow={onRow} />
	</div>
}


export const Update = () => {
	const { organization_id, vote_id } = useParams();
	const [data, setData] = useState<{ alert: AlertModel, vote: VoteUpdate }>({ alert: { type: undefined, message: undefined }, vote: { name: "", deadline: null } });
	const fetchData = async () => {
		const res = await fetch(`/organizations/${organization_id}/votes/${vote_id}`);
		if (res.status !== 200) {
			throw Error(`invalid response status: ${res.statusText}`)
		}
		const { vote: { name, deadline }, ..._ } = JSON.parse(await res.text());
		return { name: name, deadline: deadline }
	}

	const update = async () => {
		const res = await fetch(`/organizations/${organization_id}/votes/${vote_id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data.vote)
		});
		if (res.status !== 200) {
			throw Error(`invalid response status: ${res.statusText}`)
		}
	}
	useEffect(() => {
		fetchData().catch((reason) => {
			setData({ ...data, alert: { type: "error", message: reason } });
		}).then((vote) => {
			setData({ ...data, vote: vote as VoteUpdate })
		})
	}, [])

	return <div>
		{data.alert.type && <Alert type={data.alert.type} message={data.alert.message} />}
		<Input value={data.vote.name} onChange={(e) => { setData({ ...data, vote: { ...data.vote, name: e.target.value } }) }} />
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
			<KeyboardDatePicker label="deadline" format={"Y-MM-dd"} value={data.vote.deadline} onChange={(date) => { setData({ ...data, vote: { ...data.vote, deadline: date?.toISOString().slice(0, 10) } }) }} />
		</MuiPickersUtilsProvider>
		<Button onClick={() => {
			update().catch((reason) => {
				setData({ ...data, alert: { type: "error", message: reason } })
			})
		}}>Update</Button>

	</div>
}