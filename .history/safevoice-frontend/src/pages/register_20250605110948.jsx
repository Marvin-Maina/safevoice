import { useState } from 'react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageIsError(false);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        setMessage('Redirecting...');
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setMessageIsError(true);
      setMessage('❌ Registration failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const messageColor = messageIsError ? 'text-red-400' : 'text-green-400';

  const backgroundAnimationStyle = `
    @keyframes drift {
      0% { transform: translateY(0px) translateX(0px) scale(1) rotate(0deg); opacity: 0.1; }
      25% { transform: translateY(-30px) translateX(25px) scale(1.1) rotate(90deg); opacity: 0.4; }
      50% { transform: translateY(15px) translateX(-20px) scale(0.9) rotate(180deg); opacity: 0.2; }
      75% { transform: translateY(-25px) translateX(30px) scale(1.05) rotate(270deg); opacity: 0.5; }
      100% { transform: translateY(0px) translateX(0px) scale(1) rotate(360deg); opacity: 0.1; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.1; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(1.05); }
    }

    @keyframes slideInUp {
      0% { opacity: 0; transform: translateY(50px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideInDown {
      0% { opacity: 0; transform: translateY(-30px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
      50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3); }
    }

    @keyframes floatUpDown {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      background-image: radial-gradient(circle, rgba(59, 130, 246, 0.4), rgba(129, 140, 248, 0.2) 50%, transparent 70%);
      filter: blur(15px);
      animation: drift 20s infinite ease-in-out;
    }

    .orb-pulse {
      animation: pulse 8s infinite ease-in-out;
    }

    .orb1 { 
      width: 250px; height: 250px; top: 8%; left: 12%; 
      animation-duration: 25s; animation-delay: -3s; 
      background-image: radial-gradient(circle, rgba(59, 130, 246, 0.5), rgba(99, 102, 241, 0.3) 60%, transparent 80%);
    }
    .orb2 { 
      width: 350px; height: 350px; top: 45%; left: 65%; 
      animation-duration: 30s; animation-delay: -8s; 
      background-image: radial-gradient(circle, rgba(129, 140, 248, 0.4), rgba(99, 102, 241, 0.2) 50%, transparent 70%);
    }
    .orb3 { 
      width: 180px; height: 180px; top: 75%; left: 8%; 
      animation-duration: 22s; animation-delay: -12s; 
      background-image: radial-gradient(circle, rgba(99, 102, 241, 0.6), rgba(59, 130, 246, 0.2) 60%, transparent 80%);
    }
    .orb4 { 
      width: 300px; height: 300px; top: 15%; left: 78%; 
      animation-duration: 28s; animation-delay: -5