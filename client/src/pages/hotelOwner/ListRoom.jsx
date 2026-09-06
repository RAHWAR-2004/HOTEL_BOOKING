import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';

const ListRoom = () => {

  const [rooms, setRooms] = useState([]);

  useEffect(() => {

    const fetchRooms = async () => {

      try {

        const response = await fetch(
          'https://hotel-booking-1-3qno.onrender.com/api/rooms'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }

        const data = await response.json();

        console.log('Rooms from backend:', data);

        setRooms(data);

      } catch (error) {

        console.error('Error fetching rooms:', error);

      }

    };

    fetchRooms();

  }, []);


  // Toggle availability and save to MySQL
  const handleToggleAvailability = async (index) => {

    const room = rooms[index];

    const newAvailability = room.isAvailable === false;

    try {

      const response = await fetch(
        `https://hotel-booking-1-3qno.onrender.com/api/rooms/${room._id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            isAvailable: newAvailability,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      const updatedRoom = await response.json();

      console.log(
        'Availability updated:',
        updatedRoom
      );

      // Update React state
      const updatedRooms = [...rooms];

      updatedRooms[index] = {
        ...updatedRooms[index],
        isAvailable: updatedRoom.isAvailable,
      };

      setRooms(updatedRooms);

    } catch (error) {

      console.error(
        'Error updating availability:',
        error
      );

      alert(
        'Failed to update room availability'
      );

    }

  };


  return (
    <div>

      <Title
        align="left"
        font="outfit"
        title="Room Listings"
        subTitle="view, edit, or manage all listed rooms. Keep the information up-to-date to provide the best experience for users."
      />

      <p className="text-gray-500 mt-8">
        All Rooms
      </p>

      <div className="w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll mt-3">
      </div>


      <table className="w-full">

        <thead className="bg-gray-50">

          <tr>

            <th className="py-3 px-4 text-gray-800 font-medium">
              Name
            </th>

            <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
              Facility
            </th>

            <th className="py-3 px-4 text-gray-800 font-medium">
              Price / night
            </th>

            <th className="py-3 px-4 text-gray-800 font-medium text-center">
              Actions
            </th>

          </tr>

        </thead>


        <tbody className="text-sm">

          {rooms.map((item, index) => (

            <tr key={item._id || index}>

              <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                {item.roomType}
              </td>


              <td className="py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden">
                {item.amenities?.join(', ') || 'No facilities'}
              </td>


              <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                â‚¹{item.pricePerNight}
              </td>


              <td className="py-3 px-4 border-t border-gray-300 text-sm text-center">

                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">

                  <input
                    type="checkbox"
                    className="sr-only peer"

                    checked={
                      item.isAvailable !== false
                    }

                    onChange={() =>
                      handleToggleAvailability(index)
                    }

                  />


                  <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200">
                  </div>


                  <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5">
                  </span>

                </label>


                <span className="ml-2 text-gray-600">

                  {item.isAvailable !== false
                    ? 'Available'
                    : 'Not Available'}

                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default ListRoom;