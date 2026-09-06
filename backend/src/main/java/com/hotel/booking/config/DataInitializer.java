package com.hotel.booking.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.hotel.booking.entity.Room;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Component
public class DataInitializer implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {

        Long roomCount = entityManager
                .createQuery("SELECT COUNT(r) FROM Room r", Long.class)
                .getSingleResult();

        if (roomCount > 0) {
            return;
        }

        Room room1 = new Room(
                "Grand Palace Hotel",
                "Delhi",
                "Luxury Room",
                3500.0,
                "https://images.unsplash.com/photo-1566665797739-1674de7a421a"
        );
        room1.setAmenities(List.of(
                "Free WiFi",
                "Free Breakfast",
                "Room Service",
                "Swimming Pool",
                "Parking"
        ));

        Room room2 = new Room(
                "Goa Beach Resort",
                "Goa",
                "Double Bed",
                2800.0,
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
        );
        room2.setAmenities(List.of(
                "Free WiFi",
                "Swimming Pool",
                "Parking",
                "Room Service"
        ));

        Room room3 = new Room(
                "Mumbai Central Hotel",
                "Mumbai",
                "Luxury Room",
                3200.0,
                "https://images.unsplash.com/photo-1590490360182-c33d57733427"
        );
        room3.setAmenities(List.of(
                "Free WiFi",
                "Free Breakfast",
                "Gym",
                "Room Service"
        ));

        Room room4 = new Room(
                "Bangalore Comfort Inn",
                "Bangalore",
                "Single Bed",
                1800.0,
                "https://images.unsplash.com/photo-1611892440504-42a792e24d32"
        );
        room4.setAmenities(List.of(
                "Free WiFi",
                "Parking",
                "Room Service"
        ));

        Room room5 = new Room(
                "Jaipur Royal Stay",
                "Jaipur",
                "Family Suite",
                4200.0,
                "https://images.unsplash.com/photo-1584132967334-10e028bd69f7"
        );
        room5.setAmenities(List.of(
                "Free WiFi",
                "Free Breakfast",
                "Swimming Pool",
                "Parking",
                "Room Service"
        ));

        Room room6 = new Room(
                "Kolkata Heritage Hotel",
                "Kolkata",
                "Double Bed",
                3000.0,
                "https://images.unsplash.com/photo-1566073771259-6a8506099945"
        );
        room6.setAmenities(List.of(
                "Free WiFi",
                "Free Breakfast",
                "Parking",
                "Room Service"
        ));

        Room room7 = new Room(
                "Manali Mountain View",
                "Manali",
                "Luxury Room",
                2500.0,
                "https://images.unsplash.com/photo-1601918774946-25832a4be0d6"
        );
        room7.setAmenities(List.of(
                "Free WiFi",
                "Free Breakfast",
                "Parking",
                "Room Service"
        ));

        entityManager.persist(room1);
        entityManager.persist(room2);
        entityManager.persist(room3);
        entityManager.persist(room4);
        entityManager.persist(room5);
        entityManager.persist(room6);
        entityManager.persist(room7);

        entityManager.flush();

        System.out.println("======================================");
        System.out.println("7 ROOMS ADDED SUCCESSFULLY!");
        System.out.println("======================================");
    }
}