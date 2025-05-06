#.\venv\Scripts\activate (to activate the virtual environment)
#then python API.py to run the backend
from flask import Flask,jsonify,request,render_template,redirect
from flask_cors import CORS
import os
import re

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pypdf import PdfReader



def clean_cv_text(raw_text) :
    text = re.sub(r'\n\s*\n+', '\n\n', raw_text)
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
    text = re.sub(r'\s{2,}', ' ', text) 
    text = re.sub(r'^\s+|\s+$', '', text)  
    
    return text


app = Flask(__name__)
load_dotenv()

@app.route('/')
def index():
    return render_template('app.js')

#Extracting CV data using AI model
@app.route('/CV_extractor',methods=['POST']) 
def CV_extractor():
    #gets api key and information from PDFextract.jsx
    try:
        API_KEY = os.getenv("API_KEY")
        client =genai.Client(api_key=API_KEY)

        file = request.files['file_uploaded']
        job_description = request.form.get('job_description','')
 

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        

        #using pypdf to extract text from the pdf file.
        reader = PdfReader(file)
        CV_text = ""

        #extracts text from each page of pdf file
        for page in reader.pages:
            CV_text += page.extract_text() + "\n "

        cleaned_text = clean_cv_text(CV_text)

        prompt = f"""Personaa: 
                    You are a CV parsing assistant. Your task is to extract relevant information from the CV given.

                    Rules:
                    Extract the following information from the CV:
                    .name
                    .work experience
                    .achievments and skills
                    .education
                    .extra projects or extra ciruclar activities
                    .

                    If job description is provided, extract the following information:
                    .job title
                    .required skills
                    .required experience
                    
                    output format:
                    .Only output bullet points of the extracted information with headings from the rules section.
                    
                    User input:
                    {cleaned_text}

                    Job description:
                    {job_description}
                    """


        #api call to AI to recieve response
        response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=prompt,
        config=types.GenerateContentConfig(
            max_output_tokens=500,
            temperature = 0.1
            )
        )
        
        #return both analysed text and pdf text
        return jsonify({'analysed_text': response.text,
                        'cleaned_text': cleaned_text,})
    except Exception as e:
        #incase of any errors.
        return jsonify({'error': str(e)}), 500



#Call for interview question 
@app.route('/interview_questions',methods=['POST']) 
def interview_questions():

    try:
        #initialisse AI model and get data from frontend
        API_KEY = os.getenv("API_KEY")
        client =genai.Client(api_key=API_KEY)

        data = request.json
        script = data.get('script','')
        cv_analysis = data.get('cv_analysis','')
        job_position = data.get('job_position','')
    
        prompt = f"""Persona: 
                    You are an interview preparation assistant. Your task is to generate interview questions based on the given script, CV analysis, and job position.

                    Task:
                    Generate one interview questions based on the following information:
                    .script
                    .CV analysis
                    .job position

                    Rules:
                    .do not repeat the questions (be unique)
                    .Build the questions to naturally build on from the last response on script.
                    .vary the questions based on the CV analysis and job position.
                    .questions must cover the following areas each question can include one or two of the following:
                        . Personal Information
                        . Work Experience
                        . Achievements
                        . Skills
                        . Education
                        . Projects/Extracurricular Activities
                    .Cater interview more towards the job_position and CV analysis.
                    .Do not add any extra punctuation such as * , -, or bullet points.

                    
                    steps:
                    1. Read the script and CV analysis carefully.
                    2. Understand the job position and its requirements.
                    3. give a natural response.
                    4.generate and ask the question in a conversational manner.



                    User input:
                    {script}
                    {cv_analysis}
                    {job_position}
                    """
        
        
        response = client.models.generate_content(
        model="gemini-2.0-flash",   
        contents=prompt,
        config=types.GenerateContentConfig(
            max_output_tokens=200,
            temperature = 0.3
            )
        )
        
        #get the response from AI model and removes extra spaces
        question = response.text.strip()

        return jsonify({'question': question})
    except Exception as e:
        #incase of any errors.
        return jsonify({'error': str(e)}), 500
    

#call for the analysis of the interview
@app.route('/end_interview', methods=['POST'])
def end_interview():
    try:
        
        data = request.json
        script = data.get('script','')
        job_position = data.get('jobPosition','')  
        job_description = data.get('job_description','')
        cv_analysis = data.get('cvAnalysis','') 
   
 

        API_KEY = os.getenv("API_KEY")
        client =genai.Client(api_key=API_KEY)

        prompt = f"""Persona: 
                    You are an interview evaluator,you are talking to the interviewee. Your task is to generate a summary of the intterview based on the given script, cv analysis and job position.

                    Task:
                    Generate a summary of the interview based on the following information:
                    .script
                    .interview ID
                    .status

                    Rules:
                    .Build the summary to naturally build on from the last response on script.
                    .Give clear heading for advantages,disadvantages and imporvments this is required.
                    .summary must cover the following areas each question can include one or two of the following:
                        . Personal Information
                        . Work Experience
                        . Achievements
                        . Skills
                        . Education
                        . Projects/Extracurricular Activities
                    .Only send the summary of the interview.
                    .Do not add any extra punctuation such as * , -, or bullet points. Even for headers.
                    .adding white space of a line between the headings and the summary is required.
                    .talk in first person.
                    .Only give advantages disadvantages and improvements from the script only.
                    

                    
                    steps:
                    1. Read the script carefully.
                    2. If given understand the job description and its requirments.
                    3. give a natural response.
                    4.generate and ask the question in a conversational manner.



                    User input:
                    {script}
                    {cv_analysis}
                    {job_position}
                    {job_description}
                    """

        response = client.models.generate_content(
        model="gemini-2.0-flash",   
        contents=prompt,
        config=types.GenerateContentConfig(
            max_output_tokens=500,
            temperature = 0.4
            )
        )

        question = response.text.strip()
        # Return a success response
        return jsonify({"question": question}), 200

    except Exception as e:
        # Handle any errors
        print(f"Error ending interview: {str(e)}")
        return jsonify({"error": str(e)}), 500


    
if __name__ == '__main__':
    #using this as in development mode
    app.run(debug=True)


