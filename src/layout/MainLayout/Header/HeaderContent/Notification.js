import { useEffect, useRef, useState } from 'react'

// material-ui
import { useTheme } from '@mui/material/styles'
import {
  Avatar,
  Badge,
  Box,
  ClickAwayListener,
  IconButton,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Popper,
  Typography,
  useMediaQuery,
  Modal
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import firebase from '../../../../config/firebase'

// project import
import MainCard from '../../../../components/MainCard'
import Transitions from '../../../../components/@extended/Transitions'

// assets
import { BellOutlined, CloseOutlined } from '@ant-design/icons'
import AppSettingsAltOutlinedIcon from '@mui/icons-material/AppSettingsAltOutlined'
import { updateCheckedStatus } from '../../../../store/actions/notificationAction'

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
}

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',

  transform: 'none'
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

const Notification = () => {
  const theme = useTheme()
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'))

  const anchorRef = useRef(null)
  const [open, setOpen] = useState(false)
  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }
    setOpen(false)
  }

  // defined by user
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { org_id } = useParams()
  const { user } = useSelector(state => state.auth)
  const [unread, setUnread] = useState([])
  const [selectNotification, setSelectNotification] = useState(null)

  const [openModal, setOpenModal] = useState(false)
  const handleModalOpen = () => setOpenModal(true)
  const handleModalClose = () => setOpenModal(false)

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('notifications')
      .where('userID', '==', user.id)
      .onSnapshot(snapshot => {
        const updatedData = snapshot.docs.map(doc => {
          const title = doc.data().title
          const checked = doc.data().checked
          const createdAt = doc.data().createdAt
          const id = doc.id
          return { id, title, checked, createdAt }
        })
        const filtered = updatedData.filter(item => item.checked === false)
        filtered.sort((a, b) => {
          a.createdAt - b.createdAt
        })
        setUnread(filtered)
      })

    // Clean up the listener when component unmounts
    return () => unsubscribe()
  }, [])

  function calculateTimeInterval (startDate, endDate) {
    // Calculate the time difference in milliseconds
    const timeDifference = endDate.getTime() - startDate.getTime()

    // Convert the time difference to hours, minutes, and seconds
    const hours = Math.floor(timeDifference / 3600000)
    const minutes = Math.floor((timeDifference % 3600000) / 60000)
    const seconds = Math.floor((timeDifference % 60000) / 1000)

    // Format the result as HH:MM:SS
    const formattedResult = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`

    return formattedResult
  }

  // Helper function to pad single-digit numbers with a leading zero
  function padZero (number) {
    return number < 10 ? `0${number}` : `${number}`
  }

  const upTime = startTime => {
    const now = firebase.firestore.Timestamp.now().toDate()
    const start = startTime.toDate()
    const result = calculateTimeInterval(start, now)
    return result
  }

  const setCheckedAsRead = id => {
    dispatch(updateCheckedStatus(id))
  }

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        disableRipple
        color='secondary'
        // sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor }}
        aria-label='open profile'
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup='true'
        onClick={handleToggle}
      >
        <Badge badgeContent={unread.length} color='primary'>
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? -5 : 0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type='fade' in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: '100%',
                minWidth: 285,
                maxWidth: 420,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 285
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title='Notification'
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <IconButton size='small' onClick={handleToggle}>
                      <CloseOutlined />
                    </IconButton>
                  }
                >
                  <List
                    component='nav'
                    sx={{
                      p: 0,
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {unread.length > 0 ? (
                      unread
                        .slice(0, 5)
                        .reverse()
                        .map((notification, index) => (
                          <ListItemButton
                            key={index}
                            onClick={() => {
                              handleModalOpen()
                              setSelectNotification(notification)
                              setCheckedAsRead(notification.id)
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  color: 'success.main',
                                  bgcolor: 'success.lighter'
                                }}
                              >
                                <AppSettingsAltOutlinedIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant='h6'>{notification.title}</Typography>}
                              secondary={notification.createdAt.toDate().toLocaleString()}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant='caption' noWrap>
                                {upTime(notification.createdAt) + ' ago'}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                        ))
                    ) : (
                      <Typography align='center'>No notifications</Typography>
                    )}
                    <ListItemButton
                      sx={{ textAlign: 'center', py: `${12}px !important` }}
                      onClick={() => {
                        navigate(`notifications`)
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant='h6' color='primary'>
                            View All
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
      <Modal open={openModal} onClose={handleModalClose} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
        <Box sx={style}>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Notification
          </Typography>
          <Typography id='modal-modal-description' fontSize={20} sx={{ mt: 2 }}>
            {selectNotification?.title}
          </Typography>
          <Typography align='right' marginTop={2}>
            {selectNotification?.createdAt.toDate().toLocaleString()}
          </Typography>
        </Box>
      </Modal>
    </Box>
  )
}

export default Notification
