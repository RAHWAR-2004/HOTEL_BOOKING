package com.hotel.booking.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.hotel.booking.entity.User;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.security.JwtService;

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
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =========================
    // GET ALL USERS
    // =========================
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // =========================
    // REGISTER
    // =========================
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {

        if (user.getName() == null || user.getName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Name is required");
        }

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Email is required");
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Password is required");
        }

        String email = user.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Email already registered!");
        }

        user.setEmail(email);

        // Encrypt password using BCrypt
        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(savedUser);
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Email is required");
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Password is required");
        }

        String email = user.getEmail().trim().toLowerCase();

        User existingUser =
                userRepository.findByEmail(email).orElse(null);

        if (existingUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password!");
        }

        String databasePassword = existingUser.getPassword();
        String enteredPassword = user.getPassword();

        if (databasePassword == null || databasePassword.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password!");
        }

        boolean passwordMatches = false;

        // =========================
        // CHECK BCRYPT PASSWORD
        // =========================
        if (databasePassword.startsWith("$2")) {

            passwordMatches = passwordEncoder.matches(
                    enteredPassword,
                    databasePassword
            );
        }

        // =========================
        // CHECK OLD PLAIN-TEXT PASSWORD
        // =========================
        else {

            if (databasePassword.equals(enteredPassword)) {

                passwordMatches = true;

                // Convert old password to BCrypt
                existingUser.setPassword(
                        passwordEncoder.encode(enteredPassword)
                );

                userRepository.save(existingUser);
            }
        }

        // =========================
        // PASSWORD INVALID
        // =========================
        if (!passwordMatches) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password!");
        }

        // =========================
        // GENERATE JWT TOKEN
        // =========================
        String token =
                jwtService.generateToken(existingUser.getEmail());

        // =========================
        // SEND RESPONSE
        // =========================
        Map<String, Object> response = Map.of(
                "token", token,
                "user", existingUser
        );

        return ResponseEntity.ok(response);
    }
}