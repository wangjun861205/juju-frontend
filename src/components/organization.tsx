import { useEffect, useState, useContext } from "react"
import { get, delete_, post } from "../utils/api";
import { List as CList, Button, Table, Form, Input, message, Card, Typography, Row, Descriptions } from "antd";
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
import { DeleteButton } from "../widgets/delete-button";

type Item = {
	id: number,
	name: string,
	version: string,
	description: string,
}

export const Detail = ({ organization_id }: { organization_id: string }) => {
	const [data, setData] = useState<Item>();
	useEffect(() => {
		fetch(`/organizations/${organization_id}`)
		.then(res => {
			if (res.status !== 200) {
				res.text()
				.then(e => message.error(e))
				.catch(e => message.error(e));
				return;
			}
			res.json().then(org => setData(org)).catch(e => message.error(e));
		})
		.catch(e => message.error(e));
	}, [organization_id]);
	return <Card>
		<Descriptions>
			<Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
			<Descriptions.Item label="Name">{data?.name}</Descriptions.Item>
			<Descriptions.Item label="Version">{data?.version}</Descriptions.Item>
			<Descriptions.Item label="Description">{data?.description}</Descriptions.Item>
		</Descriptions>
	</Card>

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
				return <div className="ActionButtonGroup">
					<Button onClick={(e) => { e.stopPropagation(); nav(`/organizations/${id}/update`) }}>Edit</Button>
					<DeleteButton content="Deleting this organization will cause all votes which related to this organization be deleted" deleteURL={`/organizations/${id}`} />
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
		<Button className='CreateButton' type="primary" onClick={create}>Create</Button>
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

export const Create = () => {
	const nav = useNavigate();
	const create = (values: any) => {
		fetch("/organizations", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values),
		})
		.then(res => {
			switch (res.status) {
				case 200:
					message.success("Successfully created");
					nav("/organizations");
					return;
				case 401:
					nav("/login");
					return;
				default:
					res.text().then(e => message.error(e)).catch(e => message.error(e))
			}
		})
	}
	return <Form onFinish={create}>
				<Form.Item name="name" className='InputName' ><Input placeholder="Name" /></Form.Item>
				<Form.Item name="description" className='InputDesc'><Input.TextArea  placeholder='Description' rows={10}/></Form.Item>
				<Form.Item><Button type='primary' htmlType='submit'>Create</Button></Form.Item>
			</Form>
}