import PropTypes from 'prop-types'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Stack, Chip, Typography } from '@mui/material'

// project import
import DrawerHeaderStyled from './DrawerHeaderStyled'
import Logo from '../../../../components/Logo'
import { Link } from 'react-router-dom'

// ==============================|| DRAWER HEADER ||============================== //

const DrawerHeader = ({ open }) => {
  const theme = useTheme()

  return (
    // only available in paid version
    <DrawerHeaderStyled theme={theme} open={open}>
      <Stack direction='row' spacing={1} alignItems='center'>
        {/* <Logo /> */}
        <Link to={'/main-menu'}>
          <Typography sx={{ cursor: 'pointer', textDecoration: 'none' }} fontSize={25} fontWeight={'bold'}>
            Pixal Stream
          </Typography>
        </Link>
        <Chip
          label={'1.0'}
          size='small'
          sx={{ height: 16, '& .MuiChip-label': { fontSize: '0.625rem', py: 0.25 } }}
          component='a'
          href='/'
          target='_blank'
          clickable
        />
      </Stack>
    </DrawerHeaderStyled>
  )
}

DrawerHeader.propTypes = {
  open: PropTypes.bool
}

export default DrawerHeader
