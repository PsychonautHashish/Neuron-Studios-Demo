// filepath: studio-scheduling-app/src/utils/bookings.js

let bookings = [];

export const addBooking = (date, details) => {
    if (!isDateBooked(date)) {
        bookings.push({ date, details });
        return true;
    }
    return false;
};

export const isDateBooked = (date) => {
    return bookings.some(booking => booking.date === date);
};

export const getBookings = () => {
    return bookings;
};