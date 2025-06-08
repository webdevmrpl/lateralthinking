import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';
import '../styles/Home.css';

function Home() {
    const [stories, setStories] = useState([]);
    const [isHowToPlayModalOpen, setIsHowToPlayModalOpen] = useState(false);
    const [isSampleGameplayModalOpen, setIsSampleGameplayModalOpen] = useState(false);
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    useEffect(() => {
        api.get('/stories/')
            .then(response => {
                setStories(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the stories!', error);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwt_access_token');
        localStorage.removeItem('jwt_refresh_token');
        logout();
    }

    const handleStoryClick = (story) => {
        const sessionId = Cookies.get(`session_id_${story._id}`);
        if (!sessionId) {
            api.post(`/conversation/get_session_id?story_id=${story._id}`)
                .then(response => {
                    Cookies.set(`session_id_${story._id}`, response.data.session_id, { expires: 7 });
                    navigate(`/game/${story._id}`);
                })
                .catch(error => {
                    console.error('There was an error generating the session ID!', error);
                });
        } else {
            navigate(`/game/${story._id}`);
        }
    };

    const handleHowToPlayModalOpen = () => {
        setIsHowToPlayModalOpen(true);
    };

    const handleHowToPlayModalClose = () => {
        setIsHowToPlayModalOpen(false);
    };

    const handleSampleGameplayModalOpen = () => {
        setIsSampleGameplayModalOpen(true);
    };

    const handleSampleGameplayModalClose = () => {
        setIsSampleGameplayModalOpen(false);
    };

    const handleOutsideClick = (e) => {
        if (e.target.className === 'modal') {
            handleHowToPlayModalClose();
            handleSampleGameplayModalClose();
        }
    };
    
    return (
        <div className="home">
            <header className="menu">
                <nav className="menu-layout">
                    <div className="menu-left">
                        <Link to="/leaderboard" className="menu-btn">Leaderboard</Link>
                    </div>

                    <div className="menu-center">
                        <button className="menu-btn" onClick={handleHowToPlayModalOpen}>How to play?</button>
                        <button className="menu-btn" onClick={handleSampleGameplayModalOpen}>Ask, Think, Discover!</button>
                    </div>

                    <div className="menu-right">
                        {currentUser ? (
                            <>
                             <span className="menu-user">Logged in as: <b>{currentUser.username}</b></span>
                             <button className="menu-btn" onClick={handleLogout}>Logout</button>
                         </>
                        ) : (
                            <>
                                <Link to="/login" className="menu-btn">Login</Link>
                                <Link to="/register" className="menu-btn">Register</Link>
                            </>
                        )}
                    </div>
                </nav>
                <h1 className="title">LATERAL THINKING GAME</h1>
            </header>
    
            <main className="card-container">
                {stories.map((story) => {
                    return (
                        <div className="card" key={story._id} onClick={() => handleStoryClick(story)}>
                            <h2>{story.title}</h2>
                            <p>{story.situation}</p>
                        </div>
                    );
                })}
            </main>
            {isHowToPlayModalOpen && (
                <div className="modal" onClick={handleOutsideClick}>
                    <div className="modal-content">
                        <span className="close" onClick={handleHowToPlayModalClose}>&times;</span>
                        <h2>How to play?</h2>
                        <p>The "Lateral Thinking Game" is an interactive web application that challenges users to solve puzzles based on lateral thinking. Players uncover the story behind each puzzle by asking a series of "yes" or "no" questions. Using a language model, the app analyzes the users' questions and provides answers, gradually guiding them toward the key clues needed to solve the puzzle.</p>
                    </div>
                </div>
            )}
            {isSampleGameplayModalOpen && (
                <div className="modal" onClick={handleOutsideClick}>
                    <div className="modal-content">
                        <span className="close" onClick={handleSampleGameplayModalClose}>&times;</span>
                        <h2>Sample Gameplay</h2>
                        <p><strong>Situation Puzzle:</strong> Employee of the Month</p>
                        <p><strong>Story Prompt:</strong> Francis dies of a heart attack at work. His colleagues are present when it happens, but they don’t call for help until after he dies.</p>
                        <p><strong>Gameplay Example:</strong></p>
                        <p><strong>User:</strong> "Was Francis in danger before he died?"</p>
                        <p><strong>Game:</strong> "Yes."</p>
                        <p><strong>User:</strong> "Did his colleagues know he was in danger?"</p>
                        <p><strong>Game:</strong> "No."</p>
                        <p><strong>User:</strong> "Did they think he was acting?"</p>
                        <p><strong>Game:</strong> "Yes."</p>
                        <p>(Progress: 20% guessed — key point matched: "They thought he was acting.")</p>
                        <p><strong>User:</strong> "Was Francis performing in front of an audience?"</p>
                        <p><strong>Game:</strong> "Yes."</p>
                        <p>(Progress: 40% guessed — key point matched: "Francis was performing in front of an audience.")</p>
                        <p><strong>User:</strong> "Was Francis an actor?"</p>
                        <p><strong>Game:</strong> "Yes."</p>
                        <p>(Progress: 60% guessed — key point matched: "Francis was an actor.")</p>
                        <p><strong>User:</strong> "Was the heart attack part of his role?"</p>
                        <p><strong>Game:</strong> "Yes."</p>
                        <p>(Progress: 80% guessed — key point matched: "The heart attack was part of his role.")</p>
                        <p><strong>User:</strong> "Did they think his heart attack was just a realistic performance?"</p>
                        <p><strong>Game:</strong> "Yes."</p>
                        <p>(Progress: 100% guessed — key point matched: "They thought his heart attack was just a realistic performance.")</p>
                        <p><strong>Game:</strong> Congratulations! You've uncovered the full story: "Francis was a theater actor and suffered a heart attack in the middle of a performance. However, he was playing a character experiencing a heart attack, so both his colleagues and the audience assumed he was giving a convincing performance."</p>
                        <p><strong>Game:</strong> Game Over!</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;