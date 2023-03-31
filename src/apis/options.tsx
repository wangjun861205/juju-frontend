export const options_within_question = async (question_id: number) => {
    const res = await fetch(`/questions/${question_id}/options`);
    if (res.status !== 200) {
        throw new Error(await res.text());
    }
    return await res.json();
}