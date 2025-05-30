"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

interface User {
  id: string;
  name: string;
  place: string;
  time: string;
  day: string;
  month: string;
  year: string;
  timezone: string;
}

interface Prediction {
  Info: string;
  Name: string;
  Nature: string;
}

export default function Dashboard() {
  const [userId, setUserId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [svgChart, setSvgChart] = useState<string | null>(null);
  const [dailyHoroscope, setDailyHoroscope] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [compatibility, setCompatibility] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const fetchUser = async () => {
    if (!userId) return alert("Please enter your User ID");
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/get_user/${userId}`);
      setUser(res.data);
      setSvgChart(null);
      setDailyHoroscope("");
      setAnswer("");
      setCompatibility(null);
    } catch {
      alert("User not found or API error");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const generateChart = async () => {
    if (!userId) return alert("Enter User ID and fetch user first");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/generate_chart/${userId}`,
        null,
        { responseType: "text" }
      );
      setSvgChart(res.data);
    } catch {
      alert("Error generating chart");
    } finally {
      setLoading(false);
    }
  };

  const getDailyHoroscope = async () => {
    if (!userId) return alert("Enter User ID and fetch user first");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/daily_horoscope/${userId}`);
      setDailyHoroscope(res.data.daily_horoscope);
    } catch {
      alert("Error fetching horoscope");
    } finally {
      setLoading(false);
    }
  };

  const askAstrologer = async () => {
    if (!userId) return alert("Enter User ID and fetch user first");
    if (!question) return alert("Please enter your question");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ask_astrologer/${userId}`, {
        question,
      });
      setAnswer(res.data.answer);
    } catch {
      alert("Error asking astrologer");
    } finally {
      setLoading(false);
    }
  };

  const checkCompatibility = async () => {
    if (!userId || !partnerId) {
      alert("Please enter both User IDs");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/match_compatibility`, {
        user1_id: userId,
        user2_id: partnerId,
      });
      const parsed = JSON.parse(res.data.match_report);
      const report = parsed.Payload.MatchReport as {
        KutaScore: number;
        PredictionList: Prediction[];
      };

      const filtered = report.PredictionList.filter(
        (p) => p.Info.trim() !== ""
      );

      const summary =
        `Compatibility Report\n\n` +
        `Kuta Score: ${report.KutaScore}/36\n\n` +
        `Aspects Breakdown:\n` +
        filtered
          .map((p) => `${p.Name} (${p.Nature})\nInfo: ${p.Info}`)
          .join("\n\n");

      setCompatibility(summary);
    } catch (err) {
      console.error(err);
      alert("Error checking compatibility");
      setCompatibility(null);
    } finally {
      setLoading(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto mt-10 p-6 bg-[#0b0b0b] rounded-xl shadow-lg shadow-[#0f141a] font-sans text-gray-300"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <h1 className="text-4xl font-extrabold mb-6 text-center tracking-wide text-white drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">
        Dashboard - Vedic Insights
      </h1>

      <div className="mb-6">
        <input
          placeholder="Enter your User ID"
          className="w-full p-3 rounded-md bg-[#121212] border border-gray-700 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 transition"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button
          onClick={fetchUser}
          disabled={loading}
          className="mt-3 w-full bg-gradient-to-r from-cyan-700 to-cyan-500 hover:from-cyan-600 hover:to-cyan-400 text-white font-semibold py-3 rounded-md shadow-lg shadow-cyan-700/50 transition disabled:opacity-50"
        >
          Fetch User
        </button>
      </div>

      {user && (
        <div className="space-y-5">
          <p className="text-lg">
            <span className="font-semibold text-cyan-400">Name:</span> {user.name}
          </p>
          <p className="text-lg">
            <span className="font-semibold text-cyan-400">Birth Details:</span>{" "}
            {user.day}/{user.month}/{user.year} at {user.time} ({user.timezone})
          </p>
          <p className="text-lg">
            <span className="font-semibold text-cyan-400">Place:</span> {user.place}
          </p>

          <div className="mt-6 p-4 bg-[#121212] rounded-md border border-gray-700 shadow-inner shadow-cyan-900/30">
            <h2 className="font-semibold text-cyan-400 mb-3 text-xl">
              Match Compatibility
            </h2>
            <input
              placeholder="Enter partner User ID"
              className="w-full p-2 rounded-md bg-[#0f0f0f] border border-gray-700 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 transition mb-3"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
            />
            <button
              onClick={checkCompatibility}
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2 rounded-md shadow-md shadow-cyan-600/30 transition disabled:opacity-50"
            >
              Check Compatibility
            </button>
            {compatibility && (
              <p className="mt-3 text-gray-300 whitespace-pre-wrap">{compatibility}</p>
            )}
          </div>

          <div className="flex gap-4 flex-wrap mt-6">
            <button
              onClick={generateChart}
              disabled={loading}
              className="flex-1 min-w-[120px] bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 rounded-md shadow-md shadow-cyan-600/30 transition disabled:opacity-50"
            >
              Generate Chart
            </button>

            <button
              onClick={getDailyHoroscope}
              disabled={loading}
              className="flex-1 min-w-[120px] bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 rounded-md shadow-md shadow-cyan-600/30 transition disabled:opacity-50"
            >
              Daily Horoscope
            </button>
          </div>

          {svgChart && (
            <div
              className="mt-6 bg-[#121212] rounded-lg border border-gray-700 overflow-auto"
              style={{ maxHeight: 280 }}
              dangerouslySetInnerHTML={{ __html: svgChart }}
            />
          )}

          {dailyHoroscope && (
            <div className="mt-6 bg-[#121212] p-5 rounded-lg border border-gray-700 whitespace-pre-wrap shadow-inner shadow-cyan-900/30">
              <h2 className="font-semibold text-cyan-400 mb-3 text-xl">Daily Horoscope</h2>
              <p>{dailyHoroscope}</p>
            </div>
          )}

          <div className="mt-10">
            <h3 className="font-semibold text-cyan-400 mb-3 text-2xl">Ask the Astrologer</h3>
            <textarea
              rows={4}
              placeholder="Type your question here..."
              className="w-full p-3 rounded-md bg-[#121212] border border-gray-700 text-gray-300 placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 transition"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              onClick={askAstrologer}
              disabled={loading}
              className="mt-4 w-full bg-gradient-to-r from-cyan-700 to-cyan-500 hover:from-cyan-600 hover:to-cyan-400 text-white font-semibold py-3 rounded-md shadow-lg shadow-cyan-700/50 transition disabled:opacity-50"
            >
              Ask
            </button>

            {answer && (
              <div className="mt-6 bg-[#121212] p-5 rounded-lg border border-gray-700 whitespace-pre-wrap shadow-inner shadow-cyan-900/40">
                <h4 className="font-semibold text-cyan-300 mb-2 text-xl">Answer:</h4>
                <p>{answer}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
