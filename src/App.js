import React, { useState, useEffect } from 'react';
import './App.css';

function FrontendApp() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:5000/api/puzzles')
      .then(response => response.json())
      .then(data => {
        setMessage(data[0].title);
      })
      .catch(error => {
        setMessage('Error fetching data');
      });
  }, []);

  return (
    <div className="frontend-app">
      <h1>{message}</h1>
    </div>
  );
}

export default FrontendApp;
