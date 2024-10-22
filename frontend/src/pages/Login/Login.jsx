import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e, action) => {
        e.preventDefault();
        const url = action === 'login' ? 'http://localhost:5000/login' : 'http://localhost:5000/register';

        try {
            // Send the login request to Flask
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,  // Sending username
                    password: password   // Sending password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);  // Login success message
                navigate('/home');
                
            } else {
                setMessage(data.message);  // Error message
            }
        } catch (error) {
            setMessage('Error connecting to server');  // In case of network issues
        }
    };

    return (
        <div>
            <h2>Sign in</h2>
            <form onSubmit={(e) => handleSubmit(e, 'login')}>
                <label>
                    Username:
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                </label>
                <br />
                <label>
                    Password:
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </label>
                <br />
                <button type="submit" onClick={(e) => handleSubmit(e, 'login')}>Login</button>
                <button type="button" onClick={(e) => handleSubmit(e, 'register')}>Register</button>
            </form>
            {message && <p>{message}</p>}
            
        </div>
    );
}

export default Login;
