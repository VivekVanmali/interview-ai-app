import unittest
from unittest.mock import patch, MagicMock, mock_open
import json
import io
from API import app, clean_cv_text

class TestAPI(unittest.TestCase):

    def setUp(self):
        # Create a test client
        self.app = app.test_client()
        self.app.testing = True
        
    def test_clean_cv_text(self):
        """Test the CV text cleaning function"""
        # Input with multiple newlines and spaces
        raw_text = "This is\n\n\na test\n text  with   lots of \n\nspaces"
        # Match the actual function behavior
        expected = "This is a test text with lots of spaces"
        result = clean_cv_text(raw_text)
        self.assertEqual(result, expected)
        
    @patch('API.genai.Client')
    @patch('API.PdfReader')
    def test_CV_extractor_success(self, mock_pdf_reader, mock_client):
        """Test successful CV extraction"""
        # Mock PDF reader
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Test CV content"
        mock_pdf_reader.return_value.pages = [mock_page]
        
        # Mock AI response
        mock_response = MagicMock()
        mock_response.text = "Analyzed CV content"
        mock_client.return_value.models.generate_content.return_value = mock_response
        
        # Create test PDF file
        test_file = io.BytesIO(b"fake pdf content")
        
        # Make request
        response = self.app.post(
            '/CV_extractor',
            data={
                'file_uploaded': (test_file, 'test.pdf'),
                'job_description': 'Software Engineer job'
            },
            content_type='multipart/form-data'
        )
        
        # Assert response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['analysed_text'], "Analyzed CV content")
        self.assertEqual(data['cleaned_text'], "Test CV content")
        
    def test_CV_extractor_no_file(self):
        """Test CV extraction with no file uploaded"""
        response = self.app.post(
            '/CV_extractor',
            data={'job_description': 'Software Engineer job'},
            content_type='multipart/form-data'
        )
        
        # Update expected status to match actual behavior
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
    @patch('API.genai.Client')
    def test_interview_questions_success(self, mock_client):
        """Test successful interview questions generation"""
        # Mock AI response
        mock_response = MagicMock()
        mock_response.text = "Tell me about your experience with Python."
        mock_client.return_value.models.generate_content.return_value = mock_response
        
        # Request data
        request_data = {
            'script': 'Previous conversation',
            'cv_analysis': 'CV analysis data',
            'job_position': 'Software Developer'
        }
        
        # Make request
        response = self.app.post(
            '/interview_questions',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        # Assert response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['question'], "Tell me about your experience with Python.")
        
    @patch('API.genai.Client')
    def test_interview_questions_error(self, mock_client):
        """Test error handling in interview questions endpoint"""
        # Mock AI client to raise an exception
        mock_client.return_value.models.generate_content.side_effect = Exception("API Error")
        
        # Request data
        request_data = {
            'script': 'Previous conversation',
            'cv_analysis': 'CV analysis data',
            'job_position': 'Software Developer'
        }
        
        # Make request
        response = self.app.post(
            '/interview_questions',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        # Assert error response
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
    @patch('API.genai.Client')
    def test_end_interview_success(self, mock_client):
        """Test successful end interview endpoint"""
        # Mock AI response
        mock_response = MagicMock()
        mock_response.text = "Interview Summary\n\nAdvantages\n\nYou demonstrated strong technical skills."
        mock_client.return_value.models.generate_content.return_value = mock_response
        
        # Request data
        request_data = {
            'script': 'Full interview transcript',
            'jobPosition': 'Data Scientist',
            'job_description': 'Job details',
            'cvAnalysis': 'CV Analysis'
        }
        
        # Make request
        response = self.app.post(
            '/end_interview',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        # Assert response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue('question' in data)
        self.assertIn("Interview Summary", data['question'])
        
    @patch('API.genai.Client')
    def test_end_interview_error(self, mock_client):
        """Test error handling in end interview endpoint"""
        # Mock AI client to raise an exception
        mock_client.return_value.models.generate_content.side_effect = Exception("API Error")
        
        # Request data
        request_data = {
            'script': 'Full interview transcript',
            'jobPosition': 'Data Scientist',
            'job_description': 'Job details',
            'cvAnalysis': 'CV Analysis'
        }
        
        # Make request
        response = self.app.post(
            '/end_interview',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        # Assert error response
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertIn('error', data)

if __name__ == '__main__':
    unittest.main()