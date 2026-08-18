import { createBrowserRouter } from "react-router";
import AuthLayout from "../layouts/AuthLayout";
import { Children } from 'react';
import Login from "../pages/Login";
import Register from "../pages/Register";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import PublicRoute from "../protected/PublicRoute";
import ProtectedRoute from "../protected/ProtectedRoute";
import { useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";


export const routes = createBrowserRouter([
  {
    path: "/",
    element: <PublicRoute />,
    children: [
      {
        path: "",
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
      }
    ]
  },
  {
    path: '/home',
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <MainLayout />,
        children: [
          {
            path: "",
            element: <Home />
          }
        ]
      }
    ]
  }
]);
