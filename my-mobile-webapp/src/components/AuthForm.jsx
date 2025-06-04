import { useState } from 'react'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'

export default function AuthForm({ isLogin, setError }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields')
        return
      }

      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return
        }
        await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        )
      } else {
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        )
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email"
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your password"
          autoComplete="off"
        />
      </div>

      {!isLogin && (
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm your password"
            autoComplete="off"
          />
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember"
          name="remember"
          className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
          Remember Me
        </label>
      </div>

      {isLogin && (
        <div className="text-sm">
          <a href="#" className="text-blue-600 hover:underline">
            Forgot Password?
          </a>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 mt-6"
      >
        {isLogin ? 'Login' : 'Register'}
      </button>
    </form>
  )
} 