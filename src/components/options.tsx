import { useEffect, useState, useCallback, SetStateAction, Dispatch } from "react";
import { Row, List as AList, Button, Modal, Input, Radio, Checkbox, message, Table, Image } from "antd";
import Item from "antd/lib/list/Item";
import { delete_option, options_within_question, add_options } from "../apis/options";
import { Option, Create as OptionCreate } from "../models/opt";
import { useNavigate } from "react-router";
import { Upload } from "./upload";

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

interface ListProps {
	options: Option[] 
	setOptions: Dispatch<SetStateAction<Option[]>>,
}



export const List = ({ options, setOptions }: ListProps) => {
	const nav = useNavigate();
	const remove = (id: number) => {
		const idx = options.findIndex(o => o.id === id);
		setOptions(prev => {
			prev.splice(idx, 1);
			return [...prev];
		});
	}

	return <Table columns={[
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
				key: 'images',
				title: 'Images',
				dataIndex: 'images',
				render: (_, record) => {
					return <Row>{ record.images.map(img => { return <Image src={`image/jpeg; base64, ${img}`} /> }) }</Row>
				}
			},
			{
				key: 'action',
				title: 'Action',
				render: (_, record) => {
					return <Button onClick={() => remove(record.id) }>Delete</Button>;
				}
			}
		]} dataSource={options}/>
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

interface UpsertProps {
	option: Option
	onOk: (option: Option) => void,
	isOpen: boolean,
	setIsOpen: Dispatch<SetStateAction<boolean>>,

}

export const Upsert = ({option, onOk, isOpen, setIsOpen}: UpsertProps) => {
	const [opt, setOpt] = useState<Option>(option);
	const setImages: Dispatch<SetStateAction<string[]>> = (value: SetStateAction<string[]>) => { 
		if (typeof value === "function") {
			setOpt(prev => {
				return {...prev, images: value(prev.images)}
			});
			return
		}
		setOpt(prev => {
			return {...prev, images: value}
		});
	}
	return <Modal open={isOpen} onOk={() => {onOk(opt); setIsOpen(false)}} destroyOnClose={true}>
		<Input placeholder="Option" onChange={(event) => {setOpt(prev => {return {...prev, option: event.target.value }})}}/>
		<Upload images={option.images} setImages={setImages} />
	</Modal>
}

interface CreateProps {
	setOptions: Dispatch<SetStateAction<Option[]>>,
}

export const Create = ({setOptions}: CreateProps) => {
	const [option, setOption] = useState<Option>({id: 0, option: "", images: []});
	const [isOpen, setIsOpen] = useState(false);
	const setOpt = (opt: string) => {
		setOption(prev => {
			return {...prev, option: opt}
		})
	}
	const setImages: Dispatch<SetStateAction<string[]>> = (action: SetStateAction<string[]>) => {
		if (typeof action === "function") {
			setOption(prev => {
				return {...prev, images: action(prev.images)}});
			return
		}
		setOption(prev => {
			return {...prev, images: action}
		});
	}
	return <div>
		<Button onClick={() => {setIsOpen(true)}}><span>Add Option</span></Button>
		<Modal open={isOpen} onOk={() => {setOptions(old => {return [...old, option]}); setIsOpen(false)}} destroyOnClose={true} onCancel={() => {setIsOpen(false)}}>
			<Input placeholder="Option" onChange={(event) => { setOpt(event.target.value) }} ></Input>
			<Upload images={option.images} setImages={setImages} />
		</Modal>
		</div>
}