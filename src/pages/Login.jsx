// src/components/Login.jsx
import React, { useState } from 'react'
import bgImage from '../assets/images/asset-Login.jpg'
import assetSide from '../assets/images/Asset side.jpg'
import logo from '../assets/images/MET-logo.png'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    // TODO: call your API or auth handler
    console.log({ email, password })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background & overlay */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt="App background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Card */}
      <div className="relative z-10 flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left panel (hidden on small screens) */}
        <div className="hidden md:flex w-1/2 bg-indigo-50 items-center justify-center p-6">
          <img
            src={assetSide}
            alt="Asset management illustration"
            className="max-w-full h-auto"
          />
        </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="mb-6">
            <img src={logo} alt="MET Logo" className="h-12 mx-auto" />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md
                           placeholder-gray-500 focus:outline-none focus:ring-indigo-500
                           focus:border-indigo-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md
                           placeholder-gray-500 focus:outline-none focus:ring-indigo-500
                           focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md
                         text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none
                         focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
