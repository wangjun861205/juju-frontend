import { useEffect, useState, useCallback, SetStateAction, Dispatch } from "react";
import { Row, List as AList, Button, Modal, Input, Radio, Checkbox, message, Table } from "antd";
import Item from "antd/lib/list/Item";
import { delete_option, options_within_question, add_options } from "../apis/options";
import { Option } from "../models/opt";
import { useNavigate } from "react-router";

interface AddModalProps  {
	visible: boolean,
	options: string[],
	setOptions: Dispatch<SetStateAction<string[]>>,
	onOk: () => void,
	onCancel: () => void,
}

export const AddModal = ({visible, options, setOptions, onOk, onCancel}: AddModalProps ) => {
	const more = () => {
		setOptions(old => { return [...old, ""] })
	}


	return <Modal visible={visible} onOk={onOk} onCancel={ onCancel }>
		<Button onClick={more}>More</Button>
		{options.map((o, i) => {
			return <div>
				<Input value={o} onChange={(event) => {
				setOptions(old => {
					old[i] = event.target.value;
					return [...old];
				});
				}} />
				<Row>
					<Button onClick={() => {
					setOptions(old => {
						old.splice(i, 1);
						return [...old];
					})
					}}>Remove</Button>
				</Row>
			</div>
		})}
	</Modal>

}

type Item = {
	id: number,
	option: string,
	checked: boolean,
}

type ListResponse = {
	question_type: "Single" | "Multi",
	items: Item[],
}



export const List = ({ question_id }: { question_id: number }) => {
	const [refresh, setRefresh] = useState(0);
	const [options, setOptions] = useState<Option[]>();
	const nav = useNavigate();

	const remove = (id: number) => {
		delete_option(id)
		.then(_ => setRefresh(o => Math.abs(o-1)) )
		.catch(err => {
			message.error(err);
		})
	}

	useEffect(() => {
		options_within_question(question_id)
		.then(opts => setOptions(opts))
		.catch(err => {
			message.error(err);
			nav(-1);
		})
	}, [question_id, refresh])

	return <div>
		<Table columns={[
			{
				key: 'id',
				title: 'ID',
				dataIndex: 'id',
			},
			{
				key: 'option',
				title: 'Option',
				dataIndex: 'option',
			},
			{
				key: 'action',
				title: 'Action',
				render: (_, record) => {
					return <Button onClick={() => remove(record.id) }>Delete</Button>;
				}
			}
		]} dataSource={options}/>
	</div >
}


export const SingleSelect = (props: { options: Item[], answer: number, setAnswer: (answer: number) => void, onError?: (err: Error) => void }) => {
	return <div>
		<Radio.Group options={props.options.map(o => { return { label: o.option, value: o.id } })} value={props.answer} onChange={(event) => { props.setAnswer(event.target.value) }}>
		</Radio.Group>
	</div >
}

export const MultiSelect = (props: { options: Item[], answer: number[], setAnswer: (answer: number[]) => void, onError?: (err: Error) => void }) => {
	return <div>
		<Checkbox.Group options={props.options.map(o => { return { label: o.option, value: o.id } })} value={props.answer} onChange={(values) => { props.setAnswer(values.map(v => { return v as number })) }}></Checkbox.Group>
	</div>
}