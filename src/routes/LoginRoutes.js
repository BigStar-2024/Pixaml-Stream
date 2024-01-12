import { lazy } from 'react'

// project import
import Loadable from '../components/Loadable'
import MinimalLayout from '../layout/MinimalLayout'

// render - login
const AuthLogin = Loadable(lazy(() => import('../pages/authentication/Login')))
const AuthRegister = Loadable(lazy(() => import('../pages/authentication/Register')))
const InviteRegister = Loadable(lazy(() => import('../pages/authentication/InviteRegister')))
const InviteLogin = Loadable(lazy(() => import('../pages/authentication/InviteLogin')))

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/',
      element: <AuthLogin />
    },
    {
      path: 'login',
      element: <AuthLogin />
    },
    {
      path: 'register',
      element: <AuthRegister />
    },
    {
      path: 'invite/login/:token',
      element: <InviteLogin />
    },
    {
      path: 'invite/register/:token',
      element: <InviteRegister />
    }
  ]
}

export default LoginRoutes
