import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'

// material-ui
import { Box, Toolbar } from '@mui/material'

// project import
import Header from './Header'

// types
import { openDrawer } from '../../store/reducers/menu'
import Breadcrumbs from '../../components/@extended/Breadcrumbs'

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const dispatch = useDispatch()

  // drawer toggler
  const [open, setOpen] = useState(false)
  const handleDrawerToggle = () => {
    dispatch(openDrawer({ drawerOpen: !open }))
  }

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      <Box component='main' sx={{ width: '100%', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar />
        <Breadcrumbs navigation={navigation} title />
        <Outlet />
      </Box>
    </Box>
  )
}

export default MainLayout
