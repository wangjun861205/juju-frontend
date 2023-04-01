import {Create} from "../models/answer";

export const answers_of_question = async (question_id: number) => {
    const res = await fetch(`/questions/${question_id}/answers`);
    if (res.status !== 200) {
        throw new Error(await res.text());
    }
    return await res.json();
}

export const submit_answer = async (question_id: number, answer: number[]) => {
    const res = await fetch(`/questions/${question_id}/answers`, {method: 'PUT', body: JSON.stringify(answer), headers: {'Content-Type': 'application/json'}});
    if (res.status !== 200) {
        throw new Error(await res.text());
    }
}