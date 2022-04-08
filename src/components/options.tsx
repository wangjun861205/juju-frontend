import { useEffect, useState } from "react";
import { delete_, get, post, put } from "../utils/api"
import { List as AList, Button, Modal, Input, Radio, Checkbox } from "antd";
import Item from "antd/lib/list/Item";


export const AddModal = (props: { visible: boolean, onOk: (options: string[]) => void, onCancel: (options: string[]) => void, onError: (err: Error) => void }) => {
	const [state, setState] = useState<string[]>([""]);
	const more = () => {
		setState([...state, ""])
	}

	return <Modal visible={props.visible} onOk={() => { props.onOk([...state]); setState([""]); }} onCancel={() => { props.onCancel({ ...state }); setState([""]); }}>
		<Button onClick={more}>More</Button>
		{state.map((o, i) => {
			return <div><Input style={{ display: "inline-block" }} value={o} onChange={(event) => {
				const newState = [...state];
				newState[i] = event.target.value;
				setState(newState);
			}} /><Button style={{ display: "inline-block" }} onClick={() => {
				const newState = [...state];
				newState.splice(i, 1);
				setState(newState);
			}}>Remove</Button>
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



export const List = ({ question_id }: { question_id: string }) => {
	const [state, setState] = useState<ListResponse>({ question_type: "Single", items: [] });
	const [visible, setVisible] = useState<boolean>(false);
	const add = (options: string[]) => {
		post(`/questions/${question_id}/options`, { body: options }).then(() => { setVisible(false) }).catch(reason => { throw reason });
		setVisible(false);
	}
	const remove = (option_id: number, i: number) => {
		delete_(`/options/${option_id}`).then(() => {
			const newItems = [...state.items];
			newItems.splice(i, 1);
			setState({ ...state, items: newItems });
		}).catch(reason => { throw reason })
	}

	const submit = () => {
		put(`/questions/${question_id}/answers`, { body: state.items.filter(item => item.checked).map(item => item.id) }).then().catch(reason => { throw reason })
	}
	useEffect(() => {
		get<ListResponse>(`/questions/${question_id}/options`).then(res => { setState(res) }).catch(reason => { throw reason });
	}, [question_id])

	return <div>
		<Button onClick={() => { setVisible(!visible) }}>Add Option</Button>
		<AddModal onOk={add} onCancel={() => { }} visible={visible} onError={(e) => { throw e }} />
		<AList split={true}>
			{state.question_type === "Single"
				? state.items.map((o, i) => {
					return <div>
						<Radio checked={o.checked} onChange={(event) => {
							const newItems = [...state.items].map(item => { return { ...item, checked: false } });
							newItems[i].checked = event.target.checked;
							setState({ ...state, items: newItems });
						}}>{o.option}</Radio>
						<Button onClick={() => { remove(o.id, i) }}>Remove</Button>
					</div>
				})
				: state.items.map((o, i) => {
					return <div>
						<Checkbox checked={o.checked} onChange={(event) => {
							const newItems = [...state.items];
							newItems[i].checked = event.target.checked;
							setState({ ...state, items: newItems });
						}}>{o.option}</Checkbox>
						<Button onClick={() => { remove(o.id, i) }}>Remove</Button>
					</div>
				})}
		</AList >
		<Button onClick={submit}>Submit</Button>
	</div >
}

export const Create = (props: { onError: (err: Error) => void, options: string[], setOptions: (options: string[]) => void }) => {
	const [visible, setVisible] = useState<boolean>(false);
	return <div>
		<Button onClick={() => { setVisible(!visible) }}>Add Option</Button>
		<AddModal onOk={(options: string[]) => { props.setOptions(props.options.concat(options)); setVisible(false); }} onCancel={() => { }} visible={visible} onError={props.onError} />
		<AList split={true}>
			{props.options.map((o, i) => {
				return <div><span>{o}</span> <Button onClick={() => {
					const newState = [...props.options];
					newState.splice(i, 1);
					props.setOptions(newState);
				}}>Remove</Button></div>
			})}
		</AList>
	</div>


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