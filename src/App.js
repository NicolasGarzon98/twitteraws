import React, { useState, useEffect } from 'react';
import './App.css'; // Importa el archivo CSS

const apiUrl = 'https://inq4xdkvg5.execute-api.us-east-1.amazonaws.com/dev/Twitter';

function App() {
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const response = await fetch(`${apiUrl}/Mostrar`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const tweet = data.body;
      const tweetArray = JSON.parse(tweet);
      if (Array.isArray(tweetArray)) {
        setMessages(tweetArray);
      } else {
        console.error('La respuesta no es un array:', tweetArray);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      setError('Error al obtener mensajes.');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!message.trim() || !author.trim()) {
      setError('El mensaje y el autor no pueden estar vacíos.');
      return;
    }
    try {
      await fetch(`${apiUrl}/Publicar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contenido: message, autor: author }),
      });
      setMessage('');
      setAuthor('');
      fetchMessages();
      setError('');
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
      setError('Error al guardar el mensaje.');
    }
  }

  return (
    <div>
      <h1>Mini Twitter</h1>
      <form onSubmit={handleSubmit}>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe tu mensaje aquí..." />
        <input 
          type="text" 
          value={author} 
          onChange={(e) => setAuthor(e.target.value)} 
          placeholder="Tu nombre" 
        />
        <button type="submit">Guardar</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {messages.map((msg) => (
          <li key={msg.PubID}>
            <span className="author">{msg.autor}</span>
            <span className="content">{msg.contenido}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
