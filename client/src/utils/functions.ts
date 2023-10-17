export const apiGet = async (path: string) => {
    return await (await fetch(`${import.meta.env.VITE_DB_URL}${path}`)).json()
}