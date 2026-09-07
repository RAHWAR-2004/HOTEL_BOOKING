import React, { useEffect, useState } from "react";
import { assets, facilityIcons } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import StarRating from "../components/StarRating";

const CheckBox = ({ label, selected, onChange }) => {
    return (
        <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
            <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onChange(e.target.checked, label)}
            />
            <span className="font-light select-none">{label}</span>
        </label>
    );
};

const RadioButton = ({ label, selected, onChange }) => {
    return (
        <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
            <input
                type="radio"
                name="sortOption"
                checked={selected}
                onChange={() => onChange(label)}
            />
            <span className="font-light select-none">{label}</span>
        </label>
    );
};

const AllRooms = () => {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openFilters, setOpenFilters] = useState(false);

    const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState([]);
    const [selectedSort, setSelectedSort] = useState("");

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch(
                    "https://hotel-booking-1-3qno.onrender.com/api/rooms"
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch rooms: ${response.status}`);
                }

                const data = await response.json();

                console.log("Rooms from backend:", data);

                setRooms(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching rooms:", error);
                setRooms([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const roomTypes = [
        "Single Bed",
        "Double Bed",
        "Luxury Room",
        "Family Suite",
    ];

    const priceRanges = [
        "0 to 2000",
        "2000 to 3000",
        "3000 to 4000",
        "4000 to 5000",
    ];

    const sortOptions = [
        "Price Low to High",
        "Price High to Low",
        "Newest First",
    ];

    const handleRoomTypeChange = (checked, label) => {
        if (checked) {
            setSelectedRoomTypes((previous) => [
                ...previous,
                label,
            ]);
        } else {
            setSelectedRoomTypes((previous) =>
                previous.filter((item) => item !== label)
            );
        }
    };

    const handlePriceChange = (checked, label) => {
        if (checked) {
            setSelectedPriceRange((previous) => [
                ...previous,
                label,
            ]);
        } else {
            setSelectedPriceRange((previous) =>
                previous.filter((item) => item !== label)
            );
        }
    };

    const clearFilters = () => {
        setSelectedRoomTypes([]);
        setSelectedPriceRange([]);
        setSelectedSort("");
    };

    let filteredRooms = [...rooms];

    if (selectedRoomTypes.length > 0) {
        filteredRooms = filteredRooms.filter((room) =>
            selectedRoomTypes.includes(room.roomType)
        );
    }

    if (selectedPriceRange.length > 0) {
        filteredRooms = filteredRooms.filter((room) => {
            const price = Number(room.pricePerNight);

            return selectedPriceRange.some((range) => {
                const [min, max] = range.split(" to ").map(Number);

                return price >= min && price <= max;
            });
        });
    }

    if (selectedSort === "Price Low to High") {
        filteredRooms.sort(
            (a, b) =>
                Number(a.pricePerNight) -
                Number(b.pricePerNight)
        );
    }

    if (selectedSort === "Price High to Low") {
        filteredRooms.sort(
            (a, b) =>
                Number(b.pricePerNight) -
                Number(a.pricePerNight)
        );
    }

    if (selectedSort === "Newest First") {
        filteredRooms.reverse();
    }

    const openRoomDetails = (roomId) => {
        if (roomId === undefined || roomId === null) {
            alert("Invalid room ID");
            return;
        }

        navigate(`/rooms/${roomId}`);
        window.scrollTo(0, 0);
    };

    return (
        <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32 gap-10">

            <div className="w-full">

                <div className="flex flex-col items-start text-left">

                    <h1 className="font-playfair text-4xl md:text-[40px]">
                        Hotel Rooms
                    </h1>

                    <p className="text-sm md:text-base text-gray-500 mt-2 max-w-174">
                        Take advantage of our limited-time offers and special
                        packages to enhance your stay and create unforgettable
                        memories.
                    </p>

                </div>

                {loading ? (
                    <div className="py-20 text-gray-500">
                        Loading rooms...
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="py-20 text-gray-500">
                        No rooms found.
                    </div>
                ) : (
                    filteredRooms.map((room) => (
                        <div
                            key={room._id}
                            onClick={() => openRoomDetails(room._id)}
                            className="flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:border-0 cursor-pointer"
                        >

                            <img
                                src={room.images?.[0]}
                                alt={room.hotel?.name || "Hotel room"}
                                className="w-full md:w-1/2 h-65 rounded-xl shadow-lg object-cover"
                            />

                            <div className="md:w-1/2 flex flex-col gap-2">

                                <p className="text-gray-500">
                                    {room.hotel?.city || "Unknown City"}
                                </p>

                                <p className="text-gray-800 text-3xl font-playfair">
                                    {room.hotel?.name || "Hotel"}
                                </p>

                                <div className="flex items-center">

                                    <StarRating />

                                    <p className="ml-2 text-sm">
                                        200+ reviews
                                    </p>

                                </div>

                                <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">

                                    <img
                                        src={assets.locationIcon}
                                        alt="location"
                                        className="w-4 h-4"
                                    />

                                    <span>
                                        {room.hotel?.address || "Location unavailable"}
                                    </span>

                                </div>

                                <div className="flex flex-wrap items-center mt-3 mb-6 gap-3">

                                    {Array.isArray(room.amenities) &&
                                        room.amenities.map((item, index) => (
                                            <div
                                                key={`${item}-${index}`}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70"
                                            >

                                                {facilityIcons?.[item] && (
                                                    <img
                                                        src={facilityIcons[item]}
                                                        alt={item}
                                                        className="w-5 h-5"
                                                    />
                                                )}

                                                <p className="text-xs">
                                                    {item}
                                                </p>

                                            </div>
                                        ))}

                                </div>

                                <p className="text-xl font-medium text-gray-700">
                                    ₹{Number(room.pricePerNight).toLocaleString("en-IN")} /night
                                </p>

                            </div>

                        </div>
                    ))
                )}

            </div>

            <div className="bg-white w-full lg:w-80 border border-gray-300 text-gray-600 lg:mt-16">

                <div
                    className={`flex items-center justify-between px-5 py-3 ${
                        openFilters ? "border-b border-gray-300" : ""
                    }`}
                >

                    <p className="text-base font-medium text-gray-800">
                        Filters
                    </p>

                    <div className="text-xs cursor-pointer">

                        <span
                            onClick={() => setOpenFilters((previous) => !previous)}
                            className="lg:hidden"
                        >
                            {openFilters ? "HIDE" : "SHOW"}
                        </span>

                        <span
                            onClick={clearFilters}
                            className="hidden lg:block"
                        >
                            CLEAR
                        </span>

                    </div>

                </div>

                <div
                    className={`${
                        openFilters ? "block" : "hidden lg:block"
                    }`}
                >

                    <div className="px-5 pt-5">

                        <p className="font-medium text-gray-800 pb-2">
                            Popular Filters
                        </p>

                        {roomTypes.map((type) => (
                            <CheckBox
                                key={type}
                                label={type}
                                selected={selectedRoomTypes.includes(type)}
                                onChange={handleRoomTypeChange}
                            />
                        ))}

                    </div>

                    <div className="px-5 pt-5">

                        <p className="font-medium text-gray-800 pb-2">
                            Price Range
                        </p>

                        {priceRanges.map((range) => (
                            <CheckBox
                                key={range}
                                label={range}
                                selected={selectedPriceRange.includes(range)}
                                onChange={handlePriceChange}
                            />
                        ))}

                    </div>

                    <div className="px-5 pt-5 pb-7">

                        <p className="font-medium text-gray-800 pb-2">
                            Sort By
                        </p>

                        {sortOptions.map((option) => (
                            <RadioButton
                                key={option}
                                label={option}
                                selected={selectedSort === option}
                                onChange={setSelectedSort}
                            />
                        ))}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default AllRooms;