import { Link, useNavigate, useParams } from 'react-router-dom'

// material-ui
import { Grid, Stack, Typography, Alert } from '@mui/material'

// project import
import InviteAuthLogin from './auth-forms/InviteAuthLogin'
import AuthWrapper from './AuthWrapper'
import { useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { checkExpireTime, getInviteEmailByToken } from '../../store/actions/authActions'

// ================================|| Invite LOGIN ||================================ //

function InviteLogin () {
  const dispatch = useDispatch()

  const { token } = useParams()

  const [expire, setExpire] = useState(false)

  useEffect(() => {
    dispatch(
      checkExpireTime(token, (currentTime, expiresAt) => {
        if (currentTime > expiresAt) {
          setExpire(true)
        } else {
          setExpire(false)
        }
      })
    )
    dispatch(getInviteEmailByToken(token))
  }, [])

  return (
    <AuthWrapper>
      {!expire ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack direction='row' justifyContent='space-between' alignItems='baseline' sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
              <Typography variant='h3'>Invitation Login</Typography>
              <Typography component={Link} to={`/invite/register/${token}`} variant='body1' sx={{ textDecoration: 'none', color: 'black' }}>
                Don&apos;t have an account?
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <InviteAuthLogin />
          </Grid>
        </Grid>
      ) : (
        <Alert severity='warning'>
          <Typography fontSize={20}>Sorry, the invitation link is expired.</Typography>
        </Alert>
      )}
    </AuthWrapper>
  )
}

export default InviteLogin
