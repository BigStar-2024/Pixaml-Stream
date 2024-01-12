import { lazy } from 'react'

// project import
import Loadable from '../components/Loadable'
import MainLayout from '../layout/MainLayout'
import EditOrganization from '../pages/organization/EditOrganization'

// render - dashboard
const MainMenu = Loadable(lazy(() => import('../pages/mainmenu')))
const DashboardDefault = Loadable(lazy(() => import('../pages/dashboard')))
const Instance = Loadable(lazy(() => import('../pages/instances')))
const MyApplication = Loadable(lazy(() => import('../pages/my-application')))
const CreateApplication = Loadable(lazy(() => import('../pages/my-application/CreateApplication')))
const EditApplication = Loadable(lazy(() => import('../pages/my-application/EditApplication')))
const CreateDistribution = Loadable(lazy(() => import('../pages/my-application/CreateDistribution')))
const EditDistribution = Loadable(lazy(() => import('../pages/my-application/EditDistribution')))
const APIKeys = Loadable(lazy(() => import('../pages/apikeys')))

// render - sample page
const Billing = Loadable(lazy(() => import('../pages/billing')))
const Setting = Loadable(lazy(() => import('../pages/settings/Setting')))

// management
const Management = Loadable(lazy(() => import('../pages/management')))

// notification
const Notification = Loadable(lazy(() => import('../pages/notification')))

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: 'dashboard/:org_id',
      element: <DashboardDefault />
    },
    {
      path: 'my-applications/:org_id',
      children: [
        {
          path: '',
          element: <MyApplication />
        },
        {
          path: 'create',
          element: <CreateApplication />
        },
        {
          path: 'edit/:id',
          element: <EditApplication />
        },
        {
          path: 'create-distribution/:id',
          element: <CreateDistribution />
        },
        {
          path: 'edit-distributions/:appID/:id',
          element: <EditDistribution />
        }
      ]
    },
    {
      path: 'instances/:org_id',
      element: <Instance />
    },
    {
      path: 'api-keys/:org_id',
      element: <APIKeys />
    },
    {
      path: 'management/:org_id',
      element: <Management />
    },
    {
      path: 'billing',
      element: <Billing />
    },
    {
      path: 'edit-organization/:org_id',
      element: <EditOrganization />
    },
    {
      path: 'setting',
      element: <Setting />
    },
    {
      path: 'notifications',
      element: <Notification />
    }
  ]
}

export default MainRoutes
