import React from 'react'
import Header from './components/Header'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import './App.css';
import Login from './components/Login';
import Form from './components/Form';
import Profile from './components/Profile';
import Sign from './components/Sign';
import ChatBot from './components/ChatBot';



const App = () => {
  
  return (
    <div>
      <Header ></Header>
    {/* <div className='App-header'> */}
    
    <Routes>
      <Route path='/' element={<Home/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
      <Route path= '/form' element ={<Form />}/>
      <Route path = '/profile' element={<Profile></Profile>}/>
      <Route path= '/signup' element ={<Sign></Sign>}></Route>
      <Route path= '/chatbot' element={<ChatBot></ChatBot>}></Route>
    </Routes>
    
    
  </div>
  // </div>
  )
}

export default App