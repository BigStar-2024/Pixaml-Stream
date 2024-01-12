import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// material-ui
import { Box, Grid, Typography, Paper } from '@mui/material'

// project import
import { useDispatch, useSelector } from 'react-redux'
import MainCard from '../../components/MainCard'
import { getOrganizations } from '../../store/actions/mainmenuAction'
import AddIcon from '@mui/icons-material/Add'

export default function MainMenu () {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const { organizations } = useSelector(state => state.mainmenu)

  useEffect(() => {
    dispatch(getOrganizations(user.id))
  }, [])

  const handleClickOrganization = org_id => {
    dispatch({
      type: 'SELECT_ORGANIZATION',
      payload: org_id
    })

    navigate(`/dashboard/${org_id}`)
  }

  const handleAddOrganization = () => {
    navigate('/create-organization')
  }

  return (
    <Box>
      <Grid container>
        <Grid item xs={12} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography variant='h5'>All Organizations</Typography>
        </Grid>
      </Grid>
      <MainCard sx={{ mt: 2 }} content={false}>
        <Box padding={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4} xl={3}>
              <Paper sx={{ height: 150, cursor: 'pointer', borderRadius: '10px' }} elevation={8} onClick={() => handleAddOrganization()}>
                <Box padding={2} display={'flex'} justifyContent={'center'} alignItems={'center'} height={'100%'} flexDirection={'column'}>
                  <AddIcon sx={{ width: 50, height: 50 }} />
                  <Typography fontSize={20} fontWeight={'bold'}>
                    Add a organization
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            {organizations.map((org, index) => (
              <Grid item xs={12} md={6} lg={4} xl={3} key={index}>
                <Paper
                  sx={{ height: 150, cursor: 'pointer', borderRadius: '10px' }}
                  elevation={8}
                  onClick={() => handleClickOrganization(org.id)}
                >
                  <Box padding={2} display={'flex'} justifyContent={'space-between'} height={'100%'} flexDirection={'column'}>
                    <Typography fontSize={20} fontWeight={'bold'}>
                      {org.organization}
                    </Typography>
                    <Typography align='right'>{org.createdAt.toDate().toLocaleString()}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </MainCard>
    </Box>
  )
}
