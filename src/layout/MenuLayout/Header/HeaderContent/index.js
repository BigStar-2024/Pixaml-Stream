// material-ui
import { Box, IconButton, Link, useMediaQuery } from '@mui/material'
import { GithubOutlined } from '@ant-design/icons'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'

// project import
import Search from './Search'
import Profile from './Profile'
import Notification from './Notification'
import MobileSection from './MobileSection'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateStyleMode } from '../../../../store/actions/authActions'

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const matchesXs = useMediaQuery(theme => theme.breakpoints.down('md'))

  const dispatch = useDispatch()

  const { styleMode } = useSelector(state => state.auth)
  const [theme, setTheme] = useState(styleMode)

  useEffect(() => {
    dispatch(updateStyleMode(theme))
  }, [theme])

  return (
    <>
      {!matchesXs && <Search />}
      {matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}

      <IconButton
        onClick={() => {
          if (theme === 'light') setTheme('dark')
          else setTheme('light')
        }}
        // sx={{ color: 'text.primary', bgcolor: 'grey.100' }}
        color='secondary'
        disableRipple
      >
        {theme === 'dark' ? <WbSunnyOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>

      <Notification />
      {!matchesXs && <Profile />}
      {matchesXs && <MobileSection />}
    </>
  )
}

export default HeaderContent
