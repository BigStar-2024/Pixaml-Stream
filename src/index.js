import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// scroll bar
import 'simplebar/src/simplebar.css'

// third-party
import { Provider } from 'react-redux'

// apex-chart
import './assets/third-party/apex-chart.css'

// project import
import App from './App'
import store from './store/index'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import reportWebVitals from './reportWebVitals'

// ==============================|| MAIN - REACT DOM RENDER  ||============================== //

const container = document.getElementById('root')
const root = createRoot(container) // createRoot(container!) if you use TypeScript
root.render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter basename='/'>
        <ToastContainer style={{ fontFamily: 'Poppins' }} />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
