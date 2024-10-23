import React,{useState} from 'react'
import axios from 'axios'
import {useMutation} from '@tanstack/react-query'
import './ChatBot.css'
import {IoSend} from 'react-icons/io5' 
import {FaRobot} from 'react-icons/fa'
const formatResponse = (response) => {
    // Simple replace rules for common formatting
    let formatted = response;
  
    // Bold formatting: **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
    // Headings: ## Heading
    formatted = formatted.replace(/## (.*?)\n/g, '<h3>$1</h3>');
  
    // Lists: * item or - item
    formatted = formatted.replace(/\n\* (.*?)\n/g, '<ul><li>$1</li></ul>');
    
    // Add more rules if needed
  
    return formatted;
  };
  const ApiResponseRenderer = ( response ) => {
    const formattedContent = formatResponse(response);
  
    return (
      <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
    );
  };
  
const sendMessageApi=async(prompt) => {
    const res= await axios.post("http://localhost:5000/ask",{prompt});
    return res.data;
}
const Chat = () => {
    const [message,setMessage]=useState("");
    const [isTyping,setIsTyping]=useState(false);
    const [conversations,setConversations]=useState([
        {role:"assistant",content:"Hello! How can assist you today"}
    ]);

    const mutation = useMutation({
        mutationFn:sendMessageApi,
        mutationKey:["chatbot"],
        onSuccess:(data)=>{
            setIsTyping(false);
            setConversations((prev)=>[
                ...prev,
                {
                    role:"assistant",content:data.message
                }
            ])
        }
    });

    const handleSendMessage=()=>{
        const currentMessage=message.trim();
        if(!currentMessage){
            alert("Please enter a message");
            return;
        }
        setConversations((prev)=>[
            ...prev,
            {
                role:"user",content:currentMessage
            }
        ])
        setIsTyping(true);
        mutation.mutate(currentMessage);
        setMessage("");
    }

  return (
    <>
      <div className="header">
        <h1 className="title">AI Chatbot</h1>
        <p className="description">
          Enter your message in the input field below to chat with the AI.
        </p>
      </div>
      <div className="chat-container">
        <div className="conversation">
          {conversations.map((entry, index) => (
            <div key={index} className={`message ${entry.role}`}>
              <strong>{entry.role === "user" ? "You: " : <FaRobot />}</strong>
              {ApiResponseRenderer(entry.content)}
            </div>
          ))}
          {isTyping && (
            <div className="message assistant">
              <FaRobot />
              <strong>AI is typing...</strong>
            </div>
          )}
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-message"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={mutation.isPending}
            className="send-btn"
          >
            {mutation.isPending ? <IoSend className="icon-spin" /> : <IoSend />}
          </button>
        </div>
      </div>
    </>
  )
}

export default Chat
