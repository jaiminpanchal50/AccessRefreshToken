import axios from "axios";
import { setError, setloading, setUser } from "../states/auth.slice";
import { useDispatch } from "react-redux";

export const useAuth = () => {
  const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true,
  });

  const dispatch = useDispatch();

  async function loginHandler(data) {
    try {
      dispatch(setloading(true));
      const res = await api.post("/auth/login", data);
      console.log("login res", res);
      dispatch(setUser(res?.data?.user));
    } catch (error) {
      console.log("login error", error);
      dispatch(setError(error));
    } finally {
      dispatch(setloading(false));
    }
  }

  async function registerHandler(data) {
    try {
      dispatch(setloading(true));
      const res = await api.post("/auth/register", data);
      console.log("register res", res);
      dispatch(setUser(res?.data?.user));
    } catch (error) {
      console.log("register error", error);
      dispatch(setError(error));
    } finally {
      dispatch(setloading(false));
    }
  }

  return { loginHandler, registerHandler };
};
