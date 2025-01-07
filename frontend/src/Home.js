import React from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

function Home() {
    return (
            <>
                <header className="menu">
                    <nav>
                        <button className="menu-btn">How to play?</button>
                        <button className="menu-btn">Ask, Think, Discover!</button>
                        <div className="language-switch">
                            <img src="/flag-uk.png" alt="English" className="flag" />
                            <img src="/flag-pl.png" alt="Polski" className="flag" />
                        </div>
                    </nav>
                    <h1 className="title">LATERAL THINKING GAME</h1>
                </header>

                <main className="card-container">
                    <Link to="/game/employee-of-the-month" className="card">
                        <h2>Employee of the Month</h2>
                        <p><em>Francis dies of a heart attack at work. His colleagues are there when it happens...</em></p>
                        <span className="rating">★ 7/10</span>
                    </Link>

                    <Link to="/game/the-mysterious-toast" className="card">
                        <h2>The Mysterious Toast</h2>
                        <p><em>Every morning, Sarah finds a single slice of burnt toast on her doorstep...</em></p>
                        <span className="rating">★ 6/10</span>
                    </Link>

                    <Link to="/game/the-silent-witness" className="card">
                        <h2>The Silent Witness</h2>
                        <p><em>A man is found dead in his living room with no signs of struggle...</em></p>
                        <span className="rating">★ 8/10</span>
                    </Link>

                    <Link to="/game/the-midnight-delivery" className="card">
                        <h2>The Midnight Delivery</h2>
                        <p><em>A delivery truck arrives at a building every night at midnight...</em></p>
                        <span className="rating">★ 7/10</span>
                    </Link>

                    <Link to="/game/the-lost-passenger" className="card">
                        <h2>The Lost Passenger</h2>
                        <p><em>A taxi driver picks up a passenger, but when they arrive at the destination...</em></p>
                        <span className="rating">★ 5/10</span>
                    </Link>

                    <Link to="/game/the-unopened-gift" className="card">
                        <h2>The Unopened Gift</h2>
                        <p><em>A man receives a beautifully wrapped gift with no note or sender's name...</em></p>
                        <span className="rating">★ 9/10</span>
                    </Link>
                </main>
            </>
    );
}

export default Home;
