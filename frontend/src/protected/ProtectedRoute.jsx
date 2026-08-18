import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router'

const ProtectedRoute = () => {

    const { user } = useSelector((state) => state.auth)

    if (!user) return <Navigate to="/" />

    
    return (
        <Outlet />
    )
}

export default ProtectedRoute