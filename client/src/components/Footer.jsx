import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
    const navigate = useNavigate();

    const handleAbout = (e) => {
        e.preventDefault();

        if (window.location.pathname !== "/") {
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
        <footer className="px-6 md:px-16 lg:px-24 xl:px-32 pt-8 w-full">

            <div className="flex flex-col md:flex-row justify-between gap-10 border-b border-gray-300 pb-6">

                <div>
                    <h1 className="text-2xl font-bold">
                        QuickStay
                    </h1>

                    <p className="text-gray-500 mt-3 max-w-md">
                        Discover and book your perfect stay with QuickStay.
                        Enjoy comfortable rooms and a simple booking experience.
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                        Company
                    </h3>

                    <div className="flex flex-col gap-2 text-gray-500">

                        <span
                            onClick={() => navigate("/")}
                            className="cursor-pointer hover:text-black"
                        >
                            Home
                        </span>

                        <span
                            onClick={() => navigate("/rooms")}
                            className="cursor-pointer hover:text-black"
                        >
                            Hotels
                        </span>

                        <a
                            href="#about"
                            onClick={handleAbout}
                            className="cursor-pointer hover:text-black"
                        >
                            About
                        </a>

                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                        Support
                    </h3>

                    <div className="flex flex-col gap-2 text-gray-500">
                        <a href="#" className="hover:text-black">
                            Help Center
                        </a>

                        <a href="#" className="hover:text-black">
                            Contact Us
                        </a>

                        <a href="#" className="hover:text-black">
                            Privacy Policy
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                        Newsletter
                    </h3>

                    <p className="text-gray-500 mb-3">
                        Subscribe for the latest updates and offers.
                    </p>

                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="px-3 py-2 outline-none min-w-0"
                        />

                        <button
                            className="bg-black text-white px-4 py-2"
                        >
                            Subscribe
                        </button>
                    </div>
                </div>

            </div>

            <div className="py-5 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} QuickStay. All rights reserved.
            </div>

        </footer>
    );
};

export default Footer;