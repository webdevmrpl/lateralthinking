import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './styles.css';
import './Game.css';

function Game() {
    const { storyId } = useParams();
    const [messages, setMessages] = useState([
        { role: 'system', text: 'You are now playing the puzzle: ' + storyId.replace(/-/g, ' ') + '.' },
        { role: 'system', text: 'Ask yes/no questions to solve the mystery!' }
    ]);
    const [userInput, setUserInput] = useState('');

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = () => {
        if (userInput.trim() === '') return;
        const newMessages = [
            ...messages,
            { role: 'user', text: userInput },
            { role: 'assistant', text: 'I am just a placeholder response...' }
        ];
        setMessages(newMessages);
        setUserInput('');
    };

    return (
        <div className="game-container">
            <header className="menu">
                <nav>
                    <Link to="/" className="menu-btn">Back to stories</Link>
                    <div className="language-switch">
                        <img src="/flag-uk.png" alt="English" className="flag"/>
                        <img src="/flag-pl.png" alt="Polski" className="flag"/>
                    </div>
                </nav>
                <h1 className="title">{storyId.replace(/-/g, ' ').toUpperCase()}</h1>
            </header>

            <div className="chat-window">
                <div className="messages">
                    {messages.map((msg, index) => (
                        <div key={index} className="message-item">
                            <strong>{msg.role === 'user' ? 'You:' : 'Game:'}</strong> {msg.text}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="input-area">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSend();
                        }}
                        placeholder="Ask a question..."
                    />
                    <button className="menu-btn" onClick={handleSend}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default Game;
