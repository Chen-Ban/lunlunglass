import './App.css'
import Router from './router'
import { Provider } from 'react-redux'
import store from './store/index'
import 'antd/dist/reset.css'

function App() {
  return (
    <Provider store={store}>
      <Router></Router>
    </Provider>
  )
}

export default App
