import { Navigate } from 'react-router-dom'
import { getToken, getUser } from '../services/authService'

function PrivateRoute({ children, role }) {
    const token = getToken()
    const user  = getUser()

    if (!token || !user) {
        return <Navigate to="/" replace />
    }

    if (role && user.role !== role) {
        const redirect = user.role === 'FORMATEUR' ? '/formateur' : '/apprenant'
        return <Navigate to={redirect} replace />
    }

    return children
}

export default PrivateRoute