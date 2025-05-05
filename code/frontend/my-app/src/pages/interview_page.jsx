import React, {useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { auth,firestore } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, addDoc,serverTimestamp, doc,setDoc,updateDoc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import useTextToSpeech from "../hooks/useTextToSpeech";
import useSpeechToText from "../hooks/useSpeechToText";
import "../css/reset.css";
import "../css/interview_page.css";
import TopMenu from "../components/TopMenu";


const InterviewPage = ({currentUser}) => {

    //used for speech to text
    const {speak,stopSpeaking,isSpeaking,setIsSpeaking,speechRate} = useTextToSpeech();
    
    //Used for speech recognition
    const {text,realTimeText,isListening,startListening,stopListening,clearText,hasRecognition} = useSpeechToText();
    useEffect(() => {
        if (text) {
            setAnswer(text);
        }
    }, [text]);


    
    const location = useLocation();
    const { cleanedText,jobPosition,cvAnalysis,interviewId,job_description,Timer } = location.state || {}; // Get the data passed from the previous page

    //Stop naviagting to interview page without complete previous form
    const navigate = useNavigate();
    useEffect(() =>{
        if(!cleanedText || !jobPosition || !cvAnalysis){
            navigate("/pdf_extract");
        }
    },[cleanedText,jobPosition,cvAnalysis]);

    const [start,setStart] = useState(false);
    const [error,setError] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [script,setScript] = useState([]);
    const [answer,setAnswer] = useState('');
    const [timeLeft,setTimeLeft] = useState(Timer*60); // Convert minutes to seconds
    const [interviewEnd,setInterviewEnd] = useState(false);

    // after the start button is clicked, this is triggered
    const handleStart = () => {
        setStart(true);
        fetchNextQuestion();
    }

    //To stop the speech api frrom speaking
    const handleListeningStop = () => {
        if (isListening) {
            stopListening();
        }
        else{
            startListening();
            stopSpeaking();
        }
        };

    //Fetching of question after interviewee answer
    const fetchNextQuestion = async () => {
        
        try {
            const response = await fetch("/interview_questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // sends the script cv_analysis and job position to the backend
                body: JSON.stringify({
                    script: script.map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`).join("\n"),
                    cv_analysis: cvAnalysis,
                    job_position: jobPosition,
                }),
            });

            //no response from API
            if (!response.ok) {
                throw new Error("Failed to fetch question");
            }

            // question recieved from the API
            const data = await response.json();
            setCurrentQuestion(data.question);

            //appends the new question to the script
            setScript((prevScript) => [
                ...prevScript,
                { question: data.question, answer: "" },
                ]);

                //speech for the question
                speak(data.question);

        } catch(err){
            setError("Error fetching question:", err);
        }
    };

    const handleHome = () => {  
        if (isSpeaking){
            stopSpeaking();
        }
        navigate("/home");
    };


    //for when interviewee presses  the submit button    
    const handleAnswerSubmit = async (e) => {
        //for speech recognition to text
        if (isListening){
            stopListening();

        }
        //updates script with interviewee answer
        setScript((prevScript) => {
        const updatedScript = [...prevScript];
        updatedScript[updatedScript.length - 1].answer = answer;
        return updatedScript;
        });
      
        //after all actions completed.
        setAnswer("");
        clearText();
        fetchNextQuestion();
    };

    //end of interview handling
    const handleEndInterview = async () => {
        //for speech recognition to text
        if (isListening) {
            stopListening();
        }

    
        setError("The interview has ended.")
        setTimeLeft(0);
        setInterviewEnd(true);
        
        try{
            //fetches information from API
            const response1 = await fetch("/end_interview", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cvAnalysis: cvAnalysis,
                    jobPosition: jobPosition,
                    jobDescription: job_description,
                    script: script.map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`).join("\n"),
                }),

                
            });

            //if no response from API
            if(!response1.ok){
                throw new Error(`Failed to end interview":${response1.statusText}`);
            }

            const data1 = await response1.json();

            //append the new analysis
            const updatedScript = [
                ...script,
                { question: data1.question, answer: "" }
            ];

            setScript(updatedScript);

            speak(data1.question);
            

            // Update the document with the script field
            await updateDoc(doc(firestore, "Users", currentUser.uid, "interview", interviewId), {
                Script: updatedScript.map(item => ({
                    question: String(item.question),
                    answer: String(item.answer)
                }))
            },{merge:true});


        }catch(err){
            setError(`Error ending interview: ${err.message}`);
        }
    };

    

    //timer logic
    useEffect(() => {
        let time
        if(start && timeLeft > 0){
            time = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            } , 1000);
        }else if(timeLeft === 0 && interviewEnd === false){
            
            handleEndInterview();
            setError("Time is up!");
        }
        return () => {
            clearInterval(time); 
        };
    },[start,timeLeft]);
     


 
    return (
        <div id="interview_page">
            <TopMenu currentUser={currentUser} />
            <div id="interview_container">
                <h1 id="interview_h1">Interview</h1>
                <div id="interview_content_container">
                    {/*Timer*/}
                    {start &&(
                        <p className="timer" id="timer">Time Left: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,"0")} minutes</p>
                    )}

                    {/* Prompt Area */}
                    {start && (
                        <div className="prompt_area" id="prompt_area">
                            {script.map((entry, index) => (
                                <div key={index} className="conversation_entry">
                                    <p id="interviewer"><strong>Interviewer:</strong> {entry.question}</p>
                                    {entry.answer && <p id="interviewee"><strong>Interviewee:</strong> {entry.answer}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/*start button*/ }
                    {!start && <button id="start_btn" onClick={handleStart}>Start Interview</button>}

                    {/*Input area*/}
                    {start && !interviewEnd && (
                        <div>
                            <div id = "answer_input_container">
                                <textarea
                                    id="answer_input"
                                    type="text"
                                    value={`${answer}${realTimeText}`}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault(); 
                                            handleAnswerSubmit(e); 
                                        }
                                    }}
                                    placeholder="Type your answer here..."
                                    className = {isListening ? "listening_input" : "stop_listening_input"}
                                />
                                <button id ="submit_btn" onClick={handleAnswerSubmit}>Submit Answer</button>
                            </div>


                        </div>
                    )}

                    <div id="button_container">
                        {/*record button*/}
                        {hasRecognition &&start && !interviewEnd &&(
                            <div className="speech_control">
                                <button className={isListening?"recording_button":"voice_button"} id = "record_btn" onClick={handleListeningStop}>
                                    {isListening ? "Stop Recording" : "Start Recording"}
                                </button>

                            
                            </div>
                        )}

                    {interviewEnd && !isSpeaking && 
                    <button id ="home_btn" onClick={handleHome}> back to home page</button>}    

                        {/*stop speech buttom*/}
                        {start && isSpeaking &&
                        <div>
                            <button id="speak_btn" onClick={() => stopSpeaking()}>Stop AI speech</button>
                        </div>}
                        

                        {/*end interview button*/}
                        {!interviewEnd && start && (
                            <div>
                                <button id = "end_btn"onClick={() => {{handleEndInterview()} 
                                
                                }}>End Interview</button>
                            </div>
                        )}
                    </div>


            
                    {/*error displayed*/}
                    {error && <div className="error" id="error">{error}</div>}
                </div>
            </div>


        </div>
    )
}

 export default InterviewPage;

 