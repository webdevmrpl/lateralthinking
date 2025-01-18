import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './styles.css';
import './Game.css';

function Game() {
    const { storyTitle, storyId } = useParams();
    const [story, setStory] = useState(null);
    const [messages, setMessages] = useState([]);
    const [guessedKeyPoints, setGuessedKeyPoints] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const sessionId = Cookies.get(`session_id_${storyId}`);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (!sessionId) {
            console.error('Session ID not found. Please start a new game from the stories page.');
            return;
        }

        axios.get(`http://localhost:8001/conversation/get_chat_by_session/${sessionId}`)
            .then(response => {
                const storyData = response.data.story;
                setStory(storyData);
                setGuessedKeyPoints(response.data.guessed_key_points);
                const initialMessages = response.data.messages
                    .filter((msg, index) => index !== 0) // Filter out the first system message
                    .map(msg => ({
                        role: msg.role,
                        text: msg.content
                    }));
                setMessages([
                    { role: 'system', text: `You are now playing the puzzle: ${storyData.title}.` },
                    { role: 'system', text: storyData.situation },
                    ...initialMessages
                ]);
            })
            .catch(error => {
                console.error('There was an error fetching the game state!', error);
            });
    }, [sessionId, storyId]);

    const handleSend = (message) => {
        if (message.trim() === '') return;

        const newMessages = [
            ...messages,
            { role: 'user', text: message }
        ];

        setMessages(newMessages);
        setUserInput('');
        setIsTyping(true);

        // Send user input to the server and get the assistant's response
        axios.post(`http://localhost:8001/conversation/send_user_message`, {
            session_id: sessionId,
            message: message
        })
            .then(response => {
                const assistantMessage = response.data.messages[messages.length];
                setMessages([
                    ...newMessages,
                    { role: 'assistant', text: assistantMessage.content }
                ]);
                setIsTyping(false);
            })
            .catch(error => {
                console.error('There was an error sending the message!', error);
                setIsTyping(false);
            });
    };

    const handleRestart = () => {
        // Delete the current session cookie
        Cookies.remove(`session_id_${storyId}`);

        // Create a new session
        axios.post(`http://localhost:8001/conversation/get_session_id?story_id=${storyId}`)
            .then(response => {
                Cookies.set(`session_id_${storyId}`, response.data.session_id, { expires: 7 }); // Cookie expires in 7 days
                navigate(0); // Reload the page to start a new game
            })
            .catch(error => {
                console.error('There was an error generating the new session ID!', error);
            });
    };

    if (!story) {
        return <div>Loading...</div>;
    }

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
                <h1 className="title">{story.title.toUpperCase()}</h1>
            </header>

            <div className="content">
                <div className="keypoints">
                    <h2>Guessed Key Points</h2>
                    <ul>
                        {guessedKeyPoints.map((keyPoint, index) => (
                            guessedKeyPoints[index] && (
                                <li key={index}>
                                    {guessedKeyPoints[index]}
                                </li>
                            )
                        ))}
                    </ul>
                </div>
                <div className="chat-window">
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className="message-item">
                                <strong>{msg.role === 'user' ? 'You:' : 'Game:'}</strong> {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message-item">
                                <strong>Game:</strong> <em>typing...</em>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="input-area">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend(userInput);
                            }}
                            placeholder="Ask a question..."
                        />
                        <button className="menu-btn send" onClick={() => handleSend(userInput)}>Send</button>
                        <button className="menu-btn hint" onClick={() => handleSend('give me a hint')}>Hint</button>
                        <button className="menu-btn restart" onClick={handleRestart}>Restart Game</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;