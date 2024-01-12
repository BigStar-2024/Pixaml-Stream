import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import firebase from '../../config/firebase'

// material-ui
import {
  Box,
  Grid,
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
  TextField,
  Button
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'

// project import
import Dot from '../../components/@extended/Dot'
import { useDispatch, useSelector } from 'react-redux'
import MainCard from '../../components/MainCard'
import { getInstances } from '../../store/actions/instanceActions'

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
    id: 'name',
    align: 'center',
    disablePadding: true,
    label: 'Application'
  },
  {
    id: 'createdAt',
    align: 'center',
    disablePadding: true,
    label: 'Started Time'
  },
  {
    id: 'upTime',
    align: 'center',
    disablePadding: false,
    label: 'Up Time'
  },
  {
    id: 'status',
    align: 'center',
    disablePadding: false,
    label: 'Status'
  }
]

// ==============================|| ORDER TABLE - HEADER ||============================== //

function OrderTableHead (props) {
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
const applyFilters = (tableItems, filters) => {
  return tableItems?.filter(tableItem => {
    let matches = true

    if (filters.status && tableItem.status !== filters.status) {
      matches = false
    }

    return matches
  })
}

const applyPagination = (tableItems, page, limit) => {
  return tableItems && tableItems.slice(page * limit, page * limit + limit)
}

OrderTableHead.propTypes = {
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
    case false:
      color = 'error'
      title = 'Stoped'
      break
    case true:
      color = 'primary'
      title = 'Running'
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
  status: PropTypes.bool
}

// ==============================|| ORDER TABLE ||============================== //

export default function InstanceTable () {
  // user definition
  const dispatch = useDispatch()
  let rows = useSelector(state => state.instance.allInstance) || []

  const [visibleRows, setVisibleRows] = useState([])

  const [selectedItem, setSelectedItem] = useState('')
  const [selectedItemInfo, setSelectedItemInfo] = useState(null)

  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('name')

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    status: null
  })

  useEffect(() => {
    setVisibleRows(rows || [])
  }, [rows])

  const handleClickDevice = row => {
    setSelectedItem(row?.id)
    setSelectedItemInfo(row)
  }

  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    let filteredObject = []
    rows?.map(item => {
      if (item.name?.toLocaleLowerCase().includes(searchValue)) {
        filteredObject.push(item)
      }
    })
    setVisibleRows(filteredObject)
  }, [searchValue])

  // MUI table setting
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  useEffect(() => {
    setVisibleRows(stableSort(rows, getComparator(order, orderBy)))
  }, [order, orderBy, page, rowsPerPage])

  const filteredTableItems = applyFilters(visibleRows, filters)
  const paginatedTableData = applyPagination(filteredTableItems, page, rowsPerPage)

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
      <Grid container alignItems='center' justifyContent='space-between'>
        <Grid item>
          <Typography variant='h5'>Devices</Typography>
        </Grid>
        <Box>
          <TextField
            id='outlined-start-adornment'
            placeholder='Search by Name and Type'
            sx={{ width: '250px' }}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
        </Box>
      </Grid>
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
            <OrderTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={rows?.length} />
            <TableBody>
              {paginatedTableData?.map((row, index) => {
                return (
                  <TableRow
                    hover
                    sx={{ cursor: 'pointer' }}
                    tabIndex={-1}
                    key={index}
                    onClick={() => {
                      handleClickDevice(row)
                    }}
                  >
                    <TableCell align='center'>{index + 1 + page * rowsPerPage}</TableCell>
                    <TableCell align='center'>{row.name}</TableCell>
                    <TableCell align='center'>{row.createdAt.toDate().toLocaleString()}</TableCell>
                    <TableCell align='center'>{upTime(row.createdAt)}</TableCell>
                    <TableCell align='center'>
                      <OrderStatus status={row.status} />
                    </TableCell>
                    <TableCell align='center' width={'15%'}>
                      <Box display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
                        <Button variant='contained' color='error'>
                          Stop
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          className='margin-none'
          count={rows?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </MainCard>

      {selectedItemInfo !== null ? (
        <>
          <Typography padding={2}>About Device</Typography>
          <MainCard>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography>{selectedItemInfo.name}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography>{selectedItemInfo.type}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography>{selectedItemInfo.configuration}</Typography>
              </Grid>
            </Grid>
          </MainCard>
        </>
      ) : (
        ''
      )}
    </Box>
  )
}
