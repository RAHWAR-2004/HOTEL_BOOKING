package com.hotel.booking.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.*;

import com.hotel.booking.entity.Room;
import com.hotel.booking.repository.RoomRepository;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // Get all rooms
    @GetMapping
    public List<Map<String, Object>> getAllRooms() {

        return roomRepository.findAll()
                .stream()
                .map(this::formatRoom)
                .collect(Collectors.toList());
    }

    // Get room by ID
    @GetMapping("/{id}")
    public Map<String, Object> getRoomById(@PathVariable Long id) {

        Room room = roomRepository.findById(id).orElse(null);

        if (room == null) {
            return null;
        }

        return formatRoom(room);
    }

    // Add room
    @PostMapping
    public Room createRoom(@RequestBody Room room) {

        if (room.getIsAvailable() == null) {
            room.setIsAvailable(true);
        }

        return roomRepository.save(room);
    }

    // Update room
    @PutMapping("/{id}")
    public Room updateRoom(
            @PathVariable Long id,
            @RequestBody Room room) {

        return roomRepository.findById(id)
                .map(existingRoom -> {

                    if (room.getHotelName() != null) {
                        existingRoom.setHotelName(room.getHotelName());
                    }

                    if (room.getLocation() != null) {
                        existingRoom.setLocation(room.getLocation());
                    }

                    if (room.getRoomType() != null) {
                        existingRoom.setRoomType(room.getRoomType());
                    }

                    if (room.getPrice() != null) {
                        existingRoom.setPrice(room.getPrice());
                    }

                    if (room.getImage() != null) {
                        existingRoom.setImage(room.getImage());
                    }

                    if (room.getIsAvailable() != null) {
                        existingRoom.setIsAvailable(
                                room.getIsAvailable()
                        );
                    }

                    if (room.getAmenities() != null) {
                        existingRoom.setAmenities(
                                room.getAmenities()
                        );
                    }

                    return roomRepository.save(existingRoom);
                })
                .orElse(null);
    }

    // Delete room
    @DeleteMapping("/{id}")
    public String deleteRoom(@PathVariable Long id) {

        if (!roomRepository.existsById(id)) {
            return "Room not found";
        }

        roomRepository.deleteById(id);

        return "Room deleted successfully";
    }

    // Format room response for React
    private Map<String, Object> formatRoom(Room room) {

        Map<String, Object> owner = Map.of(
                "image",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
        );

        Map<String, Object> hotel = Map.of(
                "name", room.getHotelName(),
                "city", room.getLocation(),
                "address", room.getLocation(),
                "owner", owner
        );

        return Map.of(
                "_id", room.getId().toString(),
                "hotel", hotel,
                "roomType", room.getRoomType(),
                "pricePerNight", room.getPrice(),
                "images", List.of(room.getImage()),

                // Actual amenities from MySQL
                "amenities",
                room.getAmenities() != null
                        ? room.getAmenities()
                        : List.of(),

                "isAvailable",
                room.getIsAvailable() != null
                        ? room.getIsAvailable()
                        : true
        );
    }
}