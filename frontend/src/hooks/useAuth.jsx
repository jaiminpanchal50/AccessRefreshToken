import axios from 'axios'
export const useAuth = () => {

    const api = axios.create({
        baseURL: 'http://localhost:3000/api',
        withCredentials: true
    })


    async function loginHandler(data) {

        try {
            console.log("data", data)

            const res = await api.post('/auth/login', data)
            console.log("login res", res)

        } catch (error) {
            console.log("login error", error)
        }

    }


    async function registerHandler(data) {

        try {
            console.log("data", data)

            const res = await api.post('/auth/register', data)
            console.log("register res", res)

        } catch (error) {
            console.log("login error", error)
        }

    }
    return { loginHandler, registerHandler }
}
