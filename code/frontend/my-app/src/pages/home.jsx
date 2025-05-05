import React from "react";
import TopMenu from "../components/TopMenu";
import { useNavigate } from "react-router-dom";
import "../css/reset.css";
import "../css/home.css"; 

//home page
const Home = ({currentUser}) => {
    const navigate = useNavigate();
    const handlePracticeInterview = () => {
        navigate("/pdf_extract"); 
    };
    const handlePreviousInterview = () => {
        navigate("/Display_interview"); 
    };

    return (
        <div id ="home_page">
            <TopMenu currentUser={currentUser} />
            <div id = "center_container">
                <div id="center_frame">
                    <div id="welcome_contianer">
                        {currentUser && <p id="welcome_message">Welcome: {currentUser.email}</p>}
                    </div>
                    <div id="interview_button">
                        <button onClick={handlePracticeInterview}>Practice Interview</button>
                        <button onClick={handlePreviousInterview}>See Previous Interview</button>
                    </div>
                    

                </div>
            </div>
        </div>
    );
};

export default Home;