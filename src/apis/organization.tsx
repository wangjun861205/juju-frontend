export const search = async (keyword: string, page: number, size: number) => {
    const res = await fetch(`/organizations?keyword=${keyword}&page=${page}&size=${size}`);
    if (res.status !== 200) {
        throw await res.text();
    }
    return await res.json();
}