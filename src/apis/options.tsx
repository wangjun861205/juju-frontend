import { Create as OptionCreate } from "../models/opt"

export const options_within_question = async (question_id: number) => {
    const res = await fetch(`/questions/${question_id}/options`);
    if (res.status !== 200) {
        throw new Error(await res.text());
    }
    return await res.json();
}

export const delete_option = async (id: number) => {
    const res = await fetch(`/options/${id}`, {method: 'DELETE'});
    if (res.status !== 200) {
        throw await res.text();
    }
}

export const add_options = async (question_id: number, options: string[]) => {
    const res = await fetch(`/questions/${question_id}/options`, {method: 'POST', body: JSON.stringify(options), headers: {"Content-Type": "application/json"}})
    if (res.status !== 200) {
        throw await res.text();
    }
}