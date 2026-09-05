import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HotelCard from './HotelCard'
import Title from './Title'

const FeaturedDestination = () => {

    const navigate = useNavigate()
    const [rooms, setRooms] = useState([])

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/rooms')

                if (!response.ok) {
                    throw new Error('Failed to fetch rooms')
                }

                const data = await response.json()

                console.log('Featured rooms from Spring Boot:', data)

                // Only keep valid MySQL/Spring Boot numeric IDs
                const validRooms = data.filter(
                    (room) =>
                        room &&
                        room._id &&
                        Number.isInteger(Number(room._id)) &&
                        Number(room._id) > 0
                )

                console.log('Valid Featured rooms:', validRooms)

                setRooms(validRooms.slice(0, 4))

            } catch (error) {
                console.error('Error fetching featured rooms:', error)
            }
        }

        fetchRooms()
    }, [])

    return (
        <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-5 py-20'>

            <Title
                title='Featured Destination'
                subTitle='Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experience.'
            />

            <div className='flex flex-wrap items-center justify-center gap-6 mt-20'>

                {rooms.map((room, index) => (
                    <HotelCard
                        key={room._id}
                        room={room}
                        index={index}
                    />
                ))}

            </div>

            <button
                onClick={() => {
                    navigate('/rooms')
                    scrollTo(0, 0)
                }}
                className='my-16 px-4 py-2 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all cursor-pointer'
            >
                View All Destinations
            </button>

        </div>
    )
}

export default FeaturedDestination