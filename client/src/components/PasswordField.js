import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
export default function PasswordField({value,onChange,placeholder='Password',autoComplete='current-password',disabled=false}) {
 const [visible,setVisible]=useState(false);
 return <div className="auth-password">
   <input aria-label={placeholder} type={visible?'text':'password'} placeholder={placeholder} value={value} onChange={onChange} autoComplete={autoComplete} required disabled={disabled}/>
   <button type="button" className="auth-password-toggle" aria-label={(visible?'Hide ':'Show ')+placeholder.toLowerCase()} aria-pressed={visible} onClick={()=>setVisible(previous=>!previous)} disabled={disabled}>{visible?<AiOutlineEyeInvisible/>:<AiOutlineEye/>}</button>
 </div>;
}
