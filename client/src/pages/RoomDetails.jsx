import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, facilityIcons, roomCommonData } from '../assets/assets'
import StarRating from '../components/StarRating'

const RoomDetails = () => {

    const { id } = useParams()
    const navigate = useNavigate()

    const [room, setRoom] = useState(null)
    const [mainImage, setMainImage] = useState(null)

    const [checkInDate, setCheckInDate] = useState("")
    const [checkOutDate, setCheckOutDate] = useState("")
    const [guests, setGuests] = useState("")

    const [availabilityChecked, setAvailabilityChecked] = useState(false)
    const [roomAvailable, setRoomAvailable] = useState(false)

    const [showPayment, setShowPayment] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("")
    const [paymentProcessing, setPaymentProcessing] = useState(false)

    const [demoCardNumber, setDemoCardNumber] = useState("")
    const [demoCardName, setDemoCardName] = useState("")
    const [demoExpiry, setDemoExpiry] = useState("")
    const [demoCvv, setDemoCvv] = useState("")
    const [demoUpiId, setDemoUpiId] = useState("")


    useEffect(() => {

        fetch(`https://hotel-booking-1-3qno.onrender.com/api/rooms/${id}`)
            .then((response) => {

                if (!response.ok) {
                    throw new Error("Room not found")
                }

                return response.json()
            })
            .then((data) => {

                console.log("Room Details:", data)

                setRoom(data)

                if (data && data.images && data.images.length > 0) {
                    setMainImage(data.images[0])
                }

            })
            .catch((error) => {
                console.error("Error fetching room details:", error)
            })

    }, [id])


    const getTotalNights = () => {

        if (!checkInDate || !checkOutDate) {
            return 0
        }

        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)

        const difference =
            checkOut.getTime() - checkIn.getTime()

        if (difference <= 0) {
            return 0
        }

        return Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        )
    }


    const getTotalPrice = () => {

        const nights = getTotalNights()

        const price = Number(room?.pricePerNight || 0)

        return nights * price
    }


    const generateDemoPaymentDetails = () => {

        const randomFourDigits =
            Math.floor(1000 + Math.random() * 9000)

        const randomCvv =
            Math.floor(100 + Math.random() * 900)

        const randomMonth =
            Math.floor(1 + Math.random() * 12)

        const randomYear =
            new Date().getFullYear() + 1 +
            Math.floor(Math.random() * 4)

        const month =
            String(randomMonth).padStart(2, "0")

        setDemoCardNumber(
            `4111 1111 1111 ${randomFourDigits}`
        )

        setDemoCardName("DEMO USER")

        setDemoExpiry(
            `${month}/${String(randomYear).slice(-2)}`
        )

        setDemoCvv(String(randomCvv))

        setDemoUpiId(
            `demo${Math.floor(1000 + Math.random() * 9000)}@upi`
        )
    }


    const validateBookingDetails = () => {

        if (!checkInDate || !checkOutDate) {

            alert("Please select Check-In and Check-Out dates.")

            return false
        }

        if (!guests || Number(guests) < 1) {

            alert("Please enter number of guests.")

            return false
        }

        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)

        if (checkOut <= checkIn) {

            alert("Check-Out date must be after Check-In date!")

            return false
        }

        if (!room) {

            alert("Room information is not available.")

            return false
        }

        return true
    }


    const handleBooking = async (e) => {

        e.preventDefault()

        const savedUser = localStorage.getItem("user")
        const token = localStorage.getItem("token")

        if (!savedUser || !token) {

            alert("Please login first!")

            navigate("/login")

            return
        }

        try {

            JSON.parse(savedUser)

        } catch (error) {

            console.error("Invalid user data:", error)

            alert("Please login again!")

            localStorage.removeItem("user")
            localStorage.removeItem("token")

            navigate("/login")

            return
        }


        /*
         * STEP 2:
         * If availability has already been checked,
         * clicking the button means BOOK NOW.
         */
        if (availabilityChecked && roomAvailable) {

            generateDemoPaymentDetails()

            setPaymentMethod("")

            setShowPayment(true)

            return
        }


        /*
         * STEP 1:
         * Check room availability.
         */
        if (!validateBookingDetails()) {
            return
        }


        try {

            const availabilityResponse = await fetch(
                `https://hotel-booking-1-3qno.onrender.com/api/bookings/check-availability?roomId=${id}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
            )

            if (!availabilityResponse.ok) {

                alert("Unable to check room availability.")

                return
            }


            const availabilityData =
                await availabilityResponse.json()

            console.log(
                "Availability:",
                availabilityData
            )


            if (
                availabilityData.available === false ||
                availabilityData.isAvailable === false
            ) {

                setAvailabilityChecked(true)
                setRoomAvailable(false)

                alert(
                    "This room is not available for the selected dates."
                )

                return
            }


            /*
             * Room is available.
             * Do NOT open payment here.
             * Show BOOK NOW first.
             */
            setAvailabilityChecked(true)
            setRoomAvailable(true)

            alert(
                "Room is available! Click BOOK NOW to continue."
            )

        } catch (error) {

            console.error(
                "Availability check error:",
                error
            )

            alert(
                "Unable to check availability. Backend server se connection check karein."
            )
        }
    }


    const handlePayment = async () => {

        if (!paymentMethod) {

            alert("Please select Card or UPI.")

            return
        }


        const savedUser = localStorage.getItem("user")
        const token = localStorage.getItem("token")

        if (!savedUser || !token) {

            alert("Please login again.")

            navigate("/login")

            return
        }


        let user

        try {

            user = JSON.parse(savedUser)

        } catch (error) {

            alert("Please login again.")

            navigate("/login")

            return
        }


        const nights = getTotalNights()
        const totalPrice = getTotalPrice()


        if (nights <= 0) {

            alert("Please select valid booking dates.")

            return
        }


        if (paymentMethod === "Card") {

            if (
                !demoCardNumber ||
                !demoCardName ||
                !demoExpiry ||
                !demoCvv
            ) {

                alert("Demo card details are missing.")

                return
            }
        }


        if (paymentMethod === "UPI") {

            if (!demoUpiId) {

                alert("Demo UPI ID is missing.")

                return
            }
        }


        setPaymentProcessing(true)


        try {

            await new Promise((resolve) => {
                setTimeout(resolve, 1200)
            })


            const bookingData = {

                userId: user.id,

                roomId: Number(id),

                checkInDate: checkInDate,

                checkOutDate: checkOutDate,

                guests: Number(guests),

                totalPrice: totalPrice,

                status: "CONFIRMED"
            }


            console.log(
                "Booking Data:",
                bookingData
            )


            const response = await fetch(
                "https://hotel-booking-1-3qno.onrender.com/api/bookings",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify(bookingData)
                }
            )


            if (!response.ok) {

                const errorText =
                    await response.text()

                console.error(
                    "Booking failed:",
                    errorText
                )


                if (response.status === 401) {

                    alert(
                        "Your login session has expired. Please login again."
                    )

                    localStorage.removeItem("token")
                    localStorage.removeItem("user")

                    navigate("/login")

                    return
                }


                if (response.status === 409) {

                    alert(
                        "This room is already booked for these dates."
                    )

                    return
                }


                alert(
                    errorText ||
                    "Booking failed. Please try again."
                )

                return
            }


            const savedBooking =
                await response.json()

            console.log(
                "Booking saved:",
                savedBooking
            )


            alert(
                `Payment Successful!\n\nPayment Method: ${paymentMethod}\nTotal Nights: ${nights}\nTotal Amount: â‚¹${totalPrice}\n\nBooking Confirmed!`
            )


            setShowPayment(false)

            setPaymentMethod("")

            setCheckInDate("")
            setCheckOutDate("")
            setGuests("")

            setAvailabilityChecked(false)
            setRoomAvailable(false)


            navigate("/my-bookings")


        } catch (error) {

            console.error(
                "Payment / Booking Error:",
                error
            )

            alert(
                "Backend server se connection nahi ho raha."
            )

        } finally {

            setPaymentProcessing(false)
        }
    }


    if (!room) {

        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p>Loading room details...</p>
            </div>
        )
    }


    return (
        <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>

            {/* Room Details */}

            <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>

                <h1 className='text-3xl md:text-4xl font-playfair'>

                    {room.hotel?.name}

                    <span className='font-inter text-sm'>
                        ({room.roomType})
                    </span>

                </h1>

                <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'>
                    20% OFF
                </p>

            </div>


            {/* Room Rating */}

            <div className='flex items-center gap-1 mt-2'>

                <StarRating />

                <p className='ml-2'>
                    200+ reviews
                </p>

            </div>


            {/* Room Address */}

            <div className='flex items-center gap-1 text-gray-500 mt-2'>

                <img
                    src={assets.locationIcon}
                    alt="location-icon"
                />

                <span>
                    {room.hotel?.address}
                </span>

            </div>


            {/* Room Images */}

            <div className='flex flex-col lg:flex-row mt-6 gap-6'>

                <div className='lg:w-1/2 w-full'>

                    <img
                        src={mainImage}
                        alt="Room Image"
                        className='w-full rounded-xl shadow-lg object-cover'
                    />

                </div>


                <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>

                    {room?.images?.length > 1 &&
                        room.images.map((image, index) => (

                            <img
                                onClick={() => setMainImage(image)}
                                key={index}
                                src={image}
                                alt="Room Image"
                                className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${
                                    mainImage === image
                                        ? 'outline-3 outline-orange-500'
                                        : ''
                                }`}
                            />

                        ))
                    }

                </div>

            </div>


            {/* Room Highlights */}

            <div className='flex flex-col md:flex-row md:justify-between mt-10'>

                <div className='flex flex-col'>

                    <h1 className='text-3xl md:text-4xl font-playfair'>
                        Experience luxury Like Never Before
                    </h1>


                    <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>

                        {room.amenities?.map((item, index) => (

                            <div
                                key={index}
                                className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'
                            >

                                {facilityIcons[item] && (

                                    <img
                                        src={facilityIcons[item]}
                                        alt={item}
                                        className='w-5 h-5'
                                    />

                                )}

                                <p className='text-xs'>
                                    {item}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>


                {/* Room Price */}

                <p className='text-2xl font-medium'>

                    â‚¹{room.pricePerNight}/night

                </p>

            </div>


            {/* CheckIn CheckOut Form */}

            <form
                onSubmit={handleBooking}
                className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'
            >

                <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>

                    <div className='flex flex-col'>

                        <label
                            htmlFor="CheckInDate"
                            className='font-medium'
                        >
                            Check-In
                        </label>

                        <input
                            type="date"
                            id='CheckInDate'
                            value={checkInDate}
                            onChange={(e) => {
                                setCheckInDate(e.target.value)
                                setAvailabilityChecked(false)
                                setRoomAvailable(false)
                            }}
                            className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
                            required
                        />

                    </div>


                    <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>


                    <div className='flex flex-col'>

                        <label
                            htmlFor="CheckOutDate"
                            className='font-medium'
                        >
                            Check-Out
                        </label>

                        <input
                            type="date"
                            id='CheckOutDate'
                            value={checkOutDate}
                            onChange={(e) => {
                                setCheckOutDate(e.target.value)
                                setAvailabilityChecked(false)
                                setRoomAvailable(false)
                            }}
                            className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
                            required
                        />

                    </div>


                    <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>


                    <div className='flex flex-col'>

                        <label
                            htmlFor="guests"
                            className='font-medium'
                        >
                            Guests
                        </label>

                        <input
                            type="number"
                            id='guests'
                            placeholder='0'
                            value={guests}
                            onChange={(e) => {
                                setGuests(e.target.value)
                                setAvailabilityChecked(false)
                                setRoomAvailable(false)
                            }}
                            min="1"
                            className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
                            required
                        />

                    </div>

                </div>


                <button
                    type='submit'
                    className={`${
                        availabilityChecked && roomAvailable
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-primary hover:bg-primary-dull'
                    } active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer`}
                >

                    {availabilityChecked && roomAvailable
                        ? "Book Now"
                        : "Check Availability"
                    }

                </button>

            </form>


            {/* Common Specifications */}

            <div className='mt-25 space-y-4'>

                {roomCommonData.map((spec, index) => (

                    <div
                        key={index}
                        className='flex items-start gap-2'
                    >

                        <img
                            src={spec.icon}
                            alt={`${spec.title}-icon`}
                            className='w-6.5'
                        />

                        <div>

                            <p className='text-base'>
                                {spec.title}
                            </p>

                            <p className='text-gray-500'>
                                {spec.description}
                            </p>

                        </div>

                    </div>

                ))}

            </div>


            <div className='max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500'>

                <p>

                    Guests will be allocated on the ground floor according to availability.
                    You get a comfortable two bedrooms apartment with a true city feeling.
                    The price quoted is for two guests, at the guests slot please mark the
                    number of guests to get the exact price for groups.

                </p>

            </div>


            {/* Hosted by */}

            <div className='flex flex-col items-start gap-4'>

                <div className='flex gap-4'>

                    <img
                        src={room.hotel?.owner?.image}
                        alt="Host"
                        className='h-14 w-14 md:h-18 rounded-full'
                    />

                    <div>

                        <p className='text-lg md:text-xl'>
                            Hosted by {room.hotel?.name}
                        </p>

                        <div className='flex items-center mt-1'>

                            <StarRating />

                            <p className='ml-2'>
                                200+ reviews
                            </p>

                        </div>

                    </div>

                </div>


                <button
                    className='px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer'
                >
                    Contact Now
                </button>

            </div>


            {/* Payment Modal */}

            {showPayment && (

                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4'>

                    <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative'>

                        <button
                            type='button'
                            onClick={() => setShowPayment(false)}
                            className='absolute right-4 top-3 text-gray-500 text-2xl hover:text-black'
                            disabled={paymentProcessing}
                        >
                            Ã—
                        </button>


                        <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
                            Payment
                        </h2>


                        <p className='text-gray-500 mb-5'>
                            Select a demo payment method
                        </p>


                        <div className='bg-gray-100 rounded-lg p-4 mb-5'>

                            <div className='flex justify-between mb-2'>

                                <span className='text-gray-600'>
                                    Room
                                </span>

                                <span className='font-medium'>
                                    {room.roomType}
                                </span>

                            </div>


                            <div className='flex justify-between mb-2'>

                                <span className='text-gray-600'>
                                    Nights
                                </span>

                                <span className='font-medium'>
                                    {getTotalNights()}
                                </span>

                            </div>


                            <div className='flex justify-between text-lg font-bold'>

                                <span>
                                    Total
                                </span>

                                <span>
                                    â‚¹{getTotalPrice()}
                                </span>

                            </div>

                        </div>


                        {/* Payment Methods */}

                        <div className='grid grid-cols-2 gap-3 mb-5'>

                            <button
                                type='button'
                                onClick={() => setPaymentMethod("Card")}
                                className={`border rounded-lg p-3 transition-all ${
                                    paymentMethod === "Card"
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-300'
                                }`}
                                disabled={paymentProcessing}
                            >
                                ðŸ’³ Card
                            </button>


                            <button
                                type='button'
                                onClick={() => setPaymentMethod("UPI")}
                                className={`border rounded-lg p-3 transition-all ${
                                    paymentMethod === "UPI"
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-300'
                                }`}
                                disabled={paymentProcessing}
                            >
                                ðŸ“± UPI
                            </button>

                        </div>


                        {/* Card Details */}

                        {paymentMethod === "Card" && (

                            <div className='space-y-3'>

                                <div>

                                    <label className='text-sm text-gray-600'>
                                        Card Number
                                    </label>

                                    <input
                                        type='text'
                                        value={demoCardNumber}
                                        readOnly
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 bg-gray-100'
                                    />

                                </div>


                                <div>

                                    <label className='text-sm text-gray-600'>
                                        Card Holder
                                    </label>

                                    <input
                                        type='text'
                                        value={demoCardName}
                                        readOnly
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 bg-gray-100'
                                    />

                                </div>


                                <div className='grid grid-cols-2 gap-3'>

                                    <div>

                                        <label className='text-sm text-gray-600'>
                                            Expiry
                                        </label>

                                        <input
                                            type='text'
                                            value={demoExpiry}
                                            readOnly
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 bg-gray-100'
                                        />

                                    </div>


                                    <div>

                                        <label className='text-sm text-gray-600'>
                                            CVV
                                        </label>

                                        <input
                                            type='text'
                                            value={demoCvv}
                                            readOnly
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 bg-gray-100'
                                        />

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* UPI Details */}

                        {paymentMethod === "UPI" && (

                            <div>

                                <label className='text-sm text-gray-600'>
                                    Demo UPI ID
                                </label>

                                <input
                                    type='text'
                                    value={demoUpiId}
                                    readOnly
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 bg-gray-100'
                                />

                            </div>

                        )}


                        {/* Pay Button */}

                        <button
                            type='button'
                            onClick={handlePayment}
                            disabled={
                                !paymentMethod ||
                                paymentProcessing
                            }
                            className='w-full mt-6 bg-primary hover:bg-primary-dull disabled:bg-gray-400 text-white py-3 rounded-lg transition-all'
                        >

                            {paymentProcessing
                                ? "Processing Payment..."
                                : "Pay Now"
                            }

                        </button>


                        <p className='text-xs text-gray-400 text-center mt-3'>
                            Demo payment only. No real money will be charged.
                        </p>

                    </div>

                </div>

            )}

        </div>
    )
}

export default RoomDetails