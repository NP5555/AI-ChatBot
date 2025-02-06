import React, { useState } from 'react';
import { Bot, Github, Linkedin, UserCircle } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import type { ChatState, Message } from './types';

const GEMINI_API_KEY = 'AIzaSyBpxZPxpyA9nQU41s-T2YTTUEOUrv0IZAc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });

  const sendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    
    // First update: Add only the user message and set loading state
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: content }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            topK: 1,
            topP: 0.8,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.candidates[0].content.parts[0].text,
      };

      // Second update: Add only the assistant message and clear loading state
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Error 
          ? `Error: ${error.message}. Please try again.`
          : 'Sorry, I encountered an error. Please try again.',
      };
      
      // Error update: Add only the error message and clear loading state
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-2">
          <Bot className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-semibold">
          Gemini 1.5 Pro Chat Bot
</h1>

        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {chatState.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] text-center p-8">
              <Bot className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Welcome to Gemini 1.5 Pro Chat </h2>
              <p className="text-gray-600">Start a conversation by typing a message below.</p>
            </div>
          ) : (
            chatState.messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))
          )}
          {chatState.isLoading && (
            <div className="p-6 bg-gray-50">
              <div className="animate-pulse flex gap-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput onSend={sendMessage} disabled={chatState.isLoading} />

      <footer className="bottom-0 w-full py-4 mt-5 bg-white/80 backdrop-blur-sm border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <h1 className="text-xl font-semibold">
              made with ❤️ by <span className="font-bold">naeem_ashraf</span>
            </h1>
            <div className="flex items-center gap-4">
            <a 
                href="https://github.com/np5555" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <UserCircle size={24} />
              </a>

              <a 
                href="https://github.com/np5555" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Github size={24} />
              </a>




              {/* <UserCircle className="w-6 h-6 mr-2" /> Made with ❤️ by <span className="font-bold ml-1">naeem_ashraf</span> */}
              <a 
                href="https://www.linkedin.com/in/naeem-ashraf-242663190" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;