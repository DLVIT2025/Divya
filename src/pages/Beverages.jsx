import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Coffee } from 'lucide-react';
import { beverages } from '../data/mockData';
import './Beverages.css';

export default function Beverages() {
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState(null);
    const [cart, setCart] = useState({});

    useEffect(() => {
        const data = sessionStorage.getItem('bookingData');
        if (!data) {
            navigate('/');
            return;
        }
        setBookingData(JSON.parse(data));
    }, [navigate]);

    const updateCart = (id, change) => {
        setCart(prev => {
            const newQty = (prev[id] || 0) + change;
            if (newQty <= 0) {
                const newCart = { ...prev };
                delete newCart[id];
                return newCart;
            }
            return { ...prev, [id]: newQty };
        });
    };

    const getBeverageTotal = () => {
        return Object.entries(cart).reduce((total, [id, qty]) => {
            const item = beverages.find(b => b.id === id);
            return total + (item.price * qty);
        }, 0);
    };

    const handleSkipOrContinue = () => {
        const selectedBeverages = Object.entries(cart).map(([id, qty]) => {
            const item = beverages.find(b => b.id === id);
            return { ...item, quantity: qty };
        });

        const finalData = {
            ...bookingData,
            beverages: selectedBeverages,
            beverageTotal: getBeverageTotal(),
            grandTotal: bookingData.seatTotal + getBeverageTotal()
        };

        sessionStorage.setItem('bookingData', JSON.stringify(finalData));
        navigate('/checkout');
    };

    if (!bookingData) return null;

    return (
        <div className="beverages-page container animate-fade-in">
            <div className="page-header">
                <h2>Grab a Bite!</h2>
                <p className="subtitle">Pre-book your snacks and skip the queue</p>
            </div>

            <div className="beverages-grid">
                {beverages.map(item => {
                    const qty = cart[item.id] || 0;
                    return (
                        <div key={item.id} className="beverage-card glass-panel">
                            <div className="beverage-icon">{item.image}</div>
                            <div className="beverage-info">
                                <h3>{item.name}</h3>
                                <p className="price">Rs. {item.price}</p>
                            </div>

                            {qty === 0 ? (
                                <button className="add-btn btn-secondary" onClick={() => updateCart(item.id, 1)}>
                                    Add
                                </button>
                            ) : (
                                <div className="qty-controls">
                                    <button onClick={() => updateCart(item.id, -1)}><Minus size={16} /></button>
                                    <span>{qty}</span>
                                    <button onClick={() => updateCart(item.id, 1)}><Plus size={16} /></button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="booking-footer glass-panel animate-fade-in">
                <div className="selection-summary">
                    <h3>Movie Tickets</h3>
                    <p>Rs. {bookingData.seatTotal}</p>
                </div>
                <div className="total-action">
                    <div className="amount">
                        <span>Total Payable:</span>
                        <h3>Rs. {bookingData.seatTotal + getBeverageTotal()}</h3>
                    </div>
                    <div className="action-buttons">
                        <button className="btn-secondary" onClick={handleSkipOrContinue}>
                            {Object.keys(cart).length === 0 ? 'Skip' : 'Checkout'}
                        </button>
                        {Object.keys(cart).length > 0 && (
                            <button className="btn-primary" onClick={handleSkipOrContinue}>
                                Checkout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
