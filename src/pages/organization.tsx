import { useEffect, useState, useRef, useContext } from "react"
import { Button, Input, Pagination, Table, Alert, Checkbox } from "antd";
import { useNavigate, useParams } from "react-router";
import { HttpError } from "../errors";
import { get, put, post } from "../utils/api";
import { List as ResponseList } from "../utils/response";
import { List as CVoteList } from "../components/vote";
import { Detail as COrganizationDetail, List as OrganizationList, Create as OrganizationCreate } from "../components/organization";
import { LoadingWrapper, LoadingProps } from "../wrapper/spin";
import { PaginationWrapper, PaginationProps } from "../wrapper/pagination";
import "antd/dist/antd.css";
import { AlertProps, AlertWrapper } from "../wrapper/alert";



const List = PaginationWrapper(AlertWrapper(LoadingWrapper((props: PaginationProps & AlertProps & LoadingProps) => {
	const nav = useNavigate();
	return <>
		<Button onClick={() => nav("/organizations/create")} >Create</Button>
		<OrganizationList {...props} />
	</>
})));

const Create = AlertWrapper(LoadingWrapper(OrganizationCreate));

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


type DeleteResponse = {
	deleted: number
}

const Detail = () => {
	const nav = useNavigate();
	const { organization_id } = useParams();

	return <div>
		<COrganizationDetail organization_id={organization_id!} />
		<Button onClick={() => { nav(`/organizations/${organization_id}/votes/create`) }} >Create Vote</Button>
		<Button onClick={() => { nav(`/organizations/${organization_id}/users/add`) }} >Add Users</Button>
		<CVoteList organization_id={organization_id!} />
	</div>


}

type Updation = {
	name: string,
}

const Update = () => {
	const { organization_id } = useParams();
	const [data, setData] = useState<Updation>();
	useEffect(() => {
		get<Updation>(`/organizations/${organization_id}`).then(org => {
			setData(org);
		}).catch(reason => console.log(reason));
	}, []);
	const update = () => {
		put(`/organizations/${organization_id}`, { body: data }).then(_ => { }).catch(reason => console.log(reason));
	}
	return <div>
		<Input value={data?.name} onChange={(event) => { setData({ ...data, name: event.target.value }) }} />
		<Button onClick={update}>Update</Button>
	</div>
}

type User = {
	id: number,
	nickname: string,
}

type Organization = {
	id: number,
	name: string,
}



const AddUsers = () => {
	const { organization_id } = useParams();
	const [org, setOrg] = useState<Organization | undefined>();
	const [phone, setPhone] = useState("");
	const [users, setUsers] = useState<User[]>([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [adds, setAdds] = useState<number[]>([]);
	const isInitialRender = useRef(true);


	const search = () => {
		get<ResponseList<User>>("/users", { params: { phone: phone, page: page, size: 10, exclude_org_id: organization_id } }).then(res => { setUsers(res.list); setTotal(res.total) }).catch((reason) => {
			console.error(reason);
		});
	}
	const add = () => {
		post(`/organizations/${organization_id}/users`, { body: adds }).then(() => {
			console.log("success");
		}).catch((reason) => {
			console.error(reason);
		});
	}
	const getOrg = () => {
		get<Organization>(`/organizations/${organization_id}`).then(res => setOrg(res)).catch(reason => console.error(reason));
	}
	useEffect(() => {
		if (isInitialRender.current) {
			isInitialRender.current = false;
		} else {
			search();
		}
	}, [page])
	const columns = [
		{
			title: "ID",
			dataIndex: "id",
		},
		{
			title: "Nickname",
			dataIndex: "nickname",
		},
		{
			title: "Action",
			render: ({ id }: { id: number }) => {
				return <Checkbox onChange={(e) => {
					if (e.target.checked) {
						setAdds([...adds].concat(id));
					} else {
						setAdds([...adds].splice(adds.indexOf(id), 1));
					}
				}}></Checkbox>
			},
		}
	]

	return <div>
		<h1>{org?.name || ""}</h1>
		<Input placeholder="Phone" onChange={(e) => { setPhone(e.target.value) }} />
		<Button onClick={search}>Search</Button>
		<Button onClick={add}>Submit</Button>
		<Table dataSource={users} columns={columns}></Table>
		<Pagination total={total} current={page} onChange={(p) => setPage(p)}></Pagination>

	</div>

}





export { List, Create, Detail, Update, AddUsers };