import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    // Llama a la función Lambda para obtener los mensajes
    const response = await API.get('myapi', '/messages');
    setMessages(response);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    // Llama a la función Lambda para guardar el mensaje
    await API.post('myapi', '/messages', { body: { message } });
    setMessage('');
    fetchMessages();
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type="submit">Guardar</button>
      </form>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>{msg.message}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

