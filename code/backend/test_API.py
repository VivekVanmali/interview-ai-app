import unittest
from unittest.mock import patch, MagicMock
import time
import json
import os
import io
from API import app,clean_cv_text 

class TestAPI(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True


    #Test foe end interview
    def test_end_interview(self):
        
        API_KEY = os.getenv("API_KEY")
        if not API_KEY:
            raise EnvironmentError("API_KEY is missing. Set your API key.")
        
    
        test_data = {
            "script": "Q:given your experience in Python, how would you approach a new project? A: I would start by understanding the requirements and then design the architecture.",
            "jobPosition": "Software Engineer",
            "job_description": "Looking for a software engineer with experience in Python.",
            "cvAnalysis": "The candidate has 5 years of experience in Python and Java."
        }

        
        start_time = time.time()
        response = self.client.post(
            '/end_interview',
            data=json.dumps(test_data),
            content_type='application/json'
        )
        end_time = time.time()
        response_time = end_time - start_time
        

        #check if the responsive recieved process was succesful
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        llm_output = data.get("question")

        
        print("\n(END INTERVIEW):")
        print(llm_output)
        print("Response time: ", response_time, "seconds")


    @patch('API.PdfReader')
    #Test for CV analysis
    def test_cv_extractor(self,mock_pdf_reader):
        API_KEY = os.getenv("API_KEY")
        if not API_KEY:
            raise EnvironmentError("API_KEY is missing. Set your API key.")
        
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "name: John Doe\nexperience: 5 years in Python"
        #create a mock file of a single page only
        mock_pdf_reader.return_value.pages = [mock_page]  

        #mocks an upload
        test_file = io.BytesIO(b"fake pdf content")  
        start_time = time.time()
        response = self.client.post(
            '/CV_extractor',
            data={
                'file_uploaded':(test_file,'test.pdf'),
                'job_description':'UI developer',
            },
            content_type='multipart/form-data'
        )
        end_time = time.time()
        response_time = end_time - start_time

        #check if the responsive recieved process was succesful
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        llm_output = data.get("analysed_text")

        
        print("\n(CV EXTRACTOR):")
        print(llm_output)
        print("Response time: ", response_time, "seconds")


         #Test foe end interview
    def test_generate_questions(self):
        
        API_KEY = os.getenv("API_KEY")
        if not API_KEY:
            raise EnvironmentError("API_KEY is missing. Set your API key.")
        
    
        test_data = {
            "script": "Q:given your experience in Python, how would you approach a new project? A: I would start by understanding the requirements and then design the architecture.",
            "job_position": "Software Engineer",
            "cv_analysis": "The candidate has 5 years of experience in Python and Java."
        }

        
        start_time = time.time()
        response = self.client.post(
            '/interview_questions',
            data=json.dumps(test_data),
            content_type='application/json'
        )
        end_time = time.time()
        response_time = end_time - start_time
        

        #check if the responsive recieved process was succesful
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        llm_output = data.get("question")

        
        print("\n (GENERATE QUESTTION):")
        print(llm_output)
        print("Response time: ", response_time, "seconds")
        







if __name__ == '__main__':
    unittest.main()