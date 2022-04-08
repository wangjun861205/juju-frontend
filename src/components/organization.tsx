import { useEffect, useState } from "react"
import { get } from "../utils/api";
import { List as CList } from "antd";

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