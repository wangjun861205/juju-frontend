import { useEffect, useState } from "react";
import { delete_, get, post } from "../utils/api"
import { List as AList, Button, Modal, Input, Radio, Checkbox } from "antd";
import { setDayWithOptions } from "date-fns/fp";

type Item = {
	id: number,
	option: string,
}

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

export const List = (props: { question_id: string, onError: (err: Error) => void }) => {
	const [state, setState] = useState<Item[]>();
	const [visible, setVisible] = useState<boolean>(false);
	const add = (options: string[]) => {
		post(`/questions/${props.question_id}/options`, { body: options }).then(() => { setVisible(false) }).catch(reason => { throw reason });
		setVisible(false);
	}
	const remove = (option_id: number) => {
		delete_(`/options/${option_id}`).then(() => {
			const newState = state?.filter(o => o.id !== option_id);
			setState(newState);
		}).catch(reason => { props.onError(reason) })
	}
	useEffect(() => {
		get<Item[]>(`/questions/${props.question_id}/options`).then(res => { setState(res) }).catch(reason => { props.onError(reason) });
	}, [props])

	return <div>
		<Button onClick={() => { setVisible(!visible) }}>Add Option</Button>
		<AddModal onOk={add} onCancel={() => { }} visible={visible} onError={props.onError} />
		<AList split={true}>
			{state?.map(o => {
				return <div><span>o.option</span> <Button onClick={() => {
					remove(o.id)
				}}>Remove</Button></div>
			})}
		</AList>
	</div>
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