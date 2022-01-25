import { useEffect, useReducer, useState } from "react"
import { Button, Input, Pagination, Table, Alert } from "antd";
import { useNavigate, useParams } from "react-router";
import { HttpError } from "../errors";
import { Vote } from "./votes";
import "antd/dist/antd.css";


const OrganizationList = () => {
	const nav = useNavigate();
	const [data, setData] = useState({ page: 1, size: 10, total: 0, orgs: [] });
	const [alert, setAlert] = useState<{ type: "error" | "info", message: string } | null>(null);
	const fetchData = async () => {
		const res = await fetch("/organizations?" + new URLSearchParams({ page: data.page.toString(), size: data.size.toString() }));
		if (res.status !== 200) {
			throw new HttpError(res.status, res.statusText);
		}
		return JSON.parse(await res.text());
	}
	useEffect(() => {
		fetchData().then((resp) => {
			setData({ ...data, orgs: resp.list, total: resp.total })
		}).catch((e) => {
			switch (true) {
				case e instanceof HttpError:
					switch (e.status) {
						case 401:
							nav("/login");
							break;
					}
					break;
				default:
					console.log(e);
					break;
			}
		})
	}, [data.page, data.size]);

	const del = async (id: number) => {
		const res = await fetch(`/organizations/${id}`, {
			method: "DELETE",
		});
		if (res.status !== 200) {
			setAlert({ type: "error", message: res.statusText });
			return
		}
		setAlert({ type: "info", message: "delete success" });
		setTimeout(() => {
			setAlert(null);
			fetchData().then((resp) => { setData({ ...data, orgs: resp.list, total: resp.total }) });
		}, 2000)

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
			key: "name"
		},
		{
			title: "Vote Count",
			dataIndex: "vote_count",
			key: "vote_count",
		},
		{
			title: "Actions",
			key: "actions",
			render: (record: { id: number }) => {
				return <div>
					<Button>Edit</Button>
					<Button onClick={(e) => { e.stopPropagation(); del(record.id) }}>Delete</Button>
				</div >
			}
		}
	]


	return <div>
		{alert && <Alert type={alert!.type} message={alert!.message} banner={true} />}
		<Button onClick={() => { nav("/organizations/create") }}>Create</Button>
		<Table dataSource={data.orgs} columns={columns} pagination={false} onRow={(record: { id: number }) => {
			return {
				onClick: () => {
					nav(`/organizations/${record.id}`);
				}
			}
		}} />
		<Pagination defaultCurrent={data.page} total={data.total} showSizeChanger={true} onChange={(page, pageSize) => { setData({ ...data, page: page, size: pageSize }) }} />

	</div>

}

const CreateOrganization = () => {
	const nav = useNavigate();
	const [data, setData] = useState({ name: "" });
	const doRequest = async () => {
		const res = await fetch("/organizations", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (res.status !== 200) {
			throw new HttpError(res.status, res.statusText);
		}
	}

	const create = () => {
		doRequest().catch((e) => {
			switch (true) {
				case e instanceof HttpError:
					if (e.status === 401) {
						nav("/login");
					}
					console.log(e);
					break;
				default:
					console.log(e);
					break;
			}
		}).then(() => {
			nav("/organizations");
		});
	}
	return <div>
		<Input placeholder="Name" onChange={(e) => { setData({ name: e.target.value }) }} />
		<Button onClick={() => { create() }}>Create</Button>
	</div>
}

type Organization = {
	id: number,
	name: string,
	votes: Vote[],
}

const Detail = () => {
	const nav = useNavigate();
	const { organization_id } = useParams();
	const dispatcher = (state: { alert: string | null, data: Organization | null }, action: { type: string, message: string | null, data: Organization | null }) => {
		switch (action.type) {
			case "alert":
				return { ...state, alert: action.message }
			case "data":
				return { ...state, data: action.data }
			default:
				throw new Error("unknown action type");
		}

	}
	const [state, dispatch] = useReducer(dispatcher, { alert: null, data: null })
	const fetchData = async () => {
		const res = await fetch(`/organizations/${organization_id}`);
		if (res.status !== 200) {
			dispatch({ type: "alert", message: res.statusText, data: null });
			return
		}
		const org = JSON.parse(await res.text());
		dispatch({ type: "data", message: null, data: org });
	}
	useEffect(() => {
		fetchData()
	}, [])

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
			title: "Actions",
			dataIndex: "",
			key: "",
			render: (record: { id: number }) => {
				return <div>
					<Button onClick={(event) => { event.stopPropagation(); nav(`/organizations/${organization_id}/votes/${record.id}/update/`) }}>Update</Button>
				</div>
			}
		}

	]

	const onRow = (record: { id: number }) => {
		return {
			onClick: () => {
				nav(`/organizations/${organization_id}/votes/${record.id}/detail`);
			}
		}
	}

	return <div>
		<Input disabled={true} value={state.data?.id} />
		<Input disabled={true} value={state.data?.name} />
		<Table rowKey="id" dataSource={state.data?.votes} columns={columns} onRow={onRow} />
	</div>


}

export { OrganizationList, CreateOrganization, Detail };