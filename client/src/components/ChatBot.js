import { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";


const makeRequestAPI = async (prompt) => {
  const res = await axios.post("http://localhost:8080/diagnose", { prompt });
  return res.data;
};

function ChatBot() {
  const [prompt, setPrompt] = useState("");
  const mutation = useMutation({
    mutationFn: makeRequestAPI,
    mutationKey: ["gemini-ai-request"],
  });

  const submitHandler = (e) => {
    e.preventDefault();
    mutation.mutate(prompt);
  };

 

  return (
    <div >
      <div className="container d-flex justify-content-center align-items-center h-100">
        
        <div style={{ zIndex: 1}} className="App">
          <div className="App-chat-container">
            <div className="App-chat" style={{marginTop:'20%'}}>
              <p>Interact with the AI Companion:</p>
              <form className="App-form" onSubmit={submitHandler}>
                <input 
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Write a content about..."
                  className="App-input text-dark"
                />
                <br/>
                <button className="mt-3 mb-5 text-light bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-4 py-2.5 text-center inline-flex items-center me-2 mb-2" type="submit">
                  Generate Content
                </button>
              </form>
            </div>
            <div className="App-response">
              {mutation.isPending && <p>Generating your content...</p>}
              {mutation.isError && <p className="App-error">{mutation.error.message}</p>}
              {mutation.isSuccess && <p className="App-success">{mutation.data}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;