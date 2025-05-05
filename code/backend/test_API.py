import unittest
from unittest.mock import patch, MagicMock
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
        raw_text = "This is\n\n\na test\n text  with   lots of \n\nspaces"
        expected = "This is a test text with lots of spaces"
        result = clean_cv_text(raw_text)
        self.assertEqual(result, expected)

    @patch('API.genai.Client')
    @patch('API.PdfReader')
    def test_CV_extractor_success(self, mock_pdf_reader, mock_client):
        """Test successful CV extraction"""
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Test CV content"
        mock_pdf_reader.return_value.pages = [mock_page]

        mock_response = MagicMock()
        mock_response.text = "Analyzed CV content"
        mock_client.return_value.models.generate_content.return_value = mock_response

        test_file = io.BytesIO(b"fake pdf content")
        response = self.app.post(
            '/CV_extractor',
            data={
                'file_uploaded': (test_file, 'test.pdf'),
                'job_description': 'Software Engineer job'
            },
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['analysed_text'], "Analyzed CV content")
        self.assertEqual(data['cleaned_text'], "Test CV content")

    @patch('API.genai.Client')
    def test_interview_questions_success(self, mock_client):
        """Test successful interview questions generation"""
        mock_response = MagicMock()
        mock_response.text = "Tell me about your experience with Python."
        mock_client.return_value.models.generate_content.return_value = mock_response

        request_data = {
            'script': 'Previous conversation',
            'cv_analysis': 'CV analysis data',
            'job_position': 'Software Developer'
        }

        response = self.app.post(
            '/interview_questions',
            data=json.dumps(request_data),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['question'], "Tell me about your experience with Python.")

    @patch('API.genai.Client')
    def test_end_interview_success(self, mock_client):
        """Test successful end interview endpoint"""
        mock_response = MagicMock()
        mock_response.text = "Interview Summary\n\nAdvantages\n\nYou demonstrated strong technical skills."
        mock_client.return_value.models.generate_content.return_value = mock_response

        request_data = {
            'script': 'Full interview transcript',
            'jobPosition': 'Data Scientist',
            'job_description': 'Job details',
            'cvAnalysis': 'CV Analysis'
        }

        response = self.app.post(
            '/end_interview',
            data=json.dumps(request_data),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("Interview Summary", data['question'])

if __name__ == '__main__':
    unittest.main()