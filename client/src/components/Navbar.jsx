import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        const handleUserLogin = () => {
            const savedUser = localStorage.getItem("user");

            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        };

        window.addEventListener("userLogin", handleUserLogin);

        return () => {
            window.removeEventListener("userLogin", handleUserLogin);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
    };

    const handleExperience = () => {
        if (location.pathname !== "/") {
            navigate("/");

            setTimeout(() => {
                document.getElementById("experience")?.scrollIntoView({
                    behavior: "smooth",
                });
            }, 100);
        } else {
            document.getElementById("experience")?.scrollIntoView({
                behavior: "smooth",
            });
        }
    };

    const handleAbout = () => {
        if (location.pathname !== "/") {
            navigate("/");

            setTimeout(() => {
                document.getElementById("about")?.scrollIntoView({
                    behavior: "smooth",
                });
            }, 100);
        } else {
            document.getElementById("about")?.scrollIntoView({
                behavior: "smooth",
            });
        }
    };

    return (
        <nav className="w-full px-6 py-4 flex items-center justify-between bg-white shadow">

            {/* Logo */}
            <div
                className="text-2xl font-bold cursor-pointer"
                onClick={() => navigate("/")}
            >
                QuickStay
            </div>

            {/* Menu */}
            <div className="flex items-center gap-6">

                <span
                    className="cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    Home
                </span>

                <span
                    className="cursor-pointer"
                    onClick={() => navigate("/rooms")}
                >
                    Hotels
                </span>

                <span
                    className="cursor-pointer"
                    onClick={handleExperience}
                >
                    Experience
                </span>

                <span
                    className="cursor-pointer"
                    onClick={handleAbout}
                >
                    About
                </span>

                <button
                    onClick={() => navigate("/owner")}
                    className="border px-4 py-2 rounded-full"
                >
                    Dashboard
                </button>

                {user ? (
                    <>
                        <span className="font-semibold">
                            Hi, {user.name}
                        </span>

                        <button
                            onClick={() => navigate("/my-bookings")}
                            className="cursor-pointer"
                        >
                            My Bookings
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-black text-white px-5 py-2 rounded-full"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-black text-white px-6 py-3 rounded-full"
                    >
                        Login
                    </button>
                )}

            </div>
        </nav>
    );
};

export default Navbar;