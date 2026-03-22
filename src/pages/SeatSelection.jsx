import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { movies } from '../data/mockData';
import './SeatSelection.css';

export default function SeatSelection() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const time = searchParams.get('time');
    const navigate = useNavigate();
    const movie = movies.find(m => m.id === parseInt(id));

    // Generate mock seats (8 rows, 10 cols)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Randomly pre-book some seats
    const [bookedSeats] = useState(new Set(['C4', 'C5', 'D5', 'D6', 'H1', 'H2', 'G8', 'G9']));
    const [friendSeats] = useState(new Set(['B3', 'B4', 'E2', 'E3'])); // Mock friends' seats
    const [selectedSeats, setSelectedSeats] = useState(new Set());

    if (!movie) return <div className="container">Loading...</div>;

    const toggleSeat = (seatId) => {
        if (bookedSeats.has(seatId)) return;

        const newSelected = new Set(selectedSeats);
        if (newSelected.has(seatId)) {
            newSelected.delete(seatId);
        } else {
            if (newSelected.size < 6) { // Max 6 seats
                newSelected.add(seatId);
            } else {
                alert("You can only select up to 6 seats");
            }
        }
        setSelectedSeats(newSelected);
    };

    const calculateTotal = () => {
        // Mock prices: Premium (A-C): 350, Executive (D-F): 250, Normal (G-H): 150
        let total = 0;
        selectedSeats.forEach(seat => {
            const row = seat.charAt(0);
            if (['A', 'B', 'C'].includes(row)) total += 350;
            else if (['D', 'E', 'F'].includes(row)) total += 250;
            else total += 150;
        });
        return total;
    };

    const handleContinue = () => {
        if (selectedSeats.size === 0) return;

        const bookingData = {
            movieId: movie.id,
            movieTitle: movie.title,
            time: time,
            seats: Array.from(selectedSeats),
            seatTotal: calculateTotal()
        };

        sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
        navigate('/beverages');
    };

    return (
        <div className="seat-page container animate-fade-in">
            <div className="booking-header glass-panel">
                <div>
                    <h2>{movie.title}</h2>
                    <p className="text-muted">{time} • INOX: Multiplex</p>
                </div>
            </div>

            <div className="seat-layout glass-panel">
                <div className="screen-indicator">
                    <div className="screen"></div>
                    <span>All eyes this way</span>
                </div>

                <div className="seats-container">
                    {rows.map(row => (
                        <div key={row} className="seat-row">
                            <span className="row-label">{row}</span>
                            <div className="seat-group">
                                {cols.map(col => {
                                    const seatId = `${row}${col}`;
                                    const isBooked = bookedSeats.has(seatId);
                                    const isSelected = selectedSeats.has(seatId);
                                    const isFriend = friendSeats.has(seatId);

                                    let seatClass = 'seat';
                                    if (isBooked) seatClass += ' booked';
                                    else if (isSelected) seatClass += ' selected';
                                    else if (isFriend) seatClass += ' friend';

                                    // Add gap for aisle
                                    const addAisle = col === 5;

                                    return (
                                        <div key={seatId} className="seat-wrapper" style={{ marginRight: addAisle ? '20px' : '0' }}>
                                            <button
                                                className={seatClass}
                                                onClick={() => toggleSeat(seatId)}
                                                disabled={isBooked}
                                                title={seatId}
                                            >
                                                {col}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="seat-legend">
                    <div className="legend-item">
                        <div className="seat available"></div> <span>Available</span>
                    </div>
                    <div className="legend-item">
                        <div className="seat selected"></div> <span>Selected</span>
                    </div>
                    <div className="legend-item">
                        <div className="seat booked"></div> <span>Booked</span>
                    </div>
                    <div className="legend-item">
                        <div className="seat friend"></div> <span>Friends</span>
                    </div>
                </div>
            </div>

            {selectedSeats.size > 0 && (
                <div className="booking-footer glass-panel animate-fade-in">
                    <div className="selection-summary">
                        <h3>{selectedSeats.size} Tickets</h3>
                        <p>{Array.from(selectedSeats).join(', ')}</p>
                    </div>
                    <div className="total-action">
                        <div className="amount">
                            <span>Total:</span>
                            <h3>Rs. {calculateTotal()}</h3>
                        </div>
                        <button className="btn-primary" onClick={handleContinue}>
                            Continue to Beverages
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
