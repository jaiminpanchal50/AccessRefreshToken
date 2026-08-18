# Authentication & Architecture Guide

A complete reference covering secure authentication, state management, and routing patterns for modern React applications.

---

## 🏗️ Project Structure
```text
src/
├── api/             # Axios instance & interceptors
├── components/      # Shared components
├── hooks/           # Custom hooks (e.g., useAuth)
├── layouts/         # Layout components (e.g., DashboardLayout)
├── redux/           # Redux Toolkit (store, slices)
├── routes/          # ProtectedRoute, PublicRoute logic
└── pages/           # Page components
```

---

## 🔄 Redux Toolkit (Auth Management)
We use a global slice to track `user` and `isAuthenticated` status across the app.

```javascript
// redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: false },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    }
  }
});
```

---

## 🛡️ Routing & Protected Routes
We use React Router v7 to wrap components with authentication logic.

- **`ProtectedRoute`**: Redirects to `/login` if unauthenticated.
- **`PublicRoute`**: Redirects to `/dashboard` if already authenticated.

```jsx
// routes/ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

---

## 🧩 React Router v7: What is `<Outlet />`?
The `<Outlet />` component is a placeholder used in **nested routing**. It tells the parent layout where to render the child route component.

- **Example**: If `DashboardLayout` contains a sidebar and an `<Outlet />`, the active page (e.g., `/settings` or `/profile`) will inject its content exactly where the `<Outlet />` is placed.

---

## 🛠️ The `useAuth` Hook
A central hook to handle session persistence on app load.

```javascript
// hooks/useAuth.js
export const useAuth = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    // Call /api/auth/me to verify cookies and set Redux state
    api.get('/auth/me')
      .then(res => dispatch(setUser(res.data.user)))
      .catch(() => dispatch(logout()));
  }, []);
};
```

---

## 🔐 Authentication Flow
1. **Login**: Credentials sent via `api.post('/auth/login')`.
2. **Persistence**: `useAuth` checks the session on application bootstrap.
3. **Renewal**: If an API call returns `401`, the Axios interceptor calls `/auth/refresh` silently.
4. **Layouts**: Wrap views in layouts that include shared UI (Navbar/Sidebar) and an `<Outlet />` for page content.

---

## ⚠️ Common Best Practices
| Feature | Implementation |
| :--- | :--- |
| **Session** | `HttpOnly` cookies + `withCredentials: true` |
| **State** | Redux Toolkit for global user synchronization |
| **Router** | Use `<Outlet />` for consistent nested UI layouts |
| **Interceptors** | Centralized `401` handling with `failedQueue` |