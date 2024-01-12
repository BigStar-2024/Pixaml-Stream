// assets
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import AppSettingsAltOutlinedIcon from '@mui/icons-material/AppSettingsAltOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import WebhookOutlinedIcon from '@mui/icons-material/WebhookOutlined'

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Menu',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: DashboardOutlinedIcon,
      breadcrumbs: false
    },
    {
      id: 'myApplications',
      title: 'My applications',
      type: 'item',
      url: '/my-applications',
      icon: AppSettingsAltOutlinedIcon,
      breadcrumbs: false
    },
    {
      id: 'instances',
      title: 'Instances',
      type: 'item',
      url: '/instances',
      icon: Inventory2OutlinedIcon,
      breadcrumbs: false
    },
    {
      id: 'apiKeys',
      title: 'API Keys',
      type: 'item',
      url: '/api-keys',
      icon: WebhookOutlinedIcon,
      breadcrumbs: false
    }
  ]
}

export default dashboard
