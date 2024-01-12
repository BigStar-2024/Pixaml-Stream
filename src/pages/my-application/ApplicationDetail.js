import { useEffect, useState } from 'react'

// material-ui
import { Box, Grid, LinearProgress, Tab } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { useDispatch, useSelector } from 'react-redux'
import DistributionTable from './common/DistributionTable'
import InstanceTable from './common/InstanceTable'
import { getDistributionByApplication } from '../../store/actions/applicationActions'

export default function ApplicationDetail (props) {
  const [value, setValue] = useState('distribution')
  const { loading } = useSelector(state => state.loading)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {loading && <LinearProgress />}
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange} aria-label='lab API tabs example'>
                <Tab label='Distributions' value='distribution' />
                <Tab label='Instances' value='instance' />
              </TabList>
            </Box>
            <TabPanel value='distribution'>
              <DistributionTable selectedID={props.selectedID} />
            </TabPanel>
            <TabPanel value='instance'>
              <InstanceTable selectedID={props.selectedID} />
            </TabPanel>
          </TabContext>
        </Grid>
      </Grid>
    </Box>
  )
}
