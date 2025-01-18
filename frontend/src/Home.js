import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';


function Home() {
    const [stories, setStories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8001/stories/')
            .then(response => {
                setStories(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the stories!', error);
            });
    }, []);

    const handleStoryClick = (story) => {
        const sessionId = Cookies.get(`session_id_${story._id}`);
        if (!sessionId) {
            axios.post(`http://localhost:8001/conversation/get_session_id?story_id=${story._id}`)
                .then(response => {
                    Cookies.set(`session_id_${story._id}`, response.data.session_id, { expires: 7 }); // Cookie expires in 7 days
                    navigate(`/game/${encodeURIComponent(story.title)}/${story._id}`);
                })
                .catch(error => {
                    console.error('There was an error generating the session ID!', error);
                });
        } else {
            navigate(`/game/${encodeURIComponent(story.title)}/${story._id}`);
        }
    };

    return (
        <>
            <header className="menu">
                <nav>
                    <button className="menu-btn">How to play?</button>
                    <button className="menu-btn">Ask, Think, Discover!</button>
                </nav>
                <h1 className="title">LATERAL THINKING GAME</h1>
            </header>

            <main className="card-container">
                {stories.map(story => {
                    const rating = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
                    return (
                        <div className="card" key={story._id} onClick={() => handleStoryClick(story)}>
                            <h2>{story.title}</h2>
                            <p><em>{story.situation}</em></p>
                            <span className="rating">★ {rating}</span>
                        </div>
                    );
                })}
            </main>
        </>
    );
}

export default Home;