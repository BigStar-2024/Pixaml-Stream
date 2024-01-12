// assets
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const management = {
  id: 'group-management',
  title: 'Menu',
  type: 'group',
  children: [
    {
      id: 'management',
      title: 'Management',
      type: 'item',
      url: '/management',
      icon: SupervisorAccountIcon,
      breadcrumbs: false
    }
  ]
}

export default management
