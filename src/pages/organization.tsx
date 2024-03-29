import { useEffect, useState, useRef, useContext, createContext, Context} from "react"
import { Button, Input, Pagination, Table, Alert, Checkbox, message, Form, Radio, Row } from "antd";
import { useNavigate, useParams } from "react-router";
import { HttpError } from "../errors";
import { get, put, post } from "../utils/api";
import { List as ResponseList } from "../utils/response";
import { List as CVoteList } from "../components/vote";
import { Detail as COrganizationDetail, List as OrganizationList, Create as OrganizationCreate } from "../components/organization";
import { LoadingWrapper, LoadingProps, LoadingContext } from "../wrapper/spin";
import { PaginationWrapper, PaginationProps } from "../wrapper/pagination";
import { AlertProps, AlertWrapper } from "../wrapper/alert";
import { ErrorWrapper } from "../wrapper/error";
import { search as searchOrganization } from "../apis/organization";
import './organization.css'
import TextArea from "antd/lib/input/TextArea";
import { Layout } from "../layout/layout";




const List = ErrorWrapper(LoadingWrapper(OrganizationList));

const Create = () => {
	const nav = useNavigate();
	return <div>
		<Layout>
			<Button className='BackButton' onClick={() => {nav(-1)}}>Back</Button>
			<OrganizationCreate />
		</Layout>
	</div>
}


type DeleteResponse = {
	deleted: number
}

const Detail = () => {
	const nav = useNavigate();
	const { organization_id } = useParams();

	return <div>
		<Layout>
			<COrganizationDetail organization_id={organization_id!} />
			<Row className="ButtonRow">
				<Button type="primary" onClick={() => { nav(`/organizations/${organization_id}/votes/create`) }} >Create Vote</Button>
				<Button onClick={() => { nav(`/organizations/${organization_id}/users/add`) }} >Add Users</Button>
			</Row>
			<CVoteList organization_id={organization_id!} />
		</Layout>
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
	const navigate = useNavigate();


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
		<Button onClick={() => {navigate(-1)}}>Back</Button>
		<h1>{org?.name || ""}</h1>
		<Input placeholder="Phone" onChange={(e) => { setPhone(e.target.value) }} />
		<Button onClick={search}>Search</Button>
		<Button onClick={add}>Submit</Button>
		<Table dataSource={users} columns={columns}></Table>
		<Pagination total={total} current={page} onChange={(p) => setPage(p)}></Pagination>

	</div>

}


const Search = () => {
	const [keyword, setKeyword] = useState<string>();
	const [orgs, setOrgs] = useState();
	const nav = useNavigate();
	const setLoading = useContext(LoadingContext);
	const columns = [
		{
			key: "id",
			title: "ID",
			dataIndex: "id",
		},
		{
			key: "name",
			title: "Name",
			dataIndex: "name",
		},
	]

	const search = () => {
		if (!keyword) {
			message.error("you must provide some keyword");
			return
		}
		setLoading && setLoading(true);
		searchOrganization(keyword, 1, 10)
		.then(orgs => setOrgs(orgs.list))
		.catch(err => message.error(err))
		.finally(() => {
			setLoading && setLoading(false);
		});
	}

	return <>
		<Button onClick={() => {nav(-1)}}>Back</Button>
		<Input value={keyword} onChange={(event) => {setKeyword(event.target.value)}}></Input>
		<Button disabled={!keyword!!} onClick={search}>Search</Button>
		<Table columns={columns} dataSource={orgs}></Table>
	</>
}


const SearchWithContext = LoadingWrapper(Search);


export { List, Create, Detail, Update, AddUsers, Search, SearchWithContext };