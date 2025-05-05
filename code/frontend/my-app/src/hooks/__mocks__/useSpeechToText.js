const useSpeechToText = () => {
    return {
      text: '',
      realTimeText: '',
      isListening: false,
      startListening: jest.fn(),
      stopListening: jest.fn(),
      clearText: jest.fn(),
      hasRecognition: true,
    };
  };
  
  export default useSpeechToText;