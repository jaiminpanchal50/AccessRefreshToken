import { createBrowserRouter } from "react-router";
import AuthLayout from "../layouts/AuthLayout";
import { Children } from 'react';
import Login from "../pages/Login";
import Register from "../pages/Register";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: '',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
    ]
  },
  {
    path: '/home',
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <Home />
      }
    ]
  }
]);
