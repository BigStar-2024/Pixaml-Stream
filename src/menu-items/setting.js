// assets
import AddCardOutlinedIcon from '@mui/icons-material/AddCardOutlined'
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined'

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const support = {
  id: 'group-setting',
  title: 'Setting',
  type: 'group',
  children: [
    {
      id: 'billing',
      title: 'Billing',
      type: 'itemWithoutToken',
      url: '/billing',
      icon: AddCardOutlinedIcon,
      breadcrumbs: false
    },
    {
      id: 'setting',
      title: 'Setting',
      type: 'itemWithoutToken',
      url: '/setting',
      icon: SettingsSuggestOutlinedIcon,
      breadcrumbs: false
    }
  ]
}

export default support
