import React, { useContext, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { AuthContext } from '../AuthContext';
import PasswordField from './PasswordField';
import './Auth.css';
export default function SignInForm() {
 const {setIsAuthenticated}=useContext(AuthContext);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false);
 const navigate=useNavigate();
 async function submit(event){
  event.preventDefault();if(busy)return;setBusy(true);
  try{const {data}=await axios.post(API_BASE_URL+'/login',{email,password},{timeout:15000});if(!data.token)throw new Error(data.message||'Unable to sign in.');localStorage.setItem('token',data.token);setIsAuthenticated(true);toast.success('Successfully logged in');navigate('/home');}
  catch(error){toast.error(error.response?.data?.message||error.message||'Unable to connect. Please try again.');}
  finally{setBusy(false);}
 }
 return <form onSubmit={submit} aria-busy={busy}>
  <h1 className="font-bold text-3xl">Sign In</h1><span>Use your email and password</span>
  <input type="email" placeholder="Email" aria-label="Email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} required disabled={busy}/>
  <PasswordField value={password} onChange={event=>setPassword(event.target.value)} disabled={busy}/>
  <button type="submit" disabled={busy}>{busy?'Signing in...':'Sign In'}</button>
 </form>;
}
