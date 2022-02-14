import { useEffect, useState } from "react"
import { get, put } from "../utils/api";
import { Checkbox, Radio, Button } from "antd";

type Option = {
	id: number,
	option: string,
}

type ListResponse = {
	question_type: "Single" | "Multi",
	options: Option[],
	answers: number[],
}

export const List = (props: { onError: (err: Error) => void, question_id: string }) => {
	const [state, setState] = useState<ListResponse | null>(null);
	const submit = () => {
		put(`/questions/${props.question_id}/answers`, { body: state?.answers })
			.then(() => { })
			.catch(reason => { props.onError(reason) })
	}
	useEffect(() => {
		get<ListResponse>(`/questions/${props.question_id}/answers`)
			.then(resp => setState(resp))
			.catch(reason => { throw reason })
	}, [props.question_id]);

	const checkboxOnChange = (event: any) => {
		if (event.target.checked) {
			let new_answer = state?.answers.concat(event.target.value) || [event.target.value];
			setState({ ...state!, answers: new_answer });
		} else {
			let new_answer = state?.answers.filter(a => a !== event.target.value) || [];
			setState({ ...state!, answers: new_answer });
		}
	}



	return <div>
		{state?.question_type === "Single" ?
			<Radio.Group value={state.answers[0] || null} onChange={(event) => { setState({ ...state, answers: [event.target.value] }) }}>
				{state.options.map(o => { return <Radio value={o.id}>{o.option}</Radio> })}
			</Radio.Group> :
			<Checkbox.Group value={state?.answers || []} >
				{state?.options.map(o => { return <Checkbox value={o.id} onChange={checkboxOnChange}>{o.option}</Checkbox> })}
			</Checkbox.Group>
		}
		<Button onClick={submit}>Submit</Button>
	</div>
}