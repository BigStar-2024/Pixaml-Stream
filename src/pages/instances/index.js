// material-ui
import { Grid } from '@mui/material'
import InstanceTable from './InstanceTable'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { getInstances } from '../../store/actions/instanceActions'

// ==============================|| SAMPLE PAGE ||============================== //

function Instances () {
  const dispatch = useDispatch()
  const { org_id } = useParams()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(getInstances(org_id))
  }, [])

  return (
    <Grid item xs={12} md={7} lg={8}>
      <InstanceTable />
    </Grid>
  )
}

export default Instances
