import React, {useState,useEffect, use} from "react";

//web speeech api used
const useTextToSpeech = () => {
    const [isSpeaking,setIsSpeaking] = useState(false);
    const [speechRate,setSpeechRate] = useState(3); 
    const [voices,setVoices] = useState([]);

    //load all voices available in the browser
    useEffect(() => {
        const loadVoices = () => {
            const available_voices = window.speechSynthesis.getVoices();
            if (available_voices.length > 0){
                setVoices(available_voices);
        }
    }

    loadVoices();
    //load voices when the page is loaded
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
        window.speechSynthesis.onvoiceschanged = null;
    };
    },[]);


    // for when the page is refreshed or closed

    useEffect(() => {
        window.addEventListener('beforeunload',stopSpeaking);
        return () => {
            window.removeEventListener('beforeunload',stopSpeaking);
            stopSpeaking();
        };  
    },[]);
    
 

    // for when the page is refreshed or closed
    const speak = (text) => {
        if(window.speechSynthesis.speaking){
            window.speechSynthesis.cancel();
        }
        //Setting up the speech synthesis utterance
        const utterance = new SpeechSynthesisUtterance(text);

        //setting up  the voice used
        if (voices.length > 1) {
            utterance.voice = voices[1];
        }
        else if (voices.length > 0) {
            utterance.voice = voices[0]; 
        }

        //adjusting the rate of the speech
        utterance.rate = speechRate;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);   
        utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e.error);
            setIsSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
    };
    const stopSpeaking = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
 };

    return{
        speak,
        stopSpeaking,
        isSpeaking,
        setIsSpeaking,
        speechRate
    };

};

export default useTextToSpeech;