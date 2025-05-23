import React, { useState } from 'react';
import axios from 'axios';
import { FaRobot, FaUser } from 'react-icons/fa'; // Importing icons from react-icons
import './ChatBot.css'; 

const Chatbot = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentQuestion.trim()) return;

    try {
      const response = await axios.post('http://localhost:8000/ask-question', { question: currentQuestion });
      setQuestions([...questions, { question: currentQuestion, answer: response.data.answer }]);
      setCurrentQuestion(''); // Clear the current question input after submission
    } catch (error) {
      setQuestions([...questions, { question: currentQuestion, answer: 'Error asking question' }]);
    }
  };

  return (
    <div className="chatbot-container">
      <form onSubmit={handleSubmit} className="chatbot-form">
        <div className="input-container">
          <FaUser className="input-icon" />
          <input
            type="text"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="Ask a question"
            className="chatbot-input"
          />
        </div>
        <button type="submit" className="chatbot-button">Submit</button>
      </form>
      <div className="chat-history">
        {questions.map((qa, index) => (
          <div key={index} className="chat-entry">
            <div className="input-container">
              <FaUser className="input-icon" />
              <div className="chat-question">{qa.question}</div>
            </div>
            <div className="answer-container">
              <FaRobot className="answer-icon" />
              <div className="answer-content">
                <h3>Answer:</h3>
                <p>{qa.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chatbot;