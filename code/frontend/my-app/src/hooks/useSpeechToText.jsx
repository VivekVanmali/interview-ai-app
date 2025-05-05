import { useState, useEffect } from "react";

//web speech api is used
//checking if the browser supports webkitSpeechRecognition
let recognition= null;
if("webkitSpeechRecognition" in window){   
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
}


const useSpeechToText = () => {
    const[isListening,setIsListening] = useState(false);
    const[text,setText] = useState('');
    const[realTimeText,setRealTimeText] = useState(''); 
    const[counter,setCounter] = useState(0);



    useEffect(() => {
        if(!recognition){
            return;
        }
        
        recognition.onresult = (event) => {
            let finalText = '';
            //current text is the text appearing everytime user speaks
            let currentText = '';
            //Adding the text to final text once speech recognition is done
            for(let i=0; i< event.results.length;i++){
                if(event.results[i].isFinal){
                    finalText+= event.results[i][0].transcript + ' ';
                }
                else{
                    currentText += event.results[i][0].transcript;
                }
            }

            if(finalText){
                setText(prev => prev + finalText);
                setRealTimeText('');
            }

            setRealTimeText(currentText);
              
        };
        //Starting speech recognition
        recognition.onstart = () => {
            console.log('Listening...');
            setIsListening(true);
        };

        //ening speech recognition
        recognition.onend = () => {
            console.log('Stopped listening');
            setIsListening(false);
        };

        //error in speech recognition
        recognition.onerror = (event) => {
            console.error('Error occurred in recognition: ' + event.error);
            setIsListening(false);  
        };


        },[]);

    //starting speech recognition
    const startListening = () => {
        setText('');
        setRealTimeText('');
        setIsListening(true);
        try{
            recognition.start();
        }
        catch(err){
            console.error('Error starting recognition: ', err);
            setIsListening(false);
        }
    };

    //stopping speech recognition
    const stopListening = () => {
        setIsListening(false);

        try{
            recognition.stop();
        }
        catch(err){
            console.error('Error stopping recognition: ', err);
        }
    };

    //clearing the text
    const clearText = () => {  
        setText('');
        setRealTimeText('');
    }

    //return the necessary values to file
    return{
        text,realTimeText,isListening,startListening,stopListening,clearText,hasRecognition:!!recognition,
    }
};

export default useSpeechToText;