import { useEffect, useState, useContext } from "react"
import { get, delete_, post } from "../utils/api";
import { List as CList, Button, Table, Form, Input, message } from "antd";
import { AlertProps } from "../wrapper/alert";
import { List as ResponseList } from "../utils/response";
import { useNavigate } from "react-router";
import { PaginationProps } from "../wrapper/pagination";
import { LoadingContext, LoadingProps } from "../wrapper/spin"
import { ErrorProps } from "../wrapper/error";
import { Layout } from "../layout/layout";
import "./organization.css";
import { debug } from "console";
import { createSearchParams } from "react-router-dom";

type Item = {
	id: number,
	name: string,
}

export const Detail = ({ organization_id }: { organization_id: string }) => {
	const [data, setData] = useState<Item>({ id: 0, name: "" });
	useEffect(() => {
		get<Item>(`/organizations/${organization_id}`).then(res => setData(res)).catch(e => { throw e });

	}, [organization_id]);
	return <CList split={true}>
		<div><label>ID: </label><span>{data.id}</span></div>
		<div><label>Name: </label><span>{data.name}</span></div>
	</CList>

}

type ListItem = {
	id: number,
	name: string,
	vote_count: number,
	has_new_vote: boolean,
}


export const List = ({ setError }: ErrorProps) => {
	const [orgs, setOrgs] = useState<ListItem[]>();
	const nav = useNavigate();
	const setLoading = useContext(LoadingContext);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);


	const del = async (id: number) => {
		setLoading!(true);
		delete_(`/organizations/${id}`).then(() => {
		}).catch((reason) => {
			setError(reason);
		}).finally(() => {
			setLoading && setLoading(false);
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
			key: "name"
		},
		{
			title: "Vote Count",
			dataIndex: "vote_count",
			key: "vote_count",
		},
		{
			title: "Has New Vote",
			dataIndex: "has_new_vote",
			key: "has_new_vote",
			render: (v: boolean) => { return <div>{`${v}`}</div> }
		},
		{
			title: "Actions",
			key: "actions",
			render: ({ id }: { id: number }) => {
				return <div>
					<Button onClick={(e) => { e.stopPropagation(); nav(`/organizations/${id}/update`) }}>Edit</Button>
					<Button onClick={(e) => { e.stopPropagation(); del(id) }}>Delete</Button>
				</div >
			}
		}
	]
	useEffect(() => {
		setLoading && setLoading(true);
		fetch(`/my/organizations?page=${page}&size=20`)
		.then(res => {
			switch (res.status) {
				case 200:
					res.json().then(data => {
						console.log(data)
						setOrgs(data.list);
						setTotal(data.total);
						setLoading && setLoading(false);
					}).catch(err => message.error(err))
					return
				case 401:
					nav("/login");
					return
				default: 
					res.text().then(err => message.error(err)).catch(err => message.error(err))
					return
			}
		}).catch(reason => {
			message.error(reason);
			setLoading && setLoading(true);
		})
	}, [page]);

	const create = () => {
		nav('/organizations/create');
	}

	return <Layout>
		<Button type="primary" onClick={create}>Create</Button>
		<Table columns={columns} dataSource={orgs} pagination={{total: total, current: page, pageSize: 20, onChange: (page) => {setPage(page)}}} onRow={(data) => {
			return {
				onClick: () => {
					nav(`/organizations/${data.id}`)
				}
			}
		}}/>
		</Layout>
}

interface Organization {
	name: string
}

export const Create = ({setLoading, setAlert}: LoadingProps & AlertProps) => {
	setLoading(false);
	const nav = useNavigate();
	const [org, setOrg] = useState<Organization>({name: ""});
	const [disable, setDisable] = useState(false);
	const create = () => {
		setDisable(true);
		setLoading(true);
		post("/organizations", {body: org}).then(() => {
			setAlert({type: "success", message: "success create"});
			setTimeout(() => {
				setAlert(null);
				nav("/organizations");
			}, 2000);
		}).catch(reason => {
			if (reason.status === 401) {
				nav("/login");
				return
			}
			setAlert({type: "error", message: `${reason}`});
			setTimeout(() => {
				setAlert(null);
			}, 2000);
		}).finally(() => {
			setDisable(false);
			setLoading(false);
		});
	}
	return <Form>
		<Form.Item label="Name">
			<Input onChange={(e) => setOrg({...org, name: e.target.value})} />
		</Form.Item>
		<Button onClick={() => {setDisable(true); create()}} disabled={disable} >Create</Button>
	</Form>
}