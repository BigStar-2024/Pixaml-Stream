import { Link, useNavigate, useParams } from 'react-router-dom'

// material-ui
import { Grid, Stack, Typography } from '@mui/material'

// project import
import InviteAuthRegister from './auth-forms/InviteAuthRegister'
import AuthWrapper from './AuthWrapper'

// ================================|| REGISTER ||================================ //

function InviteRegister () {
  const token = useParams().token

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction='row' justifyContent='space-between' alignItems='baseline' sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant='h3'>Invitation Sign up</Typography>
            <Typography component={Link} to={`/invite/login/${token}`} variant='body1' sx={{ textDecoration: 'none', color: 'black' }}>
              Already have an account?
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <InviteAuthRegister />
        </Grid>
      </Grid>
    </AuthWrapper>
  )
}

export default InviteRegister
