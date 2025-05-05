const useTextToSpeech = () => {
    return {
      speak: jest.fn(),
      stopSpeaking: jest.fn(),
      isSpeaking: false,
      setIsSpeaking: jest.fn(),
      speechRate: 1,
    };
  };
  
  export default useTextToSpeech;