import React from 'react'
import Hero from '../components/Hero'
import FeaturedDestination from '../components/FeaturedDestination'
import ExclusiveOffers from '../components/ExclusiveOffers'
import Testimonial from '../components/Testimonial'
import NewsLetter from '../components/NewsLetter'

const Home = () => {
  return (
    <>
      <Hero />

      <div id="experience">
        <FeaturedDestination />
        <ExclusiveOffers />
        <Testimonial />
      </div>

      <section
        id="about"
        className="px-6 md:px-16 lg:px-24 xl:px-32 py-20 bg-slate-50"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-gray-800">
            About QuickStay
          </h2>

          <p className="mt-6 text-gray-500 leading-7">
            QuickStay makes finding and booking your perfect hotel simple,
            comfortable, and convenient. Explore carefully selected hotels,
            compare room options, and book your stay with ease.
          </p>

          <p className="mt-4 text-gray-500 leading-7">
            Whether you are planning a relaxing vacation, a business trip,
            or a memorable getaway, QuickStay helps you discover comfortable
            stays at your preferred destination.
          </p>
        </div>
      </section>

      <NewsLetter />
    </>
  )
}

export default Home