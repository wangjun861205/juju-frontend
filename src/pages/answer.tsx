import { useParams } from "react-router";
import { useState } from "react";
import { Detail as QuestionDetail } from "../components/questions";
import { List as AnswerList } from "../components/answers";
import { Alert, Button } from "antd";

export const List = () => {
	const { question_id } = useParams();
	const [error, setError] = useState<string | null>(null);
	const onError = (err: Error) => {
		setError(err.message);
		setTimeout(() => { setError(null) }, 3000);
	}
	return <div>
		{error && <Alert type="error" message={error} />}
		<QuestionDetail question_id={parseInt(question_id!)} />
		<AnswerList onError={onError} question_id={question_id!} />
	</div>
}