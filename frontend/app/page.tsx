"use client";

import Head from "next/head";
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Home() {

  interface FormData {
    name: string;
    place: string;
    time: string;
    day: string;
    month: string;
    year: string;
    timezone: string;
  }

  const [form, setForm] = useState<FormData>({
    name: "",
    place: "",
    time: "",
    day: "",
    month: "",
    year: "",
    timezone: "",
  });
  const [userId, setUserId] = useState("");

  const placeholders: { [key: string]: string } = {
    name: " Name: John Doe",
    place: "Country: India",
    time: "Time of birth: 14:30",
    day: "Day of birth: 14",
    month: "Month of birth: 08",
    year: "Year of birth: 1990",
    timezone: "Timezone (UTC): +05:30",
  };

  const registerUser = async () => {
    try {
      const res = await axios.post(`${API_BASE}/register_user`, form);
      setUserId(res.data.user_id);
      alert("User Registered! ID: " + res.data.user_id);
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  const starVariants = {
    animate: {
      opacity: [0.2, 1, 0.2],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut",
      },
    },
  };

  const stars = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3,
  }));

  return (
    <>
      <Head>
        <title>celestalAi.io</title>
        <meta name="description" content="Register for Vedic Astro Insights" />
      </Head>
      <motion.div
        className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              top: `${star.y}vh`,
              left: `${star.x}vw`,
              width: star.size,
              height: star.size,
              filter: "drop-shadow(0 0 3px white)",
            }}
            variants={starVariants}
            initial={{ opacity: 0.2 }}
            animate="animate"
            transition={{ delay: star.delay }}
          />
        ))}
      </motion.div>

      <motion.div
        className="min-h-screen bg-transparent text-white flex flex-col items-center justify-start px-6 py-12 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-5xl sm:text-6xl font-extrabold mb-12 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 select-none"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          CelestAi.io
        </motion.h1>

        <motion.h2
          className="text-lg sm:text-xl mb-8 font-light text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Register for Vedic Astro Insights
        </motion.h2>

        <motion.div
          className="w-full max-w-md space-y-4 bg-black bg-opacity-40 rounded-lg p-8 shadow-lg"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          
          {(Object.keys(form) as (keyof FormData)[]).map((key) => (
            <motion.input
              key={key}
              className="w-full bg-neutral-900 border border-neutral-700 placeholder-gray-400 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/80"
              placeholder={placeholders[key] || key}
              value={form[key]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, [key]: e.target.value })
              }
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            />
          ))}

          <motion.button
            onClick={registerUser}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded transition-shadow shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            Register
          </motion.button>
        </motion.div>

        {userId && (
          <motion.p
            className="mt-6 text-gray-300 font-mono text-sm select-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Your ID: {userId}
          </motion.p>
        )}
      </motion.div>
    </>
  );
}
