import React from 'react'
import { Outlet } from 'react-router'

const MainLayout = () => {
    return (
        <>
            <h1>Header</h1>
            <Outlet />
        </>
    )
}

export default MainLayout