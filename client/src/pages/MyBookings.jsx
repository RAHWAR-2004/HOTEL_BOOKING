import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, []);

    const getBookingId = (booking) => {
        if (!booking) {
            return null;
        }

        return booking.id || booking._id || booking.bookingId || null;
    };

    const getRoomId = (booking) => {
        if (!booking) {
            return null;
        }

        if (booking.roomId) {
            return booking.roomId;
        }

        if (booking.room && booking.room.id) {
            return booking.room.id;
        }

        if (booking.room && booking.room._id) {
            return booking.room._id;
        }

        return null;
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);

            const savedUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (!savedUser || !token) {
                navigate("/login");
                return;
            }

            const user = JSON.parse(savedUser);
            const userId = user.id || user._id;

            if (!userId) {
                alert("User ID not found. Please login again.");
                navigate("/login");
                return;
            }

            const url =
                "https://hotel-booking-1-3qno.onrender.com/api/bookings/user/" +
                String(userId);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch bookings");
            }

            const data = await response.json();

            console.log("My Bookings from Spring Boot:", data);

            const activeBookings = Array.isArray(data)
                ? data.filter((booking) => {
                    const status = String(
                        booking.status || ""
                    ).toLowerCase();

                    return status !== "cancelled";
                })
                : [];

            console.log("Active Bookings:", activeBookings);

            setBookings(activeBookings);
        } catch (error) {
            console.error("Fetch Bookings Error:", error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (event, booking) => {
        event.preventDefault();
        event.stopPropagation();

        const bookingId = getBookingId(booking);

        console.log("Booking:", booking);
        console.log("Booking ID:", bookingId);

        if (!bookingId) {
            alert("Booking ID not found!");
            return;
        }

        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmCancel) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const url =
                "https://hotel-booking-1-3qno.onrender.com/api/bookings/" +
                String(bookingId);

            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            console.log("Cancel response:", response.status);

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");

                alert("Your session has expired. Please login again.");
                navigate("/login");
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();

                console.error(
                    "Cancel backend error:",
                    errorText
                );

                throw new Error("Failed to cancel booking");
            }

            alert("Booking cancelled successfully!");

            setBookings((previousBookings) => {
                return previousBookings.filter((item) => {
                    return getBookingId(item) !== bookingId;
                });
            });
        } catch (error) {
            console.error("Cancel Booking Error:", error);
            alert("Unable to cancel booking. Please try again.");
        }
    };

    const handleViewRoom = (booking) => {
        const roomId = getRoomId(booking);

        if (!roomId) {
            alert("Room information not found!");
            return;
        }

        navigate("/rooms/" + String(roomId));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>

                    <p className="text-gray-600 text-lg">
                        Loading your bookings...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4">
            <div className="max-w-6xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        My Bookings
                    </h1>

                    <p className="text-gray-600 mt-2">
                        View and manage your hotel bookings
                    </p>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-10 text-center">

                        <div className="text-6xl mb-4">
                            ðŸ¨
                        </div>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            No Active Bookings
                        </h2>

                        <p className="text-gray-500 mb-6">
                            You don't have any active hotel bookings.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/rooms")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                        >
                            Browse Rooms
                        </button>

                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {bookings.map((booking, index) => {

                            const bookingId = getBookingId(booking);
                            const roomId = getRoomId(booking);

                            const room = booking.room || {};
                            const hotel =
                                room.hotel ||
                                booking.hotel ||
                                {};

                            const hotelName =
                                hotel.name ||
                                room.hotelName ||
                                booking.hotelName ||
                                "Hotel";

                            const location =
                                hotel.city ||
                                hotel.address ||
                                room.location ||
                                booking.location ||
                                "Location not available";

                            const roomType =
                                room.roomType ||
                                booking.roomType ||
                                "Room";

                            const image =
                                (room.images &&
                                    room.images.length > 0 &&
                                    room.images[0]) ||
                                room.image ||
                                booking.image ||
                                "https://images.unsplash.com/photo-1566665797739-1674de7a421a";

                            const checkIn =
                                booking.checkInDate ||
                                booking.checkIn ||
                                "-";

                            const checkOut =
                                booking.checkOutDate ||
                                booking.checkOut ||
                                "-";

                            const totalPrice =
                                booking.totalPrice ||
                                booking.price ||
                                0;

                            return (
                                <div
                                    key={
                                        bookingId ||
                                        "booking-" + index
                                    }
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                                >

                                    <div className="h-56 w-full overflow-hidden">
                                        <img
                                            src={image}
                                            alt={hotelName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="p-6">

                                        <div className="flex justify-between items-start gap-4 mb-4">

                                            <div>
                                                <h2 className="text-xl font-bold text-gray-800">
                                                    {hotelName}
                                                </h2>

                                                <p className="text-gray-500 mt-1">
                                                    ðŸ“ {location}
                                                </p>
                                            </div>

                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                                {booking.status || "Confirmed"}
                                            </span>

                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-5">

                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500">
                                                    Room Type
                                                </p>

                                                <p className="font-semibold text-gray-800">
                                                    {roomType}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500">
                                                    Booking ID
                                                </p>

                                                <p className="font-semibold text-gray-800 break-all">
                                                    {bookingId || "N/A"}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500">
                                                    Check-in
                                                </p>

                                                <p className="font-semibold text-gray-800">
                                                    {checkIn}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500">
                                                    Check-out
                                                </p>

                                                <p className="font-semibold text-gray-800">
                                                    {checkOut}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="flex justify-between items-center mb-5">

                                            <span className="text-gray-600">
                                                Total Price
                                            </span>

                                            <span className="text-2xl font-bold text-blue-600">
                                                â‚¹
                                                {Number(
                                                    totalPrice
                                                ).toLocaleString("en-IN")}
                                            </span>

                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewRoom(booking)
                                                }
                                                disabled={!roomId}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition"
                                            >
                                                View Room
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(event) =>
                                                    handleCancelBooking(
                                                        event,
                                                        booking
                                                    )
                                                }
                                                disabled={!bookingId}
                                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition"
                                            >
                                                Cancel Booking
                                            </button>

                                        </div>

                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
        </div>
    );
};

export default MyBookings;