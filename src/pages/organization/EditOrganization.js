import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
// material-ui
import { Box, Grid, Typography, IconButton, Button, TextField } from '@mui/material'

// project import
import { useDispatch, useSelector } from 'react-redux'
import MainCard from '../../components/MainCard'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import SaveAsRoundedIcon from '@mui/icons-material/SaveAsRounded'

import { getOrganization, removeOrganization, updateOrganization } from '../../store/actions/organizationAction'

export default function EditOrganization () {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { organizationID } = useSelector(state => state.auth)
  const { loading } = useSelector(state => state.loading)

  const [organizationName, setOrganizationName] = useState('')
  const [createdAt, setCreatedAt] = useState('')

  useEffect(() => {
    dispatch(
      getOrganization(organizationID, org => {
        setOrganizationName(org.organization)
        setCreatedAt(org.createdAt.toDate().toLocaleString())
      })
    )
  }, [])

  const handleRemoveOrganization = () => {
    dispatch(
      removeOrganization(organizationID, () => {
        navigate('/main-menu')
        toast.success('Removed the organization.')
      })
    )
  }

  const handleUpdateOrganization = () => {
    const organizationInfo = {
      organization: organizationName
    }
    dispatch(
      updateOrganization(organizationID, organizationInfo, () => {
        toast.success('Updated the organization')
      })
    )
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
            <Grid item xs={12} lg={6} display={'flex'} alignItems={'center'} justifyContent={'space-around'}>
              <Typography fontSize={18} fontWeight={'bold'}>
                Organization Name
              </Typography>
              <Box display={'flex'} alignItems={'center'}>
                <TextField variant='standard' value={organizationName} onChange={e => setOrganizationName(e.target.value)} />
                <IconButton disabled={loading} onClick={handleUpdateOrganization}>
                  <SaveAsRoundedIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} lg={6} display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
              <Typography fontSize={18} fontWeight={'bold'}>
                Created Date
              </Typography>
              <Typography fontSize={18} fontWeight={'bold'}>
                {createdAt}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </MainCard>
      <Box display={'flex'} justifyContent={'center'} marginTop={2}>
        <Button disabled={loading} onClick={handleRemoveOrganization} variant='contained' color='error'>
          Remove the organization
        </Button>
      </Box>
    </Box>
  )
}
