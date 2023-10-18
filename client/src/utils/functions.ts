export const apiGet = async (path: string) => {
    const result = await (await fetch(`${import.meta.env.VITE_DB_URL}${path}`)).json()
    return result
}