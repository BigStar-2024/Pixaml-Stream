// material-ui
import { Grid } from '@mui/material'
import { useSelector } from 'react-redux'

// project import
import ApplicationTable from './ApplicationTable'

// ==============================|| SAMPLE PAGE ||============================== //

function MyApplications () {
  const { user } = useSelector(state => state.auth)

  return (
    <Grid item xs={12} md={7} lg={8}>
      <ApplicationTable />
    </Grid>
  )
}

export default MyApplications
