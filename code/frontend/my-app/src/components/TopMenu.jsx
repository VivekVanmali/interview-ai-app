import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "../css/reset.css";
import "../css/top_menu.css";


// Top menu component presnent in all pages
const TopMenu = ({ currentUser }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");

        }catch (err) {
            console.error("Error logging out:", err.message);
        };
    };

    
    const goToHomePage = () => {
        navigate("/home"); // Redirect to home page
    }

    return (
        <div id="top_menu">
          <button id="home_button" onClick={goToHomePage}>
            <h1>AI MOCK INTERVIEW</h1>
          </button>
          <button onClick={handleLogout} id="logout_btn">Logout</button>
        </div>
      );

};

export default TopMenu;