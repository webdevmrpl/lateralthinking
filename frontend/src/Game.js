import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate, matchRoutes } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import confetti from 'canvas-confetti';
import './Game.css';

function Game() {
    const { storyTitle, storyId } = useParams();
    const [story, setStory] = useState(null);
    const [hintUsed, setHintUsed] = useState(null);
    const [guessedKeyPoints, setGuessedKeyPoints] = useState([]);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
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
                setHintUsed(response.data.hints_used);
                const initialMessages = response.data.messages
                    .filter((msg, index) => index !== 0)
                    .map(msg => {
                        const message = msg.content;
                        const isParsable = msg.role === 'user' ? msg.content : JSON.parse(message);
    
                        return {
                            role: msg.role,
                            text: msg.role === 'user' ? isParsable : isParsable.response_to_user
                        };
                });
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

    useEffect(() => {
        if (story && guessedKeyPoints.every(Boolean)) {
            setIsCompleted(true);
            triggerConfetti();
        }
    }, [guessedKeyPoints, story]);

    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 60,
            origin: { y: 0.6 }
        });
    };

    const handleSend = (message) => {
        if (message.trim() === '') return;
    
        const newMessages = [
            ...messages,
            { role: 'user', text: message }
        ];
    
        setMessages(newMessages);
        setUserInput('');
        setIsTyping(true);
    
        axios.post(`http://localhost:8001/conversation/send_user_message`, {
            session_id: sessionId,
            message: message
        })
            .then(response => {
                const assistantMessage = response.data.messages[messages.length].content;
                const parsedMessage = JSON.parse(assistantMessage);
                setMessages([
                    ...newMessages,
                    { role: 'assistant', text: parsedMessage.response_to_user }
                ]);
                setGuessedKeyPoints(response.data.guessed_key_points);
                setHintUsed(response.data.hints_used);
                setIsTyping(false);
            })
            .catch(error => {
                console.error('There was an error sending the message!', error);
                setIsTyping(false);
            });
    };
    

    
    const handleRestart = () => {
        axios.post(`http://localhost:8001/conversation/delete_chat_by_session/${sessionId}`)
            .then(() => {
                Cookies.remove(`session_id_${storyId}`);
                return axios.post(`http://localhost:8001/conversation/get_session_id?story_id=${storyId}`);
            })
            .then(response => {
                Cookies.set(`session_id_${storyId}`, response.data.session_id, { expires: 7 });
                navigate(0);
            })
            .catch(error => {
                console.error('There was an error restarting the session!', error);
            });
    };

    if (!story) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="congrats-container">
                <h1>Congratulations!</h1>
                <p>{story.solution}</p>
                <div className="congrats-buttons">
                    <Link to="/" className="menu-btn">Back to Stories</Link>
                    <button onClick={handleRestart} className="menu-btn restart">Restart Game</button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-container">
            <header className="menu">
                <nav>
                    <Link to="/" className="menu-btn">Back to Stories</Link>
                </nav>
                <h1 className="title">{story.title.toUpperCase()}</h1>
            </header>
            

            <div className="content">
                <div className="keypoints">
                    <h2>Hint Used: {hintUsed}</h2>
                    <h2>Guessed Key Points: {guessedKeyPoints.filter(Boolean).length}/{story.key_points.length}</h2>
                    <ul>
                        {story.key_points.map((keyPoint, index) => (
                            guessedKeyPoints[index] && (
                                <li key={index} className="keypoint-item">
                                    {keyPoint.key_point}
                                </li>
                            )
                        ))}
                    </ul>
                </div>

                <div className="chat-window">
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message-item ${msg.role === 'user' ? 'user-message' : 'game-message'}`}
                            >
                                <strong>{msg.role === 'user' ? 'You:' : 'Game:'}</strong> {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message-item game-message">
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
                        <button className="menu-btn send" onClick={() => handleSend(userInput)}>
                            Send
                        </button>
                        <button className="menu-btn hint" onClick={() => handleSend('give me a hint')}>
                            Hint
                        </button>
                        <button className="menu-btn restart" onClick={handleRestart}>
                            Restart Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;