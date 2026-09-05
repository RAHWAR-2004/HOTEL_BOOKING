import React, { useEffect, useState } from 'react'
import { assets, facilityIcons } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import StarRating from '../components/StarRating';

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
    return (
        <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
            <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onChange(e.target.checked, label)}
            />
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}

const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
    return (
        <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
            <input
                type="radio"
                name="sortOption"
                checked={selected}
                onChange={() => onChange(label)}
            />
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}

const AllRooms = () => {

    const navigate = useNavigate();

    const [openFfilters, setOpenFilters] = useState(false);
    const [rooms, setRooms] = useState([]);

    const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState([]);
    const [selectedSort, setSelectedSort] = useState("");

    // Fetch rooms from Spring Boot
    useEffect(() => {

        fetch("http://localhost:8080/api/rooms")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch rooms");
                }

                return response.json();
            })
            .then((data) => {

                console.log("Rooms from backend:", data);

                // Only use rooms having a valid numeric Spring Boot ID
                const validRooms = data.filter(
                    (room) =>
                        room &&
                        room._id &&
                        !isNaN(Number(room._id))
                );

                console.log("Valid Spring Boot rooms:", validRooms);

                setRooms(validRooms);
            })
            .catch((error) => {
                console.error("Error fetching rooms:", error);
            });

    }, []);

    const roomTypes = [
        "Single Bed",
        "Double Bed",
        "Luxury Room",
        "Family Suite",
    ];

    const priceRanges = [
        "0 to 500",
        "500 to 1000",
        "1000 to 2000",
        "2000 to 3000"
    ];

    const sortOptions = [
        "Price Low to High",
        "Price High to Low",
        "Newest First"
    ];

    const handleRoomTypeChange = (checked, label) => {

        if (checked) {
            setSelectedRoomTypes([
                ...selectedRoomTypes,
                label
            ]);
        } else {
            setSelectedRoomTypes(
                selectedRoomTypes.filter(
                    (type) => type !== label
                )
            );
        }
    };

    const handlePriceChange = (checked, label) => {

        if (checked) {

            setSelectedPriceRange([
                ...selectedPriceRange,
                label
            ]);

        } else {

            setSelectedPriceRange(
                selectedPriceRange.filter(
                    (range) => range !== label
                )
            );

        }
    };

    const clearFilters = () => {
        setSelectedRoomTypes([]);
        setSelectedPriceRange([]);
        setSelectedSort("");
    };

    let filteredRooms = [...rooms];

    // Room type filter
    if (selectedRoomTypes.length > 0) {

        filteredRooms = filteredRooms.filter((room) =>
            selectedRoomTypes.includes(room.roomType)
        );

    }

    // Price filter
    if (selectedPriceRange.length > 0) {

        filteredRooms = filteredRooms.filter((room) => {

            const price = Number(room.pricePerNight);

            return selectedPriceRange.some((range) => {

                const [min, max] = range
                    .split(" to ")
                    .map(Number);

                return price >= min && price <= max;

            });

        });

    }

    // Price low to high
    if (selectedSort === "Price Low to High") {

        filteredRooms.sort(
            (a, b) =>
                Number(a.pricePerNight) -
                Number(b.pricePerNight)
        );

    }

    // Price high to low
    if (selectedSort === "Price High to Low") {

        filteredRooms.sort(
            (a, b) =>
                Number(b.pricePerNight) -
                Number(a.pricePerNight)
        );

    }

    // Newest first
    if (selectedSort === "Newest First") {

        filteredRooms.reverse();

    }

    // Open Room Details
    const openRoomDetails = (roomId) => {

        console.log("Opening room:", roomId);

        if (!roomId || isNaN(Number(roomId))) {

            console.error(
                "Invalid Spring Boot room ID:",
                roomId
            );

            alert("This room has invalid room information.");
            return;
        }

        navigate(`/rooms/${roomId}`);

        window.scrollTo(0, 0);
    };

    return (
        <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>

            <div>

                <div className='flex flex-col items-start text-left'>

                    <h1 className='font-playfair text-4xl md:text-[40px]'>
                        Hotel Rooms
                    </h1>

                    <p className='text-sm md:text-base text-gray-500/90 mt-2 max-w-174'>
                        Take advantage of our limited-time offers and special
                        pacakages to enhance your stay and create unforgettable memories.
                    </p>

                </div>

                {filteredRooms.length === 0 ? (

                    <div className='py-20 text-gray-500'>
                        No rooms found for the selected filters.
                    </div>

                ) : (

                    filteredRooms.map((room) => (

                        <div
                            key={room._id}
                            onClick={() =>
                                openRoomDetails(room._id)
                            }
                            className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0 cursor-pointer'
                        >

                            <img
                                src={room.images?.[0]}
                                alt="hotel-img"
                                title='View Room Details'
                                className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer'
                            />

                            <div className='md:w-1/2 flex flex-col gap-2'>

                                <p className='text-gray-500'>
                                    {room.hotel?.city}
                                </p>

                                <p className='text-gray-800 text-3xl font-playfair'>
                                    {room.hotel?.name}
                                </p>

                                <div className='flex items-center'>

                                    <StarRating />

                                    <p className='ml-2'>
                                        200+ reviews
                                    </p>

                                </div>

                                <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>

                                    <img
                                        src={assets.locationIcon}
                                        alt="location-icon"
                                    />

                                    <span>
                                        {room.hotel?.address}
                                    </span>

                                </div>

                                <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>

                                    {room.amenities?.map(
                                        (item, index) => (

                                            <div
                                                key={index}
                                                className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70'
                                            >

                                                <img
                                                    src={facilityIcons[item]}
                                                    alt={item}
                                                    className='w-5 h-5'
                                                />

                                                <p className='text-xs'>
                                                    {item}
                                                </p>

                                            </div>

                                        )
                                    )}

                                </div>

                                <p className='text-xl font-medium text-gray-700'>
                                    ₹{room.pricePerNight} /night
                                </p>

                            </div>

                        </div>

                    ))

                )}

            </div>

            {/* Filters */}

            <div className='bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16'>

                <div
                    className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300 ${
                        openFfilters && "border-b"
                    }`}
                >

                    <p className='text-base font-medium text-gray-800'>
                        Filters
                    </p>

                    <div className='text-xs cursor-pointer'>

                        <span
                            onClick={() =>
                                setOpenFilters(!openFfilters)
                            }
                            className='lg:hidden'
                        >
                            {openFfilters ? 'HIDE' : 'SHOW'}
                        </span>

                        <span
                            onClick={clearFilters}
                            className='hidden lg:block'
                        >
                            CLEAR
                        </span>

                    </div>

                </div>

                <div
                    className={`${
                        openFfilters
                            ? 'h-auto'
                            : "h-0 lg:h-auto"
                    } overflow-hidden transition-all duration-700`}
                >
                </div>

                {/* Popular Filters */}

                <div className='px-5 pt-5'>

                    <p className='font-medium text-gray-800 pb-2'>
                        Popular filters
                    </p>

                    {roomTypes.map((room, index) => (

                        <CheckBox
                            key={index}
                            label={room}
                            selected={
                                selectedRoomTypes.includes(room)
                            }
                            onChange={handleRoomTypeChange}
                        />

                    ))}

                </div>

                {/* Price Range */}

                <div className='px-5 pt-5'>

                    <p className='font-medium text-gray-800 pb-2'>
                        price Range
                    </p>

                    {priceRanges.map((range, index) => (

                        <CheckBox
                            key={index}
                            label={`$ ${range}`}
                            selected={
                                selectedPriceRange.includes(range)
                            }
                            onChange={handlePriceChange}
                        />

                    ))}

                </div>

                {/* Sort */}

                <div className='px-5 pt-5 pb-7'>

                    <p className='font-medium text-gray-800 pb-2'>
                        sort By
                    </p>

                    {sortOptions.map((option, index) => (

                        <RadioButton
                            key={index}
                            label={option}
                            selected={
                                selectedSort === option
                            }
                            onChange={setSelectedSort}
                        />

                    ))}

                </div>

            </div>

        </div>
    )
}

export default AllRooms