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
        if (!sessionId) {
            console.error('Session ID not found. Please start a new game from the stories page.');
            return;
        }

        loadChatData();
    }, [sessionId, storyId, navigate, currentUser]);

    const loadChatData = async () => {
        try {
            const response = await api.get(`/conversation/get_chat_by_session/${sessionId}`);
            if (!response.data || !response.data.story) {
                console.error('Story data is missing in the response');
                navigate('/', { state: { error: 'The story could not be found. Please try another story.' } });
                return;
            }
            
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
        } catch (error) {
            console.error('There was an error fetching the game state!', error);
            if (error.response?.status === 500) {
                navigate('/', { state: { error: 'The story could not be loaded. Please try another story.' } });
                return;
            }   
            
            if (error.response?.status === 401) {
                navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
            }
        }
    };

    useEffect(() => {
        if (story && guessedKeyPoints.length > 0 && guessedKeyPoints.every(Boolean)) {
            setIsCompleted(true);
            triggerConfetti();

            if (currentUser) {
                api.post('/conversation/complete_story', {
                    session_id: sessionId,
                    user_id: currentUser._id,
                    username: currentUser.username
                }).catch(error => console.error('Error updating completion status:', error));
            }
        }
    }, [guessedKeyPoints, story, currentUser, sessionId]);

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

        const requestData = {
            session_id: sessionId,
            message: messageContent
        };
        
        if (currentUser) {
            requestData.user_id = currentUser._id;
            requestData.username = currentUser.username;
        }

        api.post(`/conversation/send_user_message`, requestData)
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
                return api.post(`/conversation/get_session_id`, { 
                    story_id: storyId,
                    ...(currentUser && { user_id: currentUser._id, username: currentUser.username })
                });
            })
            .then(response => {
                if (!response.data || !response.data.session_id) {
                    throw new Error('No session ID returned');
                }
                Cookies.set(`session_id_${storyId}`, response.data.session_id, { expires: 7 });
                window.location.reload();
            })
            .catch(error => {
                console.error('There was an error restarting the session!', error);
                if (error.response?.status === 500) {
                    navigate('/', { state: { error: 'Could not restart the game. The story may no longer exist.' } });
                    return;
                }
                
                if (error.response?.status === 401) {
                    navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
                } else {
                    navigate('/', { state: { error: 'An unexpected error occurred while restarting the game. Please try again later.' } });
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