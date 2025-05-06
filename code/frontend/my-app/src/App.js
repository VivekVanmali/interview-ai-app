//HAD TO DOWNLOAD JSPDF

import React,{useState,useEffect} from 'react';
import { Route, Routes, BrowserRouter,Navigate } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import Login from './pages/Login';
import Home from './pages/home';
import InterviewPage from './pages/interview_page';
import PDFextract from './pages/PDFextract_page';
import DisplayInterview from './pages/DisplayInterview';
import { auth } from './firebase';
import './css/reset.css';

function App() {

  const [currentUser, setCurrentUser] = useState(null);
  const[loading,setLoading] = useState(true);



  useEffect(() => {
   
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user); 
      } else {
        setCurrentUser(null); 
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if(loading){
    return <p className='loading'>Loading...</p>
  }

  return (
    <div>
     
            
      {/*routing checks if user is active then go to home page else goes to login page*/}
      <BrowserRouter>
      <Routes>

        <Route path='/'
        element={
        currentUser == null ? <Navigate to="/login" /> : <Navigate to="/home" />
        }
        />
        <Route path ='/register' 
        element={
        currentUser == null ? <LoginRegister /> : <Navigate to="/home" />
        } 
        />
        <Route path ='/login' 
        element={
        currentUser==null ? <Login /> : <Navigate to="/home" />
        } 
        />

        <Route path='/home' 
              element={
                currentUser ? <Home currentUser={currentUser}/> : <Navigate to="/login" />
              } 
          />
        <Route path='/interview_page' 
          element={
            currentUser ? <InterviewPage currentUser={currentUser}/> : <Navigate to="/login" />
          } 
        />
        <Route path='/pdf_extract' 
          element={
            currentUser != null ? <PDFextract currentUser={currentUser}/> : <Navigate to="/login" />
          } 
        />

          <Route path='/Display_interview' 
          element={
            currentUser != null ? <DisplayInterview currentUser={currentUser}/> : <Navigate to="/login" />
          } 
        />
        

      </Routes>
      </BrowserRouter>

      
      
    </div>
  )}

export default App