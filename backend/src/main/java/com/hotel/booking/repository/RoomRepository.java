package com.hotel.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hotel.booking.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
}