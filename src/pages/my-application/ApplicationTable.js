import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
  Button,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Drawer
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'

// project import
import Dot from '../../components/@extended/Dot'
import { useDispatch, useSelector } from 'react-redux'
import MainCard from '../../components/MainCard'
import { toast } from 'react-toastify'
import { deleteApplication, getDistributionByApplication } from '../../store/actions/applicationActions'
import ApplicationDetail from './ApplicationDetail'

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
    id: 'limitUserCount',
    align: 'center',
    disablePadding: true,
    label: 'User Count'
  },
  {
    id: 'versionNum',
    align: 'center',
    disablePadding: true,
    label: 'Version Number'
  },
  {
    id: 'buildNum',
    align: 'center',
    disablePadding: true,
    label: 'Build Number'
  },
  {
    id: 'capacity',
    align: 'center',
    disablePadding: true,
    label: 'Capacity'
  },
  {
    id: 'instanceCount',
    align: 'center',
    disablePadding: true,
    label: 'Views'
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

export default function ConfigurationTable () {
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
  const dispatch = useDispatch()
  const theme = useTheme()

  const matchs = useMediaQuery(theme.breakpoints.up('sm'))

  const [visibleRows, setVisibleRows] = useState([])
  const { user } = useSelector(state => state.auth)
  const { loading } = useSelector(state => state.loading)
  const [rows, setRows] = useState([])

  const [drawerSection, setDrawerSection] = useState(false)
  const [selectedID, setSelectedID] = useState('')

  useEffect(() => {
    const docRef = firebase.firestore().collection('organizations').doc(org_id)

    const unsubscribe = docRef.collection('applications').onSnapshot(snapshot => {
      const updatedData = snapshot.docs.map(doc => {
        const docRef = doc.ref.collection('instances')

        const id = doc.id

        return { id, ...doc.data() }
      })

      setRows(updatedData)

      dispatch({
        type: 'GET_APP',
        payload: updatedData
      })
    })

    // Clean up the listener when component unmounts
    return () => unsubscribe()
  }, [])

  const handleApplicationDelete = id => {
    dispatch(
      deleteApplication(org_id, id, () => {
        toast.success('The application is deactived.')
      })
    )
  }

  useEffect(() => {
    setVisibleRows(rows)
  }, [rows])

  // Search function
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    let filteredObject = []
    rows?.map(item => {
      if (item.appName?.toLocaleLowerCase().includes(searchValue)) {
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

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {loading && <LinearProgress />}
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography variant='h5'>Configurations</Typography>
          <TextField
            id='outlined-start-adornment'
            placeholder='Search by Name'
            sx={{ width: '250px' }}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} mt={2} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
          <Link to={`/my-applications/${org_id}/create`}>
            <Button variant='contained' fullWidth={!matchs}>
              Add Application
            </Button>
          </Link>
        </Grid>
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
            <ConfigurationTableHeader order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={rows?.length} />
            <TableBody>
              {paginatedTableData &&
                paginatedTableData.map((row, index) => {
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
                      onClick={() => {
                        setSelectedID(row.id)
                        setDrawerSection(true)
                      }}
                    >
                      <TableCell align='center'>{index + 1 + page * rowsPerPage}</TableCell>
                      <TableCell align='center'>{row.appName}</TableCell>
                      <TableCell align='center'>{row.createdAt.toDate().toLocaleString()}</TableCell>
                      <TableCell align='center'>{row.limitUserCount}</TableCell>
                      <TableCell align='center'>{row.versionNum}</TableCell>
                      <TableCell align='center'>{row.buildNum}</TableCell>
                      <TableCell align='center'>{row.capacity && row.capacity + 'Byte'}</TableCell>
                      <TableCell align='center'>{row.instanceCount}</TableCell>
                      <TableCell align='center'>
                        <OrderStatus status={row.status} />
                      </TableCell>
                      <TableCell align='center'>
                        <Box display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
                          <Link to={`/my-applications/${org_id}/edit/${row.id}`}>
                            <Button variant='contained'>Edit</Button>
                          </Link>
                          <Button variant='contained' color='success'>
                            Monitor
                          </Button>
                          <Link to={`/my-applications/${org_id}/create-distribution/${row.id}`}>
                            <Button variant='contained' color='secondary'>
                              Distribute
                            </Button>
                          </Link>
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

        <Drawer anchor='bottom' sx={{ zIndex: 1500 }} open={drawerSection} onClose={() => setDrawerSection(false)}>
          <Box sx={{ height: 500 }} role='presentation'>
            <Grid container spacing={2} padding={2}>
              <Grid item xs={12}>
                <ApplicationDetail selectedID={selectedID} />
              </Grid>
            </Grid>
          </Box>
        </Drawer>
      </MainCard>
    </Box>
  )
}
