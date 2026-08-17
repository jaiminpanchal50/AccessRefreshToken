import { createBrowserRouter } from "react-router";

export const routes = createBrowserRouter([
  {
    path: "/login",
    element: <h1>Login page</h1>,
  },
  {
    path: "/register",
    element: <h1>Register page</h1>,
  },
  {
    path: "/",
    element: <h1>Home page</h1>,
  },
]);
