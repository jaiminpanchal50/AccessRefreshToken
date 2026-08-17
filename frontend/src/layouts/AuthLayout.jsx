import React from 'react'
import { Outlet } from 'react-router'

const AuthLayout = () => {
    return (
        <>
            {/* Outlet is just a normal container/div that accepts chindren itself */}
            <Outlet />
        </>
    )
}

export default AuthLayout