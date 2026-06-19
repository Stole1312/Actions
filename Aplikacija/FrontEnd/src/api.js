const BASE_URL = import.meta.env.VITE_BACKEND_API_URL

export async function authFetch(url, options = {}) {
    const token = localStorage.getItem("token")

    return fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
        },
    })
}
