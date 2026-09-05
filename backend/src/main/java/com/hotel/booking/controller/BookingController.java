package com.hotel.booking.controller;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.User;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.security.JwtService;

import jakarta.servlet.http.HttpServletRequest;

@CrossOrigin(
    origins = "http://localhost:5173",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    },
    allowedHeaders = "*"
)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public BookingController(
            BookingRepository bookingRepository,
            RoomRepository roomRepository,
            UserRepository userRepository,
            JwtService jwtService) {

        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    // =========================================================
    // CHECK ROOM AVAILABILITY
    // =========================================================

    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam Long roomId,
            @RequestParam String checkInDate,
            @RequestParam String checkOutDate) {

        try {

            LocalDate checkIn = LocalDate.parse(checkInDate);
            LocalDate checkOut = LocalDate.parse(checkOutDate);

            if (!checkOut.isAfter(checkIn)) {
                return ResponseEntity.badRequest()
                        .body("Check-out date must be after check-in date.");
            }

            Room room = roomRepository.findById(roomId).orElse(null);

            if (room == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Room not found.");
            }

            List<Booking> bookings =
                    bookingRepository.findByRoomId(roomId);

            for (Booking booking : bookings) {

                // Cancelled bookings do NOT block availability
                if ("Cancelled".equalsIgnoreCase(booking.getStatus())) {
                    continue;
                }

                LocalDate existingCheckIn =
                        LocalDate.parse(booking.getCheckInDate());

                LocalDate existingCheckOut =
                        LocalDate.parse(booking.getCheckOutDate());

                boolean overlap =
                        checkIn.isBefore(existingCheckOut)
                        && checkOut.isAfter(existingCheckIn);

                if (overlap) {
                    return ResponseEntity.ok(
                            Map.of(
                                "available", false,
                                "message", "Room is already booked for selected dates."
                            )
                    );
                }
            }

            return ResponseEntity.ok(
                    Map.of(
                        "available", true,
                        "message", "Room is available."
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("Invalid date format. Use yyyy-MM-dd.");
        }
    }

    // =========================================================
    // CREATE BOOKING
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody Booking booking,
            HttpServletRequest request) {

        try {

            String email = getLoggedInEmail(request);

            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Please login first.");
            }

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found.");
            }

            Room room = roomRepository
                    .findById(booking.getRoomId())
                    .orElse(null);

            if (room == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Room not found.");
            }

            if (booking.getCheckInDate() == null
                    || booking.getCheckOutDate() == null) {

                return ResponseEntity.badRequest()
                        .body("Check-in and check-out dates are required.");
            }

            LocalDate checkIn =
                    LocalDate.parse(booking.getCheckInDate());

            LocalDate checkOut =
                    LocalDate.parse(booking.getCheckOutDate());

            if (!checkOut.isAfter(checkIn)) {

                return ResponseEntity.badRequest()
                        .body("Check-out date must be after check-in date.");
            }

            // Check overlapping bookings
            List<Booking> existingBookings =
                    bookingRepository.findByRoomId(room.getId());

            for (Booking existing : existingBookings) {

                if ("Cancelled".equalsIgnoreCase(existing.getStatus())) {
                    continue;
                }

                LocalDate existingCheckIn =
                        LocalDate.parse(existing.getCheckInDate());

                LocalDate existingCheckOut =
                        LocalDate.parse(existing.getCheckOutDate());

                boolean overlap =
                        checkIn.isBefore(existingCheckOut)
                        && checkOut.isAfter(existingCheckIn);

                if (overlap) {

                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("Room is already booked for selected dates.");
                }
            }

            long nights =
                    ChronoUnit.DAYS.between(checkIn, checkOut);

            double totalPrice =
                    room.getPrice() * nights;

            booking.setUserId(user.getId());
            booking.setTotalPrice(totalPrice);
            booking.setStatus("Confirmed");

            Booking savedBooking =
                    bookingRepository.save(booking);

            return ResponseEntity.ok(
                    formatBooking(savedBooking)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("Unable to create booking: " + e.getMessage());
        }
    }

    // =========================================================
    // GET USER BOOKINGS
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(
            @PathVariable Long userId,
            HttpServletRequest request) {

        try {

            String email = getLoggedInEmail(request);

            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Please login first.");
            }

            User loggedInUser =
                    userRepository.findByEmail(email).orElse(null);

            if (loggedInUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found.");
            }

            // User can only see their own bookings
            if (!loggedInUser.getId().equals(userId)) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only view your own bookings.");
            }

            /*
             * Get all bookings of the user.
             *
             * We intentionally use findByUserId()
             * instead of a custom repository query.
             */
            List<Booking> bookings =
                    bookingRepository.findByUserId(userId);

            List<Map<String, Object>> result =
                    new ArrayList<>();

            for (Booking booking : bookings) {

                // IMPORTANT:
                // Cancelled bookings should NOT appear in My Bookings
                if ("Cancelled".equalsIgnoreCase(booking.getStatus())) {
                    continue;
                }

                result.add(formatBooking(booking));
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to fetch bookings: " + e.getMessage());
        }
    }

    // =========================================================
    // GET ALL BOOKINGS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAllBookings() {

        List<Booking> bookings =
                bookingRepository.findAll();

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (Booking booking : bookings) {

            result.add(formatBooking(booking));
        }

        return ResponseEntity.ok(result);
    }

    // =========================================================
    // GET BOOKING BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(
            @PathVariable Long id) {

        Booking booking =
                bookingRepository.findById(id).orElse(null);

        if (booking == null) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Booking not found.");
        }

        return ResponseEntity.ok(
                formatBooking(booking)
        );
    }

    // =========================================================
    // CANCEL BOOKING
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            HttpServletRequest request) {

        try {

            String email = getLoggedInEmail(request);

            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Please login first.");
            }

            User loggedInUser =
                    userRepository.findByEmail(email).orElse(null);

            if (loggedInUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found.");
            }

            Booking booking =
                    bookingRepository.findById(id).orElse(null);

            if (booking == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Booking not found.");
            }

            // Ownership check
            if (!loggedInUser.getId().equals(booking.getUserId())) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only cancel your own booking.");
            }

            // Do not physically delete.
            // Keep it in database as history.
            booking.setStatus("Cancelled");

            bookingRepository.save(booking);

            return ResponseEntity.ok(
                    Map.of(
                        "message",
                        "Booking cancelled successfully."
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to cancel booking: " + e.getMessage());
        }
    }

    // =========================================================
    // UPDATE BOOKING
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(
            @PathVariable Long id,
            @RequestBody Booking updatedBooking,
            HttpServletRequest request) {

        try {

            String email = getLoggedInEmail(request);

            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Please login first.");
            }

            User loggedInUser =
                    userRepository.findByEmail(email).orElse(null);

            if (loggedInUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found.");
            }

            Booking existingBooking =
                    bookingRepository.findById(id).orElse(null);

            if (existingBooking == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Booking not found.");
            }

            if (!loggedInUser.getId()
                    .equals(existingBooking.getUserId())) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only update your own booking.");
            }

            if (updatedBooking.getRoomId() == null
                    || updatedBooking.getCheckInDate() == null
                    || updatedBooking.getCheckOutDate() == null) {

                return ResponseEntity.badRequest()
                        .body("Room and dates are required.");
            }

            Room room =
                    roomRepository.findById(
                            updatedBooking.getRoomId()
                    ).orElse(null);

            if (room == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Room not found.");
            }

            LocalDate checkIn =
                    LocalDate.parse(updatedBooking.getCheckInDate());

            LocalDate checkOut =
                    LocalDate.parse(updatedBooking.getCheckOutDate());

            if (!checkOut.isAfter(checkIn)) {

                return ResponseEntity.badRequest()
                        .body("Check-out date must be after check-in date.");
            }

            // Check date overlap with other active bookings
            List<Booking> bookings =
                    bookingRepository.findByRoomId(room.getId());

            for (Booking booking : bookings) {

                // Ignore current booking
                if (booking.getId().equals(id)) {
                    continue;
                }

                // Ignore cancelled bookings
                if ("Cancelled".equalsIgnoreCase(booking.getStatus())) {
                    continue;
                }

                LocalDate existingCheckIn =
                        LocalDate.parse(booking.getCheckInDate());

                LocalDate existingCheckOut =
                        LocalDate.parse(booking.getCheckOutDate());

                boolean overlap =
                        checkIn.isBefore(existingCheckOut)
                        && checkOut.isAfter(existingCheckIn);

                if (overlap) {

                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("Room is already booked for selected dates.");
                }
            }

            long nights =
                    ChronoUnit.DAYS.between(checkIn, checkOut);

            double totalPrice =
                    room.getPrice() * nights;

            existingBooking.setRoomId(room.getId());
            existingBooking.setCheckInDate(
                    updatedBooking.getCheckInDate()
            );
            existingBooking.setCheckOutDate(
                    updatedBooking.getCheckOutDate()
            );
            existingBooking.setTotalPrice(totalPrice);
            existingBooking.setStatus("Confirmed");

            Booking savedBooking =
                    bookingRepository.save(existingBooking);

            return ResponseEntity.ok(
                    formatBooking(savedBooking)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("Unable to update booking: " + e.getMessage());
        }
    }

    // =========================================================
    // GET LOGGED-IN USER EMAIL FROM JWT
    // =========================================================

    private String getLoggedInEmail(
            HttpServletRequest request) {

        String authHeader =
                request.getHeader("Authorization");

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            return null;
        }

        String token =
                authHeader.substring(7).trim();

        try {

            return jwtService.extractEmail(token);

        } catch (Exception e) {

            return null;
        }
    }

    // =========================================================
    // FORMAT BOOKING RESPONSE FOR FRONTEND
    // =========================================================

    private Map<String, Object> formatBooking(
            Booking booking) {

        Room room =
                roomRepository.findById(
                        booking.getRoomId()
                ).orElse(null);

        Map<String, Object> roomData;

        if (room != null) {

            roomData = Map.of(
                    "_id", room.getId().toString(),
                    "roomType", room.getRoomType(),
                    "pricePerNight", room.getPrice(),
                    "images", List.of(room.getImage()),
                    "amenities",
                    room.getAmenities() != null
                            ? room.getAmenities()
                            : List.of(),
                    "isAvailable",
                    room.getIsAvailable() != null
                            ? room.getIsAvailable()
                            : true,
                    "hotel",
                    Map.of(
                            "name", room.getHotelName(),
                            "city", room.getLocation(),
                            "address", room.getLocation(),
                            "owner",
                            Map.of(
                                "image",
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
                            )
                    )
            );

        } else {

            roomData = Map.of(
                    "_id", booking.getRoomId().toString()
            );
        }

        return Map.of(
                "_id", booking.getId().toString(),
                "userId", booking.getUserId(),
                "roomId", booking.getRoomId(),
                "checkInDate", booking.getCheckInDate(),
                "checkOutDate", booking.getCheckOutDate(),
                "totalPrice", booking.getTotalPrice(),
                "status",
                booking.getStatus() != null
                        ? booking.getStatus()
                        : "Confirmed",
                "room", roomData
        );
    }
}