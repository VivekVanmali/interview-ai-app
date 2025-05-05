import React,{useState} from "react";
import { Link,useNavigate } from "react-router-dom";
import {auth,firestore} from "../firebase";
import {createUserWithEmailAndPassword} from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import '../css/reset.css';
import '../css/loginRegister.css';

//To register a new user if account is not created using firebase authentication
const LoginRegister = () => {
    const[email,setEmail] = useState('');
    const[password,setPassword] = useState('');
    const[confirmPassword,setConfirmPassword] = useState('');
    const[error,setError] = useState('');
    const navigate = useNavigate();

    //Chec if crednetials are valid for a new user
    const handleSubmit = async(e) => {   
        e.preventDefault()

        //Check is password and confirm password are the same
        if (password !== confirmPassword){
            setError("Passwords do not match")
            return;
        }
        
        try{
            //try to create a new user using firebase authentication
            const userCredential = await createUserWithEmailAndPassword(auth,email,password)
            const user = userCredential.user;

            //Adds the user to the firebase database
            await addDoc(collection(firestore, "Users"), {
                email: email,
                uid: user.uid, // Store the Firebase Auth UID
                role: "member" // Default role
            });
            
            console.log("User registered successfully")
            alert('Registering successful!');
            navigate('/login');
        } catch(err){
            console.log(err) 
            //if error occurs display error message
            const errorCode = err.message.split("Firebase:")[1]||err.message;
            setError(errorCode);
        }
    }
    return(
        <div className="register-container" id="loginreg_container">
            <form id="loginreg_form" onSubmit={handleSubmit}>
                <h2>Register</h2>
                {/*Email validation done by html integrated functions*/}
                <label htmlFor="email" id="email_label">
                    Email:
                    <input type="email" id = "email_input" required placeholder="Email" onChange={(e)=>setEmail(e.target.value)}/>
                </label>
                <label htmlFor="password">
                    Password:
                    <input type="password" id="password_input" required placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/>
                </label>
                <label htmlFor="confirmPassword" id="confirm_password_label">
                    Confirm Password:
                    <input type="password" required placeholder="Confirm Password" id="confirm_password_input" onChange={(e)=>setConfirmPassword(e.target.value)}/>
                </label> 
                 <br />

                {error && <p id="error" >{error}</p>}
              
                    <button type='submit' id="submit">Sign Up</button><br/>
             

                <p id="link_tag">Already have an account? <Link to='/login'>Login</Link></p>
            </form>

        </div>

    )
}

export default LoginRegister;