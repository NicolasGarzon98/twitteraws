import React, { useState, useEffect } from 'react';
import './App.css'; // Importa el archivo CSS

const apiUrl = 'https://inq4xdkvg5.execute-api.us-east-1.amazonaws.com/dev/Twitter'; // Cambia esto por la URL de tu API Gateway

function App() {
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [messages, setMessages] = useState([]);
  const [comments, setComments] = useState({}); // Para almacenar los comentarios por PubID
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
      const tweetArray = JSON.parse(data.body);
      if (Array.isArray(tweetArray)) {
        setMessages(tweetArray);
        const initialComments = {};
        tweetArray.forEach(tweet => {
          initialComments[tweet.PubID] = []; // Inicializa un array vacío para cada tweet
        });
        setComments(initialComments);
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

  async function handleCommentSubmit(event, postId) {
    event.preventDefault();
    const respuestaContenido = event.target.elements.comment.value;
    const respondedor = author;

    try {
      await fetch(`${apiUrl}/Responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, respuestaContenido, respondedor }),
      });

      // Actualiza los comentarios en el estado y los ordena
      setComments(prevComments => ({
        ...prevComments,
        [postId]: [
          ...prevComments[postId],
          { autor: respondedor, contenido: respuestaContenido, fecha: new Date().toLocaleString() }
        ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Ordenar por fecha
      }));
      event.target.reset(); // Limpia el formulario después de enviar
    } catch (error) {
      console.error('Error al guardar el comentario:', error);
      setError('Error al guardar el comentario.');
    }
  }

  return (
    <div>
      <h1>MiniTwitter BBVA</h1>
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {messages.map((msg) => (
          <li key={msg.PubID} style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold' }}>{msg.autor}</div>
            <div>{msg.contenido}</div>
            <div style={{ fontSize: 'small', color: 'gray' }}>{new Date(msg.fechaCreacion).toLocaleString()}</div>
            <form onSubmit={(e) => handleCommentSubmit(e, msg.PubID)}>
              <textarea name="comment" placeholder="Escribe un comentario..." />
              <button type="submit">Enviar Comentario</button>
            </form>
            {comments[msg.PubID] && comments[msg.PubID].map((comment, index) => (
              <div key={index} style={{ marginLeft: '20px', marginTop: '5px', color: 'gray' }}>
                <strong>{comment.autor}</strong>: {comment.contenido}
                <div style={{ fontSize: 'small' }}>{comment.fecha}</div>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
