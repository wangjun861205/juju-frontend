import { useEffect, useRef, useState } from "react"
import { Button, Input, Table, Pagination } from "antd";
import { get } from "../utils/api";
import { List as ResponseList } from "../utils/response";
import { LoadingWrapper, LoadingProps } from "../wrapper/spin";
import { List as UserList } from "../components/user";

type User = {
	id: number,
	nickname: string,
}

export const List = (props: any) => {
	return LoadingWrapper(UserList)(props)
}


export const Find = () => {
	const [phone, setPhone] = useState("");
	const [users, setUsers] = useState<User[]>([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const isInitialRender = useRef(true);

	const search = () => {
		get<ResponseList<User>>("/users", { params: { phone: phone, page: page, size: 10 } }).then(res => { setUsers(res.list); setTotal(res.total) }).catch((reason) => {
			console.error(reason);
		});

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
	]

	return <div>
		<Input placeholder="Phone" onChange={(e) => { setPhone(e.target.value) }} />
		<Button onClick={search}>Search</Button>
		<Table dataSource={users} columns={columns}></Table>
		<Pagination total={total} current={page} onChange={(p) => setPage(p)}></Pagination>

	</div>

}

