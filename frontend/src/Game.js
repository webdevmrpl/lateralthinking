import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import confetti from 'canvas-confetti';
import { useAuth } from './contexts/AuthContext';
import api from './utils/axiosConfig';
import './styles/Game.css';

function Game() {
    const { storyId } = useParams();
    const [story, setStory] = useState(null);
    const [hintUsed, setHintUsed] = useState(null);
    const [guessedKeyPoints, setGuessedKeyPoints] = useState([]);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const sessionId = Cookies.get(`session_id_${storyId}`);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login', { state: { message: 'Please log in to play the game.' } });
            return;
        }

        if (!sessionId) {
            console.error('Session ID not found. Please start a new game from the stories page.');
            return;
        }

        api.get(`/conversation/get_chat_by_session/${sessionId}`)
            .then(response => {
                const storyData = response.data.story;
                setStory(storyData);
                setGuessedKeyPoints(response.data.guessed_key_points);
                setHintUsed(response.data.hints_used);

                const chatFlowMessages = response.data.messages
                    .filter((msg, index) => index !== 0) 
                    .map(msg => ({
                        role: msg.role,
                        text: msg.content
                    }));

                setMessages([
                    { role: 'system', text: `You are now playing the puzzle: ${storyData.title}.` },
                    { role: 'system', text: storyData.situation },
                    ...chatFlowMessages
                ]);
            })
            .catch(error => {
                console.error('There was an error fetching the game state!', error);
                if (error.response?.status === 401) {
                    navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
                }
            });
    }, [sessionId, storyId, navigate, currentUser]);

    useEffect(() => {
        if (story && guessedKeyPoints.length > 0 && guessedKeyPoints.every(Boolean)) {
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

    const handleSend = (messageContent) => {
        if (messageContent.trim() === '') return;

        const optimisticUserMessage = { role: 'user', text: messageContent };
        setMessages(prevMessages => [...prevMessages, optimisticUserMessage]);
        setUserInput('');
        setIsTyping(true);

        api.post(`/conversation/send_user_message`, {
            session_id: sessionId,
            message: messageContent
        })
            .then(response => {
                const updatedStoryData = response.data.story;
                setStory(updatedStoryData);
                setGuessedKeyPoints(response.data.guessed_key_points);
                setHintUsed(response.data.hints_used);
                const serverChatFlowMessages = response.data.messages
                    .filter((msg, index) => index !== 0)
                    .map(msg => ({
                        role: msg.role,
                        text: msg.content
                    }));
                
                setMessages([
                    { role: 'system', text: `You are now playing the puzzle: ${updatedStoryData.title}.` },
                    { role: 'system', text: updatedStoryData.situation },
                    ...serverChatFlowMessages
                ]);

                setIsTyping(false);
            })
            .catch(error => {
                console.error('There was an error sending the message!', error);
                setMessages(prevMessages => prevMessages.filter(m => m !== optimisticUserMessage));
                setIsTyping(false);
                setMessages(prevMessages => [...prevMessages, { role: 'system', text: 'Error: Could not send message. Please try again.' }]);

                if (error.response?.status === 401) {
                    navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
                }
            });
    };
    
    const handleRestart = () => {
        api.post(`/conversation/delete_chat_by_session/${sessionId}`)
            .then(() => {
                Cookies.remove(`session_id_${storyId}`);
                return api.post(`/conversation/get_session_id?story_id=${storyId}`);
            })
            .then(response => {
                Cookies.set(`session_id_${storyId}`, response.data.session_id, { expires: 7 });
                window.location.reload();
            })
            .catch(error => {
                console.error('There was an error restarting the session!', error);
                if (error.response?.status === 401) {
                    navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
                }
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
                <h1 className="title">{story.title ? story.title.toUpperCase() : 'Loading Title...'}</h1>
            </header>
            
            <div className="content">
                <div className="keypoints">
                    <h2>Hint Used: {hintUsed !== null ? hintUsed : 'N/A'}</h2>
                    <h2>Guessed Key Points: {guessedKeyPoints.filter(Boolean).length}/{story.key_points ? story.key_points.length : 0}</h2>
                    <ul>
                        {story.key_points && story.key_points.map((keyPoint, index) => (
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
                                <strong>{msg.role === 'user' ? 'You:' : msg.role === 'system' ? 'System:' : 'Game:'}</strong> {msg.text}
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