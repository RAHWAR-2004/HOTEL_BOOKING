import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:8080/api/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                }
            );

            const data = await response.text();

            console.log("Status:", response.status);
            console.log("Response:", data);

            if (response.ok) {
                alert("Registration successful!");

                // Clear form
                setName("");
                setEmail("");
                setPassword("");

                // Go to Login page
                navigate("/login");
            } else if (response.status === 409) {
                alert("Email already registered!");
            } else {
                alert("Registration failed!");
            }

        } catch (error) {
            console.error("Registration Error:", error);

            alert(
                "Backend server se connection nahi ho raha."
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">

            <form
                onSubmit={handleRegister}
                className="w-full max-w-md p-8 shadow-lg rounded-lg"
            >

                <h2 className="text-2xl font-semibold mb-6">
                    Create Account
                </h2>

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border p-3 mb-4 rounded"
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-3 mb-4 rounded"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-3 mb-4 rounded"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-black text-white p-3 rounded"
                >
                    Register
                </button>

                <p className="mt-4 text-center">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="cursor-pointer underline"
                    >
                        Login
                    </span>
                </p>

            </form>

        </div>
    );
};

export default Register;