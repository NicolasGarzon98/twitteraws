import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import awsConfig from './aws-exports';

AWS.config.update({
    accessKeyId: awsConfig.aws_access_key_id,
    secretAccessKey: awsConfig.aws_secret_access_key,
    region: awsConfig.aws_appsync_region, // Reemplaza con tu región
});

const lambda = new AWS.Lambda();

const MiniTwitter = () => {
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [posts, setPosts] = useState([]);

    // Función para obtener publicaciones
    const fetchPosts = async () => {
        const params = {
            FunctionName: 'TwitterThreadPub', // Reemplaza con el nombre de tu función Lambda
            InvocationType: 'RequestResponse',
        };

        try {
            const response = await lambda.invoke(params).promise();
            const data = JSON.parse(response.Payload);
            setPosts(data);
        } catch (error) {
            console.error('Error al obtener publicaciones:', error);
        }
    };

    // Llama a fetchPosts al cargar el componente
    useEffect(() => {
        fetchPosts();
    }, []);

    // Función para manejar el envío de nuevas publicaciones
    const handleSubmit = async (e) => {
        e.preventDefault();
        const post = { content, author };

        const params = {
            FunctionName: 'TwitterNewPub', // Reemplaza con el nombre de tu función Lambda
            Payload: JSON.stringify(post),
        };

        try {
            await lambda.invoke(params).promise();
            setContent('');
            setAuthor('');
            alert('Publicación creada con éxito');
            fetchPosts(); // Actualiza la lista de publicaciones después de crear una nueva
        } catch (error) {
            console.error('Error al crear la publicación:', error);
            alert('Error al crear la publicación');
        }
    };

    return (
        <div>
            <h1>Mini Twitter</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Tu nombre"
                    required
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe tu publicación..."
                    required
                />
                <button type="submit">Publicar</button>
            </form>

            <h2>Publicaciones</h2>
            {posts.map((post) => (
                <div key={post.id}>
                    <h3>{post.author}</h3>
                    <p>{post.content}</p>
                    <p>{new Date(post.createdAt).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
};

export default MiniTwitter;
