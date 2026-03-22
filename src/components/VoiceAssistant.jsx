import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './VoiceAssistant.css';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            interimTranscript += transcript + ' ';
          }
        }
        setTranscript(interimTranscript.trim());
        if (interimTranscript) {
          processCommand(interimTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        speak(`Sorry, I didn't catch that. Please try again.`);
        setTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-to-speech function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Command processor
  const processCommand = (text) => {
    setIsProcessing(true);
    const command = text.toLowerCase().trim();

    setTimeout(() => {
      // Navigation commands
      if (command.includes('home')) {
        speak('Going to home page.');
        navigate('/');
      } else if (command.includes('movie') && command.includes('search')) {
        speak('Opening search.');
        // Focus search could be done via event
      } else if (command.includes('open movie') || command.includes('show movie')) {
        speak('Opening movies list.');
        navigate('/movies');
      } else if (command.includes('trending')) {
        speak('Opening trending movies.');
        navigate('/trending');
      }
      // Account commands
      else if (command.includes('open account') || command.includes('my account')) {
        if (user) {
          speak('Opening your account dashboard.');
          navigate('/profile');
        } else {
          speak('Please login first to access your account.');
          navigate('/login');
        }
      } else if (command.includes('show booking') || command.includes('my booking')) {
        if (user) {
          speak('Showing your bookings.');
          navigate('/profile?tab=bookings');
        } else {
          speak('Please login first to view your bookings.');
          navigate('/login');
        }
      } else if (command.includes('login')) {
        speak('Opening login page.');
        navigate('/login');
      } else if (command.includes('logout')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        speak('You have been logged out.');
        navigate('/');
      } else if (command.includes('profile')) {
        if (user) {
          speak('Opening your profile.');
          navigate('/profile');
        } else {
          speak('Please login first.');
          navigate('/login');
        }
      }
      // Booking commands
      else if (command.includes('book ticket')) {
        if (user) {
          speak('Opening movies to book a ticket.');
          navigate('/movies');
        } else {
          speak('Please login first to book a ticket.');
          navigate('/login');
        }
      } else if (command.includes('book') && command.includes('avatar')) {
        if (user) {
          speak('Searching for Avatar.');
          navigate('/movies?search=avatar');
        } else {
          speak('Please login to book tickets.');
          navigate('/login');
        }
      } else if (command.includes('community')) {
        if (user) {
          speak('Opening community.');
          navigate('/community');
        } else {
          speak('Please login to access the community.');
          navigate('/login');
        }
      }
      // Greeting and general
      else if (command.includes('hello') || command.includes('hi')) {
        speak(`Hello${user ? ', ' + user.name : ''}! Welcome to ShowTime movie booking system.`);
      } else if (command.includes('help')) {
        speak('You can say commands like: Open movies, Search movie, Book ticket, Open my account, Show my bookings, or Logout.');
      } else {
        speak('I did not understand that command. You can say Home, Movies, Book Ticket, or Open My Account.');
      }

      setTranscript('');
      setIsProcessing(false);
    }, 500);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Voice Button */}
      <button
        className={`voice-assistant-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
        onClick={() => {
          if (showPanel) {
            stopListening();
            setShowPanel(false);
          } else {
            setShowPanel(true);
            startListening();
          }
        }}
        title="Voice Assistant"
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        {isListening && <span className="pulse"></span>}
      </button>

      {/* Voice Assistant Panel */}
      {showPanel && (
        <div className="voice-assistant-panel glass-panel animate-fade-in">
          <div className="panel-header">
            <h3>
              <Mic size={18} /> Voice Assistant
            </h3>
            <button
              className="close-btn"
              onClick={() => {
                stopListening();
                setShowPanel(false);
              }}
            >
              ✕
            </button>
          </div>

          <div className="panel-body">
            {isListening && (
              <div className="listening-state">
                <div className="wave-animation">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                </div>
                <p>🎤 Listening...</p>
              </div>
            )}

            {isProcessing && (
              <div className="processing-state">
                <div className="spinner"></div>
                <p>Processing command...</p>
              </div>
            )}

            {transcript && !isProcessing && (
              <div className="transcript-box">
                <p className="label">You said:</p>
                <p className="transcript-text">"{transcript}"</p>
              </div>
            )}

            {!isListening && !isProcessing && !transcript && (
              <div className="idle-state">
                <p>Click the microphone or say a command</p>
                <p className="hint">Examples: "Open movies", "Show my bookings", "Login"</p>
              </div>
            )}

            {isSpeaking && (
              <div className="speaking-state">
                <Volume2 size={24} />
                <p>🔊 Speaking...</p>
              </div>
            )}
          </div>

          <div className="panel-footer">
            {isListening ? (
              <button className="btn-secondary" onClick={stopListening}>
                Stop Listening
              </button>
            ) : (
              <button className="btn-primary" onClick={startListening}>
                Start Listening
              </button>
            )}
          </div>

          {/* Commands Help */}
          <div className="commands-list">
            <h4>Available Commands</h4>
            <div className="command-group">
              <span className="group-title">Navigation</span>
              <ul>
                <li>"Home"</li>
                <li>"Open movies"</li>
                <li>"Search movie"</li>
                <li>"Trending"</li>
                <li>"Community"</li>
              </ul>
            </div>
            <div className="command-group">
              <span className="group-title">Account</span>
              <ul>
                <li>"Login"</li>
                <li>"Logout"</li>
                <li>"Open my account"</li>
                <li>"Show my bookings"</li>
              </ul>
            </div>
            <div className="command-group">
              <span className="group-title">Booking</span>
              <ul>
                <li>"Book ticket"</li>
                <li>"Available seats"</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
