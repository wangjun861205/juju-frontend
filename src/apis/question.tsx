export const question = async (question_id: number) => {
  const res = await fetch(`/questions/${question_id}`);
  if (res.status !== 200) {
    throw new Error(await res.text());
  }
  return await res.json();
}

export const question_ids_within_vote = async (vote_id: number) => {
  const res = await fetch(`/votes/${vote_id}/question_ids`);
  if (res.status !== 200) {
    throw new Error(await res.text());
  }
  return await res.json();
}