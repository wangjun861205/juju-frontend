export const question_with_options_and_answers = async (question_id: number) => {
  const res = await fetch(`/questions/${question_id}/with_options_and_answers`);
  if (res.status !== 200) {
    throw await res.text();
  }
  return await res.json();
}