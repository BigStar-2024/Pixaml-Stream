import { lazy } from 'react'

// project import
import Loadable from '../components/Loadable'
import MenuLayout from '../layout/MenuLayout'

// render - login
const MainMenu = Loadable(lazy(() => import('../pages/mainmenu')))
const CreateOrganization = Loadable(lazy(() => import('../pages/organization/CreateOrganization')))

// ==============================|| AUTH ROUTING ||============================== //

const MenuRoutes = {
  path: '/',
  element: <MenuLayout />,
  children: [
    {
      path: '/',
      element: <MainMenu />
    },
    {
      path: 'main-menu',
      element: <MainMenu />
    },
    {
      path: 'create-organization',
      element: <CreateOrganization />
    }
  ]
}

export default MenuRoutes
