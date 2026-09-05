import React, { useState } from 'react';
import Title from '../../components/Title';
import { assets } from '../../assets/assets';

const AddRoom = () => {
  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [inputs, setInputs] = useState({
    roomType: '',
    pricePerNight: 0,
    amenities: {
      'Free WiFi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false,
    },
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!inputs.roomType) {
      alert('Please select a room type');
      return;
    }

    if (!inputs.pricePerNight || Number(inputs.pricePerNight) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    // Selected amenities
    const selectedAmenities = Object.keys(inputs.amenities).filter(
      (amenity) => inputs.amenities[amenity]
    );

    // Backend currently expects these fields
    const roomData = {
      hotelName: 'Grand Palace Hotel',
      location: 'Kolkata',
      roomType: inputs.roomType,
      price: Number(inputs.pricePerNight),

      // Using existing online image for database storage
      // The selected image will still show in the form preview
      image:
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a',

      amenities: selectedAmenities,
    };

    try {
      setLoading(true);

      const response = await fetch('http://localhost:8080/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        throw new Error('Failed to add room');
      }

      const data = await response.json();

      console.log('Room added successfully:', data);
      console.log('Selected amenities:', selectedAmenities);

      alert('Room added successfully!');

      // Reset form
      setInputs({
        roomType: '',
        pricePerNight: 0,
        amenities: {
          'Free WiFi': false,
          'Free Breakfast': false,
          'Room Service': false,
          'Mountain View': false,
          'Pool Access': false,
        },
      });

      setImages({
        1: null,
        2: null,
        3: null,
        4: null,
      });
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Failed to add room. Please check if Spring Boot is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Title
        align='left'
        font='outfit'
        title='Add Room'
        subTitle='Fill in the details carefully and accurate
        room details, pricing,and amenities,to enhance the user booking experience'
      />

      {/* Upload Area For Images */}
      <p className='text-gray-800 mt-10'>Images</p>

      <div className='grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap'>
        {Object.keys(images).map((key) => (
          <label htmlFor={`roomImages${key}`} key={key}>
            <img
              className='max-h-13 cursor-pointer opacity-80'
              src={
                images[key]
                  ? URL.createObjectURL(images[key])
                  : assets.uploadArea
              }
              alt=''
            />

            <input
              type='file'
              accept='image/*'
              id={`roomImages${key}`}
              hidden
              onChange={(e) =>
                setImages({
                  ...images,
                  [key]: e.target.files[0],
                })
              }
            />
          </label>
        ))}
      </div>

      <div className='w-full flex max-sm:flex-col sm:gap-4 mt-4'>
        <div className='flex-1 max-w-48'>
          <p className='text-gray-800 mt-4'>Room Type</p>

          <select
            value={inputs.roomType}
            onChange={(e) =>
              setInputs({
                ...inputs,
                roomType: e.target.value,
              })
            }
            className='border opacity-70 border-gray-300 mt-1 rounded p-2 w-full'
          >
            <option value=''>Select Room Type</option>
            <option value='Single Bed'>Single Bed</option>
            <option value='Double Bed'>Double Bed</option>
            <option value='Luxury Room'>Luxury Room</option>
            <option value='Family Suite'>Family Suite</option>
          </select>
        </div>

        <div>
          <p className='mt-4 text-gray-800'>
            Price
            <span className='text-xs'>/night</span>
          </p>

          <input
            type='number'
            placeholder='0'
            className='border border-gray-300 mt-1 rounded p-2 w-24'
            value={inputs.pricePerNight}
            onChange={(e) =>
              setInputs({
                ...inputs,
                pricePerNight: e.target.value,
              })
            }
          />
        </div>
      </div>

      <p className='text-gray-800 mt-4'>Amenities</p>

      <div className='flex flex-col flex-wrap mt-1 text-gray-400 max-w-sm'>
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <div key={index}>
            <input
              type='checkbox'
              id={`amenities${index + 1}`}
              checked={inputs.amenities[amenity]}
              onChange={() =>
                setInputs({
                  ...inputs,
                  amenities: {
                    ...inputs.amenities,
                    [amenity]: !inputs.amenities[amenity],
                  },
                })
              }
            />

            <label htmlFor={`amenities${index + 1}`}>
              {amenity}
            </label>
          </div>
        ))}
      </div>

      <button
        type='submit'
        disabled={loading}
        className='bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer'
      >
        {loading ? 'Adding...' : 'Add Room'}
      </button>
    </form>
  );
};

export default AddRoom;