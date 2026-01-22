import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                username,
                password,
            });

            if (response.data.success) {
                setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (err) {
            setMessage({
                text: err.response?.data?.message || 'Invalid username or password',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="background-container">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
                <div className="circle circle-3"></div>
            </div>

            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-box">
                            <span className="logo-icon">AE</span>
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Login to manage your inventory</p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-group">
                            <label>Username</label>
                            <div className="input-wrapper">
                                <User className="icon-left" size={20} />
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="icon-left" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="options-row">
                            <label className="checkbox-container">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Remember me
                            </label>
                            <button type="button" className="forgot-link">Forgot password?</button>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (
                                <div className="loader"></div>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>

                        {message.text && (
                            <div className={`message-box ${message.type}`}>
                                {message.text}
                            </div>
                        )}
                    </form>

                    <div className="login-footer">
                        <p>Copyright © 2026 Aditya Enterprises</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
