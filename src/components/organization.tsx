import { useEffect, useState, useContext } from "react"
import { get, delete_, post } from "../utils/api";
import { List as CList, Button, Table, Form, Input } from "antd";
import { AlertProps } from "../wrapper/alert";
import { List as ResponseList } from "../utils/response";
import { useNavigate } from "react-router";
import { PaginationProps } from "../wrapper/pagination";
import { LoadingProps } from "../wrapper/spin"
import { Navbar } from "./navbar";
import { ErrorProps } from "../wrapper/error";

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


export const List = ({ setLoading, page, size, setTotal, setError }: LoadingProps & PaginationProps & ErrorProps) => {
	const [orgs, setOrgs] = useState<ResponseList<ListItem>>();
	const nav = useNavigate();

	const del = async (id: number) => {
		setLoading!(true);
		delete_(`/organizations/${id}`).then(() => {
			// setAlert!({ type: "success", message: "success delete" });
		}).catch((reason) => {
			// setAlert!({ type: "error", message: reason });
			setError(reason);
		}).finally(() => {
			setLoading!(false);
			// setTimeout(() => {
			// 	setAlert!(null);
			// }, 2000);
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
	const fetch = () => {
		setLoading!(true);
		get<ResponseList<ListItem>>("/organizations", { params: { page: page, size: size } }).then(res => {
			setOrgs(res);
			setTotal!(res.total);
		}).catch(reason => {
			// setAlert({ message: `${reason}`, type: "error" });
			// setTimeout(() => { setAlert!(null) }, 2000);
			setError(reason);
		}).finally(() => {
			setLoading(false);
		});
	}

	useEffect(() => {
		fetch();
	}, [page, size]);

	const create = () => {
		nav('/organizations/create');
	}

	return <>
		<Navbar />
		<Button onClick={create}>Create</Button>
		<Table columns={columns} dataSource={orgs?.list} pagination={false} onRow={(data) => {
			return {
				onClick: () => {
					nav(`/organizations/${data.id}`)
				}
			}
		}}/>
	</>}

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