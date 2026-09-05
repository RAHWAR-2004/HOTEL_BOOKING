import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:8080/api/users/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const text = await response.text();

            console.log("Status:", response.status);
            console.log("Response:", text);

            if (response.ok && text) {
                const data = JSON.parse(text);

                // Save JWT token separately
                localStorage.setItem("token", data.token);

                // Save only user information
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                // Tell Navbar that user has logged in
                window.dispatchEvent(new Event("userLogin"));

                alert("Login successful!");

                navigate("/");
            } else {
                alert("Invalid email or password!");
            }

        } catch (error) {
            console.error("Login Error:", error);
            alert("Backend server se connection nahi ho raha.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-md p-8 shadow-lg rounded-lg"
            >
                <h2 className="text-2xl font-semibold mb-6">
                    Login
                </h2>

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
                    Login
                </button>

                <p className="mt-4 text-center">
                    Don't have an account?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        className="cursor-pointer underline"
                    >
                        Register
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Login;