# Authentication — Access & Refresh Tokens

A concise reference covering two common token-based authentication strategies: **Singleton Token** and **Multiple Token (Access + Refresh)** authentication.

---

## 📌 Authentication Methods

There are many authentication methods available, but this document focuses on two:

| Method | Description |
|--------|-------------|
| Singleton Token | A single token is issued with a set expiry time. |
| Multiple Token | Two tokens are issued — an **access token** and a **refresh token** — working together for better security and UX. |

---

## 🔑 Singleton Token Authentication

A single token is generated upon login and assigned an **expiry time**. Once it expires, the user must log in again to receive a new token.

**Characteristics:**
- Simple to implement
- Token is invalidated after expiry
- User must re-authenticate after expiry

---

## 🔄 Multiple Token Authentication (Access + Refresh)

In this method, two tokens are issued at login:

1. **Access Token** — used to access protected resources
2. **Refresh Token** — used to silently obtain a new access token when the current one expires

This approach improves security by keeping the access token short-lived while maintaining a seamless user experience through automatic token renewal.

---

### ⚡ Access Token

| Property | Detail |
|----------|--------|
| **Purpose** | Authorize requests to protected routes & resources |
| **Lifetime** | Short-lived (minutes to a few hours) |
| **Storage** | Browser cookies (typically `HttpOnly`) |
| **Usage** | Sent with every protected API request |

**How it works:**
- Issued at login alongside the refresh token
- Attached to every request as a bearer credential
- Once expired, the client uses the refresh token to get a new one — no re-login required

---

### 🔁 Refresh Token

| Property | Detail |
|----------|--------|
| **Purpose** | Obtain a new access token after expiry |
| **Lifetime** | Long-lived (days to months) |
| **Storage** | Database **and** browser cookies |
| **Usage** | Only called when the access token has expired |

**How it works:**
- Stored securely in both the database and the client's cookies
- **Not** used to access resources directly
- When the access token expires, the client sends the refresh token to a dedicated endpoint to receive a fresh access token
- If the refresh token itself expires, the user must log in again

---

## 🔐 Token Flow Summary

```
User Login
    │
    ├──► Access Token  (short-lived) ──► Used for all API requests
    │
    └──► Refresh Token (long-lived)  ──► Used only to renew the access token
                                              │
                                              └──► New Access Token issued silently
```

---

## 📝 Security Notes

- Always store tokens in **`HttpOnly` cookies** to prevent XSS attacks.
- Never expose the refresh token to JavaScript if possible.
- Implement **token rotation** on the refresh endpoint for added security (invalidate the old refresh token and issue a new one with each use).




## Add details for axios interceptors for calling me api in details with example

## types of interceptors