import { useState } from 'react'
import Login from './pages/Login/index.jsx'
import Register from './pages/Register/index.jsx'
import Index from './pages/Index/index.jsx'
import {Route, useLocation} from 'wouter'


function App() {
  const [path, setLocation] = useLocation()
  const token = localStorage.getItem('token')
  const RequireAuth = (children)=>{
    if(!token){
      setLocation('/login')
    } else {
      return children
    }
  }

  return (
     <>
      <Route path='/Login' component ={Login}></Route>
      <Route path='/Register' component ={Register}></Route>
      <Route path='/' component= {RequireAuth(Index)}></Route>
     </>
  )
}

export default App
