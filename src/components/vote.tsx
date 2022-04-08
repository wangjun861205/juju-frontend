import { useState, useEffect } from "react";
import { Input, Button, Table, DatePicker } from "antd";
import { get, ListResponse, delete_, DeleteResponse, Pagination, put, UpdateResponse } from "../utils/api";
import { useNavigate } from "react-router";
import moment, { Moment } from "moment-timezone";


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
	useEffect(() => {
		get<Updation>(`/votes/${id}`).then(res => setData(res)).catch(e => { throw e });
	}, [id])

	const update = () => {
		put<UpdateResponse>(`/votes/${id}`, { body: data }).then(res => console.log(res)).catch(e => { throw e });
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