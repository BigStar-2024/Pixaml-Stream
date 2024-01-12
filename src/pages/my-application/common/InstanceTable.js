import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import firebase from '../../../config/firebase'

// material-ui
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TableSortLabel,
  TablePagination,
  Button,
  useTheme,
  Pagination
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'

// project import
import Dot from '../../../components/@extended/Dot'
import { useSelector } from 'react-redux'
import MainCard from '../../../components/MainCard'

function descendingComparator (a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator (order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort (array, comparator) {
  const stabilizedThis = array?.map((el, index) => [el, index])
  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis?.map(el => el[0])
}

// ==============================|| ORDER TABLE - HEADER CELL ||============================== //

const headCells = [
  {
    id: 'appName',
    align: 'center',
    disablePadding: true,
    label: 'Application Name'
  },
  {
    id: 'createdAt',
    align: 'center',
    disablePadding: true,
    label: 'Created'
  },
  {
    id: 'upTime',
    align: 'center',
    disablePadding: true,
    label: 'Up Time(Now - Started)'
  },
  {
    id: 'status',
    align: 'center',
    disablePadding: true,
    label: 'Status'
  }
]

// ==============================|| ORDER TABLE - HEADER ||============================== //

function ConfigurationTableHeader (props) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = property => event => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell align='center'>No</TableCell>
        {headCells.map((headCell, index) => (
          <TableCell
            key={index}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component='span' sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell align='center'>Actions</TableCell>
      </TableRow>
    </TableHead>
  )
}

ConfigurationTableHeader.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
}

// ==============================|| ORDER TABLE - STATUS ||============================== //

const OrderStatus = ({ status }) => {
  let color
  let title

  switch (status) {
    case 'published':
      color = 'success'
      title = 'Published'
      break
    case 'draft':
      color = 'primary'
      title = 'Draft'
      break
    case 'disabled':
      color = 'error'
      title = 'Disabled'
      break
  }

  return (
    <Stack direction='row' spacing={1} justifyContent={'center'} alignItems='center'>
      <Dot color={color} />
      <Typography>{title}</Typography>
    </Stack>
  )
}

OrderStatus.propTypes = {
  status: PropTypes.string
}

// ==============================|| ORDER TABLE ||============================== //

export default function InstanceTable (props) {
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('')

  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    status: null
  })

  const { org_id } = useParams()

  const isSelected = trackingNo => selected.indexOf(trackingNo) !== -1

  // user definition
  const theme = useTheme()

  const { user } = useSelector(state => state.auth)
  const [rows, setRows] = useState([])

  useEffect(() => {
    const getCurrentServerTime = async () => {
      try {
        const serverTimestamp = await firebase.firestore.FieldValue.serverTimestamp()
      } catch (error) {
        console.error('Error getting server time:', error)
      }
    }

    getCurrentServerTime()

    const organizationRef = firebase.firestore().collection('organizations').doc(org_id)
    const applicationRef = organizationRef.collection('applications').doc(props.selectedID)

    const unsubscribe = applicationRef.collection('instances').onSnapshot(snapshot => {
      const updatedData = snapshot.docs.map(doc => {
        const id = doc.id
        return { id, ...doc.data() }
      })

      setRows(updatedData)
    })

    // Clean up the listener when component unmounts
    return () => unsubscribe()
  }, [])

  // Search function
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    let filteredObject = []
    rows?.map(item => {
      if (item.name?.toLocaleLowerCase().includes(searchValue)) {
        filteredObject.push(item)
      }
    })
    setRows(filteredObject)
  }, [searchValue])

  // MUI table setting
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

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

  return (
    <Box>
      <MainCard sx={{ mt: 2 }} content={false}>
        <TableContainer
          sx={{
            width: '100%',
            overflowX: 'auto',
            position: 'relative',
            display: 'block',
            maxWidth: '100%',
            '& td, & th': { whiteSpace: 'nowrap' }
          }}
        >
          <Table
            aria-labelledby='tableTitle'
            sx={{
              '& .MuiTableCell-root:first-of-type': {
                pl: 2
              },
              '& .MuiTableCell-root:last-of-type': {
                pr: 3
              }
            }}
          >
            <ConfigurationTableHeader order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={rows?.length} />
            <TableBody>
              {rows &&
                rows.map((row, index) => {
                  const isItemSelected = isSelected(row.id)

                  return (
                    <TableRow
                      hover
                      role='checkbox'
                      sx={{ cursor: 'pointer' }}
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={index}
                      selected={isItemSelected}
                    >
                      <TableCell align='center'>{index + 1 + page * rowsPerPage}</TableCell>
                      <TableCell align='center'>{row.name}</TableCell>
                      <TableCell align='center'>{row.createdAt.toDate().toLocaleString()}</TableCell>
                      <TableCell align='center'>{upTime(row?.createdAt)}</TableCell>
                      <TableCell align='center'>
                        <OrderStatus status={row.status} />
                      </TableCell>
                      <TableCell align='center'>
                        <Box display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
                          <Button onClick={() => handleApplicationDelete(row.id)} variant='contained' color='error'>
                            Stop
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
          <Box display={'flex'} justifyContent={'center'}>
            <Pagination count={rows.length / 10 + 1} />
          </Box>
        </TableContainer>
      </MainCard>
    </Box>
  )
}
