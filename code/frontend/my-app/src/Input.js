import React ,{useState} from 'react';
import ReactDOM from 'react-dom/client';

function Input() {
    const [inputValue, setInputValue] = useState("");
    const [response,setResponse] = useState(null);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setInputValue(event.target.value);
    }

    const handleSubmit = async (event) => {
        setResponse(undefined);
        event.preventDefault();

        try{
            const res = await fetch("/textstuff",{
                method: 'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({input: inputValue}),
            });

            const data = await res.json();
            setResponse(data.response); 
        }
        catch(error){
            console.error('Error',error);
            setError("Error fetching data");
        }
    };

  return (
    <div>
        <form onSubmit={handleSubmit}>
            <input type="text" name="user_answer" placeholder="Enter your answer" value ={inputValue} onChange={handleChange}/>
            <input type="submit" value="Submit" />
        </form>

        {/* {response && <p>Response from Flask: {response}</p>} */}
        {error ? <p style={{ color: "red" }}>{error}</p> : typeof response === 'undefined' ? <p>loading...</p>:<p>{response}</p> }
    </div>
  )
}


export default Input
