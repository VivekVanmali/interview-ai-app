import React, { useEffect, useLayoutEffect, useState } from 'react';
import {firestore} from '../firebase';
import { doc, getDoc, collection, query , where ,getDocs,deleteDoc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import "../css/reset.css";
import "../css/display.css";
import TopMenu from '../components/TopMenu';    


//Display interviews the user has done in the past
const DisplayInterview = ({ currentUser }) => {
    const [loading,setLoading] = useState(true);
    const [interviews, setInterviews] = useState(null);
    const [error, setError] = useState(null);
    const [deleteStatus,setDeleteStatus] = useState(null);

    //use Effect used to fetch all interviews of the current user
    useEffect(() => {
        const fetchInterviews = async () => { 
            try { 
                if (!currentUser){
                    setError("User not authenticated");
                    setLoading(false);
                    return;
                }
                const interviewRef = collection (firestore, 'Users',currentUser.uid,'interview');
                const query_string = query(interviewRef);
                const queryExecute = await getDocs(query_string);
                console.log(queryExecute);

                //Check to see if the users has conducted any interviews
                if (queryExecute.empty) {
                    setError("No previous interviews found");
                    setLoading(false);
                    return;
                }

                //Map through the interviews and get the data
                const interviewList = queryExecute.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                
                setInterviews(interviewList);
                setLoading(false);
            }


            catch (err){
                console.error("Error fetching interviews:", err);
                setError("Failed to fetch previous interviews");
                setLoading(false);
            }


          };
        fetchInterviews();
    },[currentUser]);


    const handleDelete = async (interviewId) => {
        try{
            if(!currentUser){
                setError("User not authenticated");
                return;
            }
            //delete confirmation
            if(!window.confirm("Are you sure you want to delete this?")){
                return;
            }

            await deleteDoc(doc(firestore, "Users", currentUser.uid, "interview", interviewId));

            setInterviews((prevInterviews) => prevInterviews.filter((interview) => interview.id !== interviewId));

            setDeleteStatus("Interview deleted successfully");

            setTimeout(setDeleteStatus(null), 2000);

            if(interviews.length <= 1){
                setError("No previous interviews found");
            }
            
        }
        catch (err){
            setError("Failed to delete interview");
        }
    }

    //Function to be able to download the interview as a pdf
    const handleButtonClick = (interview) => {
        const { id, jobPosition, uploadDate, cvAnalysis, Script,cvPDF } = interview;
    
        const doc = new jsPDF();
    
        // Format the content
        const formattedDate = new Date(uploadDate).toLocaleString();
        const cvText = "CV Analysis:\n" + (cvAnalysis ? cvAnalysis : "No CV analysis available");
        const cvPDFText = "Interviewee CV:\n" + (cvPDF ? cvPDF : "No CV PDF available");

        //Converts the script from list to a string
        const scriptText = Script
            ? Script.map((entry, index) => `Interviewer${index + 1}: ${entry.question}\nInterviewee${index + 1}: ${entry.answer}`).join('\n\n')
            : "No script available";
    
        const content = `
    Job Position: ${jobPosition}
    Date: ${formattedDate}

    ${cvPDFText}
    
    ${cvText}
    
    Interview Script:
    ${scriptText}
        `;
    
        //adding the content to pdf. First formatting the pdf
        const marginLeft = 10;
        const marginTop = 10;
        const maxLineWidth = 180;
        //Adjusted height for line spacing
        const lineHeight = 10; 
        // Track the current Y position on the page
        let cursorY = marginTop; 
    
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(content, maxLineWidth);
    
        lines.forEach((line) => {
            //Checks if the lines exceed the page height
            if (cursorY + lineHeight > doc.internal.pageSize.height - marginTop) {
                //Add a new page if the text exceeds the current page height
                doc.addPage();
                //Reset cursor to the top of the new page
                cursorY = marginTop; 
            }
            doc.text(line, marginLeft, cursorY);
            // Move the cursor down for the next line
            cursorY += lineHeight; 
        });
    
        // Save the PDF with the interview ID as the filename
        doc.save(`${currentUser.email || "User"}${uploadDate}.pdf`);
    };

    if(loading){
        return <p >Loading interviews...</p>
    }


    return(
        <div id="display_page">
            <TopMenu currentUser={currentUser} />
            <div id="display_container">
                <h1>Your previous interviews</h1>
                <div id = "interviews_container">
                    {error ? (
                        <p id = "error">Sorry, you have no previous interviews</p>)
                    :
                    (<ul>
                        {interviews.map(interview => (
                            <div key = {interview.id}>
                                <li>
                                    <button id="interiew_button" className ="interviews" onClick={() => handleButtonClick(interview)}>
                                        <h3>Job Position: {interview.jobPosition}</h3>
                                        <p>Date: {new Date(interview.uploadDate).toLocaleString()}</p>

                                    </button>
                                    <button 
                                        className="delete_btn" 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent both buttons actions to be triggered
                                            handleDelete(interview.id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </li>
                            </div>
                        ))}
                    </ul>)}
                </div>
            </div>
        </div>
    );

};

export default DisplayInterview;

