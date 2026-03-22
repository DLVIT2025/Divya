import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Download } from 'lucide-react';
import './Ticket.css';

export default function Ticket() {
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const data = sessionStorage.getItem('finalOrder');
        if (!data) {
            navigate('/');
            return;
        }
        setOrder(JSON.parse(data));
    }, [navigate]);

    if (!order) return null;

    // Generate a mock QR payload
    const qrPayload = JSON.stringify({
        orderId: order.orderId,
        movie: order.movieTitle,
        seats: order.seats.join(','),
        time: order.time
    });

    return (
        <div className="ticket-page container animate-fade-in">
            <div className="success-header">
                <div className="success-icon-wrapper">
                    <CheckCircle size={60} className="success-icon" />
                </div>
                <h2>Booking Confirmed!</h2>
                <p>Order ID: {order.orderId}</p>
            </div>

            <div className="ticket-container glass-panel">
                <div className="ticket-cutout left"></div>
                <div className="ticket-cutout right"></div>

                <div className="ticket-content">
                    <div className="ticket-details">
                        <h3 className="ticket-movie-title">{order.movieTitle}</h3>

                        <div className="ticket-info-grid">
                            <div className="info-item">
                                <Calendar size={18} className="icon" />
                                <div>
                                    <span className="label">Date</span>
                                    <p>Today, {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <Clock size={18} className="icon" />
                                <div>
                                    <span className="label">Time</span>
                                    <p>{order.time}</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <MapPin size={18} className="icon" />
                                <div>
                                    <span className="label">Cinema</span>
                                    <p>INOX: Multiplex, Screen 3</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="seat-icon">🎟️</div>
                                <div>
                                    <span className="label">Seats ({order.seats.length})</span>
                                    <p>{order.seats.join(', ')}</p>
                                </div>
                            </div>
                        </div>

                        {order.beverages?.length > 0 && (
                            <div className="ticket-addons">
                                <span className="label">Add-ons:</span>
                                <p>{order.beverages.map(b => `${b.quantity}x ${b.name}`).join(', ')}</p>
                            </div>
                        )}

                    </div>

                    <div className="ticket-qr-section">
                        <div className="qr-bg">
                            <QRCodeSVG
                                value={qrPayload}
                                size={160}
                                bgColor={"#ffffff"}
                                fgColor={"#000000"}
                                level={"M"}
                                className="qr-code"
                            />
                        </div>
                        <p className="scan-text">Scan at the entrance</p>
                    </div>
                </div>
            </div>

            <div className="ticket-actions">
                <button className="btn-secondary tooltip-btn" onClick={() => window.print()}>
                    <Download size={20} /> Download PDF
                </button>
                <Link to="/" className="btn-primary">
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
