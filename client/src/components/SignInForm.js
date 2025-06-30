// import React from 'react' ;
// import './Auth.css' ;
// import axios from 'axios';
// import { useState } from 'react';
// import toast from 'react-hot-toast';
// import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
// import { useNavigate } from 'react-router-dom';
// import { useContext } from 'react';
// import { AuthProvider, AuthContext } from '../AuthContext';

// const REACT_APP_BASE_URL="http://localhost:5000/api"

// const SignInForm = () => {
//     const {setIsAuthenticated} = useContext(AuthContext);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false) ;

//     const navigate = useNavigate();

//     const handleSignIn = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.post('https://news-together-app.onrender.com/api/v1/login', { email, password });
//             const token = response.data.token ;
//             // store the token in local storage
//             localStorage.setItem('token', token);
//             // console.log(response.data.token) ;
//             setIsAuthenticated(true) ;          
//             toast.success("Successfully logged in");
//             navigate('/home') ;

//         } catch (error) {
//             console.log('There was an error logging in!', error);
//             toast.error(error.response.data.message);
//         }
//     };

//     return (
//         <form onSubmit={handleSignIn} className=''>
//             <h1 className='font-bold text-3xl'>Sign In</h1>
//             <span>or use your email password</span>
            
//             <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            
//             <input className='relative' type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
//                 {showPassword ? (
//                     <AiOutlineEyeInvisible className='cursor-pointer absolute translate-x-32 translate-y-8'
//                     onClick={() => {
//                         setShowPassword(false);
//                         console.log(showPassword);
//                     }}
//                     fontSize={24}
//                     fill="#AFB2BF"
//                     />
//                 ) : (
//                     <AiOutlineEye className='cursor-pointer absolute translate-x-32 translate-y-8'
//                     onClick={() => {
//                         setShowPassword(true);
//                         console.log(showPassword);
//                     }}
//                     fontSize={24}
//                     fill="#AFB2BF"
//                     />
//                 )}
//             <button type="submit">Sign In</button>
//         </form>
//     );
// }

// export default SignInForm ;
"use client"
import "./Auth.css"
import axios from "axios"
import { useState } from "react"
import toast from "react-hot-toast"
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../AuthContext"

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://news-together-app.onrender.com"

const SignInForm = () => {
  const { setIsAuthenticated } = useContext(AuthContext)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
          withCredentials: true,
        },
      )

      const token = response.data.token
      localStorage.setItem("token", token)
      setIsAuthenticated(true)
      toast.success("Successfully logged in")
      navigate("/home")
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error.response?.data?.message || "Login failed. Please try again."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignIn} className="">
      <h1 className="font-bold text-3xl">Sign In</h1>
      <span>or use your email password</span>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        {showPassword ? (
          <AiOutlineEyeInvisible
            className="cursor-pointer absolute right-3 top-3"
            onClick={() => setShowPassword(false)}
            fontSize={24}
            fill="#AFB2BF"
          />
        ) : (
          <AiOutlineEye
            className="cursor-pointer absolute right-3 top-3"
            onClick={() => setShowPassword(true)}
            fontSize={24}
            fill="#AFB2BF"
          />
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  )
}

export default SignInForm
