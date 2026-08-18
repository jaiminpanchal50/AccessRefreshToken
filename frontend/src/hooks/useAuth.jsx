import axios from "axios";
import { setError, setloading, setUser } from "../states/auth.slice";
import { useDispatch } from "react-redux";
import { useCallback, useMemo, useEffect } from "react";

export const useAuth = () => {
    const dispatch = useDispatch();

    const api = useMemo(() => axios.create({
        baseURL: "http://localhost:3000/api",
        withCredentials: true,
    }), []);

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error?.config;

                if (error?.response?.status === 401 || !originalRequest.retry) {
                    originalRequest.retry = true    
                    try {
                        await api.get("/auth/refresh");
                        return api(originalRequest);
                    } catch (refreshError) {
                        dispatch(setUser(null));
                        dispatch(setError(refreshError?.response?.data || "Session expired. Please log in again."));
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => api.interceptors.response.eject(interceptor);
    }, [api, dispatch]);

    const loginHandler = useCallback(async function loginHandler(data) {
        try {
            dispatch(setloading(true));
            const res = await api.post("/auth/login", data);
            console.log("login res", res);
            dispatch(setUser(res?.data?.user));
            dispatch(setError(null));
        } catch (error) {
            console.log("login error", error);
            dispatch(setError(error?.response?.data || error.message || "Login failed"));
        } finally {
            dispatch(setloading(false));
        }
    }, [api, dispatch]);

    const registerHandler = useCallback(async function registerHandler(data) {
        try {
            dispatch(setloading(true));
            const res = await api.post("/auth/register", data);
            console.log("register res", res);
            dispatch(setUser(res?.data?.user));
            dispatch(setError(null));
        } catch (error) {
            console.log("register error", error);
            dispatch(setError(error?.response?.data || error.message || "Registration failed"));
        } finally {
            dispatch(setloading(false));
        }
    }, [api, dispatch]);

    const getMeHandler = useCallback(async function getMeHandler() {
        try {
            dispatch(setloading(true));
            const res = await api.get("/auth/me");
            console.log("getMe res", res);
            dispatch(setUser(res?.data?.user));
            dispatch(setError(null));
            return res?.data;
        } catch (error) {
            console.log("getMe error", error);
            dispatch(setUser(null));
            dispatch(setError(error?.response?.data || error.message || "Unable to fetch user"));
            throw error;
        } finally {
            dispatch(setloading(false));
        }
    }, [api, dispatch]);

    return { loginHandler, registerHandler, getMeHandler };
};
