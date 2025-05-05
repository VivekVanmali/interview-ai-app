import React , {useState} from "react";
import { useNavigate } from "react-router-dom";
import { auth,firestore } from "../firebase";
import {  doc,setDoc } from "firebase/firestore";
import TopMenu from "../components/TopMenu";
import "../css/reset.css";
import "../css/PDFextract_page.css";
// Form to enter CV and job description and then extract the data from CV.
const PDFextract = ({currentUser}) => {

    const [selectedJob, setSelectedJob] = useState("software_engineer");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [jobDescription, setJobDescription] = useState("");
    const [timer,setTimer] = useState(5); // default timer is 5 minutes

    //Navigate is used to redirect to another page
    const navigate = useNavigate(); 
    const currentUserId = currentUser.uid; 

    //Check file change
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    
    //Handles the submit for the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;

        if (!file) {
            setError("Please upload a file.");
            return;
        }

        //file can only be 5mb maximum
        if (file.size > 5 * 1024 * 1024) { 
            setError("File size exceeds 5MB limit.");
            return;
        }

        try{
            setLoading(true);
            setError("");

            //collects the data from the form and sends it to the backend
            const formData = new FormData();
            formData.append("file_uploaded", file);
            formData.append("job_description", jobDescription); 

            //sends the data to the backend
            const response = await fetch("/CV_extractor", { 
                method: "POST",
                body: formData,
            }); 

            if (!response.ok) {
                throw new Error("File upload failed. Please try again.");
            }

            //retrieve reponse from backend
            const data = await response.json();

            //timestamp will be stored to garantee unique id for each interview
            const timestamp = Date.now();
            const interviewid = `${currentUserId}_${timestamp.toString()}`; 
            
            await setDoc(doc(firestore, "Users", currentUserId,"interview",interviewid), { 
                jobPosition: selectedJob,
                fileName: file.name,
                fileSize: file.size,
                uploadDate: timestamp,
                cvAnalysis: data.analysed_text,
                cvPDF: data.cleaned_text,
                jobDescription: jobDescription,
                timer: timer
            });

            


            setSuccess(true);

            //Redirect to the interview page form data is a success
            navigate('/interview_page', { state: { jobPosition: selectedJob, cvAnalysis: data.analysed_text, cleanedText: data.cleaned_text,interviewId: interviewid, job_description:jobDescription , Timer:timer} });

            

        } catch (err) {
            console.error(err);
            setError(err.message || "failed to process the pdf file.");
        }
        finally {
            //reset the form and state variables
            setLoading(false);
            setSuccess(false);
            setJobDescription("");
            setTimer(null);
            setSelectedJob("software_engineer");
            form.reset(); 
            setFile(null); 
        }
        

    }
    return (
        <div id="pdf_extract_page">
        <TopMenu currentUser={currentUser} />
        <div id="pdf_extract_container">

        <form onSubmit={handleSubmit}  method="post" id="cv_form" encType="multipart/form-data">
        <h2>Fill out form</h2>
            <div id="selecting_job">
                <label htmlFor="select_job" id ="select_job_lab" >Select interview job type</label>
                <select id="select_job"  name = "select_job" value ={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} disable={loading} required>
                    <option value="software engineer">Software Engineering</option>
                    <option value="Web developer">Web Developer</option>
                    <option value="Data scientist">Data Scientist</option>
                    <option value="Data analyst">Data Analyst</option>
                    <option value="UX designer">UX Designer</option>
                    <option value="Project manager">Project Manager</option>
                    <option value="IT support">IT Support</option>
                </select>
            </div>
                <div id="timer">
                    <label htmlFor="" id="timer_lab">Select interview length</label>
                    <select name="select_time" id="select_time" value={timer} onChange={(e) => setTimer(e.target.value)} disable={loading} required>
                        <option value="5">5 minutes</option>
                        <option value="10">10 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="20">20 minutes</option>
                    </select>

                </div>

                <div className="job_description">
                    <label htmlFor="job_description">Job description:</label>
                    <textarea id="job_description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} name="job_description" rows="4" cols="50" placeholder="Enter job description here...(optional)"></textarea>
                </div>
                <div>
                    <label htmlFor="input_file">Upload your CV:</label>
                    <input type="file" id="input_file" name="file_uploaded" accept='application/pdf' onChange={handleFileChange} required method="post"/>
                </div>
                <button type="submit" className="Submit" id="submit" disabled={loading}>Submit</button>
                {loading ? "Analysing CV...":""}
            
                {error && <div className="error" id="error">{error}</div>}
                
            </form>
            
        </div>
    </div>
    );
        

};

export default PDFextract;