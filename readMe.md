# Authentication — Access & Refresh Tokens

A complete reference covering token-based authentication using **Access + Refresh Tokens**, with full Axios interceptor integration for seamless silent token renewal on the client side.

---

## 📌 Authentication Methods

There are many authentication methods available, but this document focuses on two:

| Method | Description |
|--------|-------------|
| Singleton Token | A single token is issued with a set expiry time. Once expired, the user must log in again — poor UX for long sessions. |
| Multiple Token (Access + Refresh) | Two tokens are issued — an **access token** and a **refresh token** — working together for better security and UX. |

---

## 🔑 Singleton Token Authentication

A single token is generated upon login and assigned an **expiry time**. Once it expires, the user must log in again to receive a new token.

**Characteristics:**
- Simple to implement
- Token is invalidated after expiry
- User must re-authenticate after every expiry

---

## 🔄 Multiple Token Authentication (Access + Refresh)

Two tokens are issued at login:

1. **Access Token** — used to access protected resources
2. **Refresh Token** — used to silently obtain a new access token when the current one expires

This approach improves security by keeping the access token short-lived while maintaining a seamless user experience through **automatic token renewal** (no forced re-login).

---

### ⚡ Access Token

| Property | Detail |
|----------|--------|
| **Purpose** | Authorize requests to protected routes & resources |
| **Lifetime** | Short-lived (minutes to a few hours) |
| **Storage** | `HttpOnly` cookies |
| **Usage** | Sent automatically with every protected API request (via cookies) |

**How it works:**
- Issued at login alongside the refresh token
- Sent automatically via `HttpOnly` cookies — no manual header attachment needed
- Once expired, the client uses the refresh token to get a new one — **no re-login required**

---

### 🔁 Refresh Token

| Property | Detail |
|----------|--------|
| **Purpose** | Obtain a new access token after expiry |
| **Lifetime** | Long-lived (days to months) |
| **Storage** | Database **and** `HttpOnly` cookies |
| **Usage** | Only called when the access token has expired (`401` response) |

**How it works:**
- Stored securely in both the database and the client's `HttpOnly` cookies
- **Not** used to access resources directly
- When the access token expires, the client sends the refresh token to `/auth/refresh`
- The server validates the refresh token against the stored value (**token rotation check**)
- A **new** access token **and** a **new** refresh token are issued (old refresh token is now invalid)
- If the refresh token itself expires or mismatches, the user must log in again

---

## 🔐 Token Flow Summary

```
User Login
    │
    ├──► Access Token  (short-lived) ──► Used for all API requests
    │
    └──► Refresh Token (long-lived)  ──► Stored in DB + cookies
                                              │
              API returns 401 ───────────────►│
                                              ▼
                                   GET /auth/refresh
                                              │
                                    Validate refresh token
                                    against DB stored value
                                              │
                                    ┌─────────┴──────────┐
                                    │ New Access Token    │
                                    │ New Refresh Token   │  ← Token Rotation
                                    └─────────────────────┘
                                              │
                                    Retry original request
```

---

## 🛣️ API Endpoints

| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and receive tokens in cookies |
| `GET` | `/api/auth/refresh` | ❌ (uses refresh token cookie) | Get a new access token |
| `GET` | `/api/auth/me` | ✅ | Get current logged-in user's profile |

---

## 🔒 Backend — Auth Middleware

The `authUser` middleware protects routes by validating the access token from cookies:

```js
// middleware/auth.middleware.js
export async function authUser(req, res, next) {
    try {
        const accessToken = req.cookies.accessToken

        if (!accessToken) {
            return res.status(401).json({ success: false, message: "Unauthorized access" })
        }

        const decode = jwt.verify(accessToken, appConfig.JWT_ACCESS_SECRET)
        const user = await userModel.findById(decode.id).select('-refreshToken')

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        req.user = user  // attach user to request object
        next()

    } catch (err) {
        if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid or expired token" })
        }
        next(err)
    }
}
```

> **Key point:** The middleware returns `401` when the access token is expired. The frontend Axios interceptor catches this `401` and silently calls `/auth/refresh` before retrying the original request.

---

## 🔁 Token Rotation (Backend)

Every time `/auth/refresh` is called, the server:
1. Verifies the incoming refresh token (JWT signature + expiry)
2. Compares it against the **stored value in the database**
3. Issues a **new access token** and a **new refresh token**
4. Saves the new refresh token to the database (old one is now invalid)

This prevents **refresh token reuse attacks** — if a stolen token is used twice, the second attempt will fail because the DB value has already changed.

---

## 🚀 Axios Interceptors

Axios interceptors are **middleware functions** that run before a request is sent or after a response is received. They allow you to centrally handle tasks like:

- Attaching auth headers
- Logging requests/responses
- Handling errors globally
- **Silently refreshing expired tokens** ← the most important use case here

### Types of Interceptors

| Type | When it runs | Common Use Cases |
|------|-------------|-----------------|
| **Request Interceptor** | Before the request is sent | Add auth headers, log outgoing requests, modify config |
| **Response Interceptor** | After the response arrives | Handle errors globally, retry on `401`, transform data |

---

### 🛠️ Setting Up an Axios Instance

Always create a **custom Axios instance** so all your API calls share the same base URL and configuration:

```js
// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // backend base URL
  withCredentials: true,                 // REQUIRED: sends cookies with every request
});

export default api;
```

> `withCredentials: true` is **required** when using `HttpOnly` cookies. Without it, browsers will not include cookies in cross-origin requests.

---

### 📤 Request Interceptor

A request interceptor runs before every outgoing request. Since tokens are stored in `HttpOnly` cookies, they are sent automatically — so a request interceptor is mainly used for **logging** or adding non-cookie headers.

```js
api.interceptors.request.use(
  (config) => {
    // Tokens in HttpOnly cookies are sent automatically by the browser.
    // Use this for logging or adding custom headers.
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;  // always return config to continue the request
  },
  (error) => {
    // Handle request setup errors (e.g., network down before request is sent)
    return Promise.reject(error);
  }
);
```

**If you store tokens in `localStorage` instead of cookies**, attach the Bearer token here:

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### 📥 Response Interceptor — Silent Token Renewal

The response interceptor is the **heart of silent token renewal**. When the server returns `401 Unauthorized` (access token expired), it automatically:

1. Calls `/auth/refresh` to get a new access token
2. Retries the original failed request

A `failedQueue` is used to handle multiple simultaneous `401` responses (prevents a "refresh storm"):

```js
// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve();
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,  // pass successful responses through unchanged

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        // Another request is already refreshing — queue this one
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;  // prevent infinite retry loop
      isRefreshing = true;

      try {
        await api.get('/auth/refresh'); // server sets new cookies automatically
        processQueue(null);
        return api(originalRequest);   // retry the original failed request

      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = '/login'; // refresh token expired — force login
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 📦 Basic Usage Examples

Use `api` from `axiosInstance.js` everywhere instead of calling `axios` directly:

### Register a new user

```js
import api from './api/axiosInstance';

async function register(name, email, password) {
  const response = await api.post('/auth/register', { name, email, password });
  console.log(response.data);
  // { success: true, message: "User registered successfully", user: {...} }
}
```

### Login

```js
async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  // Tokens are automatically set in HttpOnly cookies by the server
  console.log(response.data.user);
}
```

### Call a protected route (`/me`)

```js
// No manual token attachment needed — cookies are sent automatically
async function getProfile() {
  try {
    const response = await api.get('/auth/me');
    console.log(response.data.user);
    // If access token is expired, the interceptor silently refreshes and retries
  } catch (error) {
    // Only throws if refresh token is also expired → user needs to log in again
    console.error('Session expired');
  }
}
```

### Manual refresh (rarely needed — the interceptor handles this automatically)

```js
async function refreshToken() {
  const response = await api.get('/auth/refresh');
  console.log(response.data.message); // "New access token generated"
}
```

### Using inside a React component

```jsx
import { useEffect, useState } from 'react';
import api from './api/axiosInstance';

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Interceptor already tried to refresh — if still failing, redirect to login
        window.location.href = '/login';
      });
  }, []);

  if (!user) return <p>Loading...</p>;
  return <h1>Welcome, {user.name}!</h1>;
}
```

---

## 📝 Security Notes

- Always store tokens in **`HttpOnly` cookies** to prevent XSS attacks — JavaScript cannot read them.
- Never expose the refresh token to JavaScript if possible.
- Always set `withCredentials: true` on your Axios instance for cookies to be sent cross-origin.
- Implement **token rotation** on the refresh endpoint — invalidate the old refresh token and issue a new one with each use (already done in this project).
- Use `sameSite: "strict"` in production cookies to prevent CSRF attacks.
- Use `secure: true` in production to ensure cookies are only sent over HTTPS.
- The `isRefreshing` flag in the interceptor prevents a **refresh storm** — multiple simultaneous `401` responses would otherwise trigger multiple `/auth/refresh` calls.

---

## ⚠️ Common Mistakes & Corrections

| ❌ Mistake | ✅ Correct Approach |
|-----------|-------------------|
| Using global `axios` directly | Create a custom `axios.create()` instance |
| Forgetting `withCredentials: true` | Always set it when using cookie-based auth |
| No `_retry` flag in the interceptor | Without it, a failed refresh causes an infinite loop |
| Not handling the refresh failure case | Redirect to `/login` when refresh token is also expired |
| Storing refresh tokens only in cookies | Store in **both** the database and cookies for rotation checks |
| `user.save()` without `await` | Always `await user.save()` to ensure tokens are persisted before responding |


## What is outlet in react-router