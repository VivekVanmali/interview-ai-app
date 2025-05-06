import React,{useState,useEffect} from "react";
import { Link,useNavigate } from "react-router-dom";
import '../css/reset.css';
import '../css/loginRegister.css';
import {auth} from "../firebase";
import {signInWithEmailAndPassword} from "firebase/auth";


// Login used firebase authentication to check if user is registered
const Login = () => {
    const[email,setEmail] = useState('');
    const[password,setPassword] = useState('');
    const[error,setError] = useState('');
    const navigate = useNavigate();


    //Check if crednetials are valid
    const handleSubmit = async(e) => {   
        e.preventDefault()
        try{
            //firebase aithentication
            await signInWithEmailAndPassword(auth,email,password) 
            navigate('/home');
        } catch(err){
            console.log(err)
            //Only displays error message
            const errorCode = err.message.split("Firebase:")[1]||err.message; 
            setError(errorCode);
        
        }
    }
    return(
        <div id="loginreg_container">
            <form id="loginreg_form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <label id="email_label" htmlFor="email_input">
                    Email:
                    <input type="email" id ="email_input" required placeholder="Email" onChange={(e)=>setEmail(e.target.value)}/>
                </label>
                <label htmlFor="password_input" id="password_label">
                    Password:
                    <input type="password" id="password_input" required placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/>
                </label>
                <br />
                {error && <p id="error">{error}</p>}
                
                    <button id="submit" type='submit'>Login</button><br/>
             

                <p id="link_tag">Don't have an account? <Link to='/register'>Register</Link></p>
            </form>

        </div>

    )
}

export default Login;

