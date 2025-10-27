import { useState } from "react";
import Chatbot from "./Chatbot";
import { useTheme } from "next-themes";

const TopRightControls = () => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="top-right-controls fixed top-4 right-4 z-40 flex items-center gap-3">
      {/* AI Chatbot button (left of toggle) */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI Chatbot"
        className="ai-btn p-2 rounded-full bg-gray-900 text-white shadow-lg"
      >
        AI
      </button>

      {/* Theme toggle: simple slider using checkbox and next-themes */}
      <div className="toggle-cont">
        <input
          className="toggle-input"
          id="theme-toggle"
          name="toggle"
          type="checkbox"
          checked={theme === "dark"}
          onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
        />
        <label className="toggle-label" htmlFor="theme-toggle">
          <div className="cont-icon" />
        </label>
      </div>

      <Chatbot open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default TopRightControls;
