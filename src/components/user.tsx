import { useEffect, useState, useContext } from "react"
import { Table } from "antd"
import { get } from "../utils/api"
import { useParams } from "react-router";
import { List as ResponseList } from "../utils/response"
import { LoadingContext } from "../wrapper/spin"

type ListProps = {
	setLoading: (loading: boolean) => void,
}

type User = {
	id: number,
	nickname: string,
}

const List = () => {
	const setLoading = useContext(LoadingContext);
	const [users, setUsers] = useState<ResponseList<User> | undefined>();
	const [page, setPage] = useState(1);
	const { org_id } = useParams();
	const fetch = () => {
		setLoading!(true)
		get<ResponseList<User>>(`/users`, {
			params: {
				org_id: org_id,
				page: page,
				size: 10,
			}
		}).then((res: ResponseList<User>) => {
			setUsers(res);
		}).catch(reason => console.error(reason))
			.finally(() => {
				setLoading!(false);
			});
	}
	useEffect(fetch, [page]);
	const columns = [
		{
			title: "ID",
			dataIndex: "id",
		},
		{
			title: "Nickname",
			dataIndex: "nickname",
		}
	];
	return <Table columns={columns} dataSource={users?.list || []} pagination={{ defaultPageSize: 10, onChange: (page, size) => { setPage(page) }, total: users?.total || 0 }} />
}

export { List }