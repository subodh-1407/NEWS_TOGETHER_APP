import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import PasswordField from './PasswordField';
import './Auth.css';
export default function SignUpForm({setIsActive}) {
 const [fields,setFields]=useState({firstName:'',lastName:'',email:'',password:'',confirmPassword:''});
 const [busy,setBusy]=useState(false);const navigate=useNavigate();
 const change=name=>event=>setFields(previous=>({...previous,[name]:event.target.value}));
 async function submit(event){
  event.preventDefault();if(busy)return;
  if(fields.password!==fields.confirmPassword){toast.error('Passwords do not match');return;}
  setBusy(true);try{await axios.post(API_BASE_URL+'/signup',fields,{timeout:15000});toast.success('Successfully Signed Up');setFields({firstName:'',lastName:'',email:'',password:'',confirmPassword:''});setIsActive(false);navigate('/');}
  catch(error){toast.error(error.response?.data?.message||'Unable to connect. Please try again.');}finally{setBusy(false);}
 }
 return <form onSubmit={submit} aria-busy={busy}>
  <h1 className="font-bold text-3xl">Create Account</h1><span>Use your email for registration</span>
  <div className="fild"><input type="text" className="firstname" placeholder="First Name" aria-label="First Name" autoComplete="given-name" value={fields.firstName} onChange={change('firstName')} required disabled={busy}/><input type="text" className="lastname" placeholder="Last Name" aria-label="Last Name" autoComplete="family-name" value={fields.lastName} onChange={change('lastName')} required disabled={busy}/></div>
  <input type="email" placeholder="Email" aria-label="Email" autoComplete="email" value={fields.email} onChange={change('email')} required disabled={busy}/>
  <PasswordField value={fields.password} onChange={change('password')} autoComplete="new-password" disabled={busy}/>
  <PasswordField value={fields.confirmPassword} onChange={change('confirmPassword')} placeholder="Confirm Password" autoComplete="new-password" disabled={busy}/>
  <button type="submit" disabled={busy}>{busy?'Creating account...':'Sign Up'}</button>
 </form>;
}
