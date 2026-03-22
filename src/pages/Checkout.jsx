import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, Shield } from 'lucide-react';
import SplitPayment from '../components/SplitPayment';
import './Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const data = sessionStorage.getItem('bookingData');
        if (!data) {
            navigate('/');
            return;
        }
        setBookingData(JSON.parse(data));
    }, [navigate]);

    const handlePayment = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Mock payment processing simulation
        setTimeout(() => {
            // Add random order ID
            const finalOrder = {
                ...bookingData,
                orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000)
            };
            sessionStorage.setItem('finalOrder', JSON.stringify(finalOrder));
            navigate('/ticket');
        }, 2000);
    };

    if (!bookingData) return null;

    const tax = Math.round(bookingData.grandTotal * 0.18);
    const totalPayable = bookingData.grandTotal + tax;

    return (
        <div className="checkout-page container animate-fade-in">
            <div className="checkout-grid">
                {/* Order Summary */}
                <div className="order-summary glass-panel">
                    <h2>Order Summary</h2>
                    <div className="movie-summary">
                        <h3>{bookingData.movieTitle}</h3>
                        <p className="text-muted">{bookingData.time} • INOX</p>
                        <p className="seats">Seats: {bookingData.seats.join(', ')}</p>
                    </div>

                    <div className="billing-details">
                        <div className="bill-row">
                            <span>Tickets ({bookingData.seats.length})</span>
                            <span>Rs. {bookingData.seatTotal}</span>
                        </div>

                        {bookingData.beverages?.length > 0 && (
                            <div className="bill-row">
                                <span>Food & Beverages</span>
                                <span>Rs. {bookingData.beverageTotal}</span>
                            </div>
                        )}

                        <div className="bill-row">
                            <span>Convenience Fee & Taxes (18%)</span>
                            <span>Rs. {tax}</span>
                        </div>

                        <div className="bill-row total-row">
                            <span>Amount Payable</span>
                            <span>Rs. {totalPayable}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="payment-section glass-panel">
                    <div className="payment-header">
                        <h2>Payment Details</h2>
                        <div className="secure-badge">
                            <Shield size={16} /> 100% Secure
                        </div>
                    </div>

                    <SplitPayment total={totalPayable} members={['Priya', 'Akash', 'Neha']} onSplit={(split) => console.log('Split:', split)} />

                    <form className="payment-form" onSubmit={handlePayment}>
                        <div className="form-group">
                            <label>Name on Card</label>
                            <input type="text" placeholder="John Doe" required />
                        </div>

                        <div className="form-group">
                            <label>Card Number</label>
                            <div className="input-with-icon">
                                <CreditCard size={20} className="icon" />
                                <input type="text" placeholder="XXXX XXXX XXXX XXXX" maxLength="19" required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input type="text" placeholder="MM/YY" maxLength="5" required />
                            </div>
                            <div className="form-group">
                                <label>CVV</label>
                                <input type="password" placeholder="XXX" maxLength="3" required />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`btn-primary w-100 pay-btn ${isProcessing ? 'processing' : ''}`}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing Payment...' : `Pay Rs. ${totalPayable}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
