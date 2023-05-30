import { useEffect, useState, useCallback, SetStateAction, Dispatch } from "react";
import { Row, List as AList, Button, Modal, Input, Radio, Checkbox, message, Table, Image, Upload, UploadFile, UploadProps } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import Item from "antd/lib/list/Item";
import { delete_option, options_within_question, add_options } from "../apis/options";
import { Option, Create as OptionCreate } from "../models/opt";
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

interface ListProps {
	options: Option[] 
	setOptions: Dispatch<SetStateAction<Option[]>>,
}



export const List = ({ options, setOptions }: ListProps) => {
	const [editOpens, setEditOpens] = useState<boolean[]>(new Array(options.length).fill(false));

	useEffect(() => {
		setEditOpens(new Array(options.length).fill(false));
	}, [options.length])

	const setEditOpenFactory = (i: number) => {
		return (action: SetStateAction<boolean>) => {
			if (typeof action === 'function') {
				setEditOpens(prev => {
					const opens = [...prev];
					opens[i] = action(opens[i]);
					return opens;
				})
				return
			}
			setEditOpens(prev => {
				const opens = [...prev];
				opens[i] = action;
				return opens;
			})
		}
	}

	const setOptionFactory = (i: number) => {
		return (action: SetStateAction<Option>) => {
				if (typeof action === 'function') {
					setOptions(prev => {
						const opts = [...prev];
						opts[i] = action(opts[i]);
						return opts;
					})
					return
				}
				setOptions(prev => {
					const opts = [...prev];
					opts[i] = action;
					return opts;
				})
		}
	}

	const remove = (id: number) => {
		const idx = options.findIndex(o => o.id === id);
		setOptions(prev => {
			prev.splice(idx, 1);
			return [...prev];
		});
	}


	return <>
	{
		options.map((o, i) => {
			return <Update key={o.id} option={o} setOption={setOptionFactory(i)}  isOpen={editOpens[i]} setIsOpen={setEditOpenFactory(i)} />
		
		})
	}
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
				key: 'images',
				title: 'Images',
				dataIndex: 'images',
				render: (_, record) => {
					return <Row>{ record.images.map(img => { return <Image src={img} /> }) }</Row>
				}
			},
			{
				key: 'action',
				title: 'Action',
				render: (_, record, i) => {
					return <>
						<Button onClick={() => setEditOpenFactory(i)(true) }>Edit</Button>
						<Button onClick={() => remove(record.id) } danger={true}>Delete</Button>
					</>
				}
			}
		]} dataSource={options}/>
	</>
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



interface UpdateProps {
	option: Option
	setOption: Dispatch<SetStateAction<Option>>,
	isOpen: boolean,
	setIsOpen: Dispatch<SetStateAction<boolean>>,

}

export const Update = ({option, setOption, isOpen, setIsOpen}: UpdateProps) => {
	const [opt, setOpt] = useState<Option>(option);
	const onImageChange: UploadProps['onChange'] = ({fileList}) => {
		setOpt((prev) => {
			return {...prev, images: fileList.map(file => { return file.response.url })}
		})
	}
	return <Modal open={isOpen} onOk={() => {setOption(opt);setIsOpen(false)}}>
		<Input value={opt.option} placeholder="Option" onChange={(event) => {setOpt(prev => {return {...prev, option: event.target.value }})}}/>
		<Upload action="/upload/" listType="picture-card" fileList={option?.images.map(img => { return {uid: "1", name: "", url: img} })} onChange={onImageChange} />
	</Modal>
}

const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

interface CreateProps {
	onOk: (option: Option) => void,
	isOpen: boolean,
	setIsOpen: Dispatch<SetStateAction<boolean>>,
}

export const Create = ({onOk, isOpen, setIsOpen}: CreateProps) => {
	const [opt, setOpt] = useState<Option>({id: 0, option: "", images: []});


	return <div>
		<Button onClick={() => {setIsOpen(true)}}><span>Add Option</span></Button>
		<Modal open={isOpen} onOk={() => {onOk(opt); setIsOpen(false)}} destroyOnClose={true} onCancel={() => {setIsOpen(false)}}>
			<Input placeholder="Option" onChange={(event) => { setOpt(prev => {return {...prev, option: event.target.value }}) }} ></Input>
			<Upload method="PUT" action="/upload/test.png" listType="picture-card" fileList={opt?.images.map(img => { return {uid: "1", name: "", url: img} })}>
				{uploadButton}
			</Upload>
		</Modal>
		</div>
}