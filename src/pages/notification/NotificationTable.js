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
  Button,
  LinearProgress,
  Modal
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'

// project import
import Dot from '../../components/@extended/Dot'
import { useDispatch, useSelector } from 'react-redux'
import MainCard from '../../components/MainCard'
import { toast } from 'react-toastify'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { deleteNotification, updateCheckedStatus } from '../../store/actions/notificationAction'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

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
    id: 'title',
    align: 'center',
    disablePadding: true,
    label: 'Title'
  },
  {
    id: 'title',
    align: 'center',
    disablePadding: true,
    label: 'Organization'
  },
  {
    id: 'checked',
    align: 'center',
    disablePadding: true,
    label: 'Read'
  },
  {
    id: 'createdAt',
    align: 'center',
    disablePadding: true,
    label: 'Create Time'
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
      title = 'Unread'
      break
    case true:
      color = 'primary'
      title = 'Read'
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

export default function NotificationTable () {
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('')

  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    status: null
  })

  const isSelected = id => selected.indexOf(id) !== -1

  // user definition
  const dispatch = useDispatch()

  const [visibleRows, setVisibleRows] = useState([])
  const { loading } = useSelector(state => state.API)
  const [rows, setRows] = useState([])

  const [selectNotification, setSelectNotification] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const handleModalOpen = () => setOpenModal(true)
  const handleModalClose = () => setOpenModal(false)

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('notifications')
      .onSnapshot(snapshot => {
        const updatedData = snapshot.docs.map(doc => {
          const title = doc.data().title
          const checked = doc.data().checked
          const createdAt = doc.data().createdAt
          const id = doc.id
          return { id, title, checked, createdAt }
        })
        setRows(updatedData)
      })

    // Clean up the listener when component unmounts
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    setVisibleRows(rows)
  }, [rows])

  const [selectedID, setSeletedID] = useState('')
  const [openDialog, setOpenDialog] = useState(false)

  const handleDeleteNotification = () => {
    dispatch(
      deleteNotification(selectedID, () => {
        toast.success('The notification is deleted.')
      })
    )
  }

  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    let filteredObject = []
    rows?.map(item => {
      if (item.title?.toLocaleLowerCase().includes(searchValue)) {
        filteredObject.push(item)
      }
    })
    setVisibleRows(filteredObject)
  }, [searchValue])

  const [anchorEl, setAnchorEl] = useState(null)

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

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
      <Grid container>
        {loading ? (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        ) : (
          ''
        )}

        <Grid item xs={12} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography variant='h5'>Notifications</Typography>
          <TextField
            id='outlined-start-adornment'
            placeholder='Search by Name'
            sx={{ width: '250px' }}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
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
            <OrderTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={rows?.length} />
            <TableBody>
              {paginatedTableData &&
                paginatedTableData.map((row, index) => {
                  const isItemSelected = isSelected(row.id)

                  return (
                    <TableRow hover role='checkbox' sx={{ cursor: 'pointer' }} aria-checked={isItemSelected} tabIndex={-1} key={index}>
                      <TableCell align='center'>{index + 1 + page * rowsPerPage}</TableCell>
                      <TableCell
                        align='center'
                        onClick={() => {
                          handleModalOpen()
                          setSelectNotification(row)
                          dispatch(updateCheckedStatus(row.id))
                        }}
                      >
                        {row.title}
                      </TableCell>
                      <TableCell align='center'>{row.org_id}</TableCell>
                      <TableCell align='center'>
                        <OrderStatus status={row.checked} />
                      </TableCell>
                      <TableCell align='center'>{row.createdAt.toDate().toLocaleString()}</TableCell>
                      <TableCell align='center' width={'15%'}>
                        <Box display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
                          <Button
                            variant='contained'
                            onClick={() => {
                              setOpenDialog(true)
                              setSeletedID(row.id)
                            }}
                            color='error'
                          >
                            Delete
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

      <ConfirmDialog open={openDialog} setOpen={setOpenDialog} handleAction={handleDeleteNotification} />

      <Modal open={openModal} onClose={handleModalClose} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
        <Box sx={style}>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Notification
          </Typography>
          <Typography id='modal-modal-description' fontSize={20} sx={{ mt: 2 }}>
            {selectNotification?.title}
          </Typography>
          <Typography align='right' marginTop={2}>
            {selectNotification?.createdAt.toDate().toLocaleString()}
          </Typography>
        </Box>
      </Modal>
    </Box>
  )
}
