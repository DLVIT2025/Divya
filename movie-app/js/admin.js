import { fetchAllBookings } from './data.js';

// Admin Module - Handles Database Export from Firestore
export const initAdmin = () => {
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', downloadBookingsCSV);
    }
};

const downloadBookingsCSV = async () => {
    const bookings = await fetchAllBookings();
    
    if (bookings.length === 0) {
        alert('No bookings found in Firestore to export!');
        return;
    }

    // Prepare CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Email,Movie,Date,Seats,Total Price,Booking ID\n";

    // Map each booking to a CSV row
    bookings.forEach(b => {
        const seatsStr = Array.isArray(b.seats) ? b.seats.join('; ') : '';
            
        const row = [
            `"${escapeQuotes(b.userName)}"`,
            `"${escapeQuotes(b.userEmail || 'N/A')}"`,
            `"${escapeQuotes(b.movieName)}"`,
            `"${escapeQuotes(b.date)}"`,
            `"${escapeQuotes(seatsStr)}"`,
            `"${b.grandTotal || 0}"`,
            `"${escapeQuotes(b.bookingId)}"`,
        ];

        csvContent += row.join(",") + "\n";
    });

    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "CineTicket_Firestore_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const escapeQuotes = (str) => {
    if (!str) return '';
    return String(str).replace(/"/g, '""');
};
