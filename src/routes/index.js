import { useRoutes } from 'react-router-dom'

// project import
import LoginRoutes from './LoginRoutes'
import MainRoutes from './MainRoutes'
import MenuRoutes from './MenuRoutes'

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes () {
  return useRoutes([LoginRoutes, MenuRoutes, MainRoutes])
}
