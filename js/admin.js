// Admin Module - Handles Database Sim Export

export const initAdmin = () => {
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', downloadBookingsCSV);
    }
};

const downloadBookingsCSV = () => {
    // 1. Fetch bookings from the localStorage "database"
    const bookings = JSON.parse(localStorage.getItem('ct_bookings')) || [];
    
    if (bookings.length === 0) {
        alert('No bookings found in the database to export!');
        return;
    }

    // 2. Prepare CSV Header (Name | Email | Movie | Language | Seats | Seat Type | Snacks | Total Price | Booking ID | Date)
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Email,Movie,Language,Seats,Seat Type,Snacks,Total Price,Booking ID,Date\n";

    // 3. Map each booking to a CSV row
    bookings.forEach(b => {
        // Safe arrays to strings
        const seatsStr = Array.isArray(b.seats) ? b.seats.join('; ') : '';
        const seatTypesStr = Array.isArray(b.seatTypes) ? b.seatTypes.join('; ') : '';
        const snacksStr = b.snacks && b.snacks.length > 0 
            ? b.snacks.map(s => `${s.name} x${s.quantity}`).join(' | ') 
            : 'None';
            
        // Use userEmail from booking, or fallback to the one in session if missing
        const session = JSON.parse(localStorage.getItem('ct_session'));
        const userEmail = b.userEmail || (session ? session.email : 'unknown@user.com');

        const row = [
            `"${escapeQuotes(b.userName)}"`,
            `"${escapeQuotes(userEmail)}"`,
            `"${escapeQuotes(b.movieTitle)}"`,
            `"${escapeQuotes(b.language || 'N/A')}"`,
            `"${escapeQuotes(seatsStr)}"`,
            `"${escapeQuotes(seatTypesStr)}"`,
            `"${escapeQuotes(snacksStr)}"`,
            `"${b.grandTotal || 0}"`,
            `"${escapeQuotes(b.bookingId)}"`,
            `"${escapeQuotes(b.date)}"`,
        ];

        csvContent += row.join(",") + "\n";
    });

    // 4. Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "CineTicket_Database_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Helper function to escape double quotes in CSV fields
const escapeQuotes = (str) => {
    if (!str) return '';
    return String(str).replace(/"/g, '""');
};
