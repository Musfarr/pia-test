

import React from 'react'
import { Outlet } from 'react-router-dom'

const CallLayout = () => {
  return (

    <div className="call-layout">
        <h1  className='text-center  bg-black text-white font-bold text-xl' >Call Layout</h1>
      <Outlet />
      <footer className='text-center bg-black text-white font-semibold' >Call Footer</footer>
    </div>
  )
}

export default CallLayout