"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type AppState = "LANDING" | "CALIBRATING" | "THE_GRASS" | "INTROSPECTION" | "VALIDATION";

const PROMPTS = [
  "Who do you miss but pretend you don’t?",
  "What was the last time you felt normal?",
  "Name one person you should text but won’t.",
  "Be honest. Are you cooked?",
  "What version of you do you think about at night?",
  "Do you think they remember you?"
];

const RESPONSES = [
  "Damn.",
  "Yeah.",
  "That tracks.",
  "Fair enough.",
  "Oof.",
  "Whatever.",
  "Sure."
];

const CALIBRATION_MESSAGES = [
  "Calibrating your emotional state…",
  "Grabbing coffee…",
  "Pretending to work…",
  "Judging your browsing history…",
  "Almost there (that's a lie)…",
  "Forgot what I was doing…",
  "Realigning chakras…",
  "Buffering emotional damage…",
  "Do you really have nothing better to do?"
];

export default function Home() {
  const [state, setState] = useState<AppState>("LANDING");
  const [progress, setProgress] = useState(0);
  const [calibrationText, setCalibrationText] = useState(CALIBRATION_MESSAGES[0]);
  const [timer, setTimer] = useState(45);
  const [grassMessage, setGrassMessage] = useState("Look at this grass.");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [selectedResponse, setSelectedResponse] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Interaction State for Grass
  const [isTouchingGrass, setIsTouchingGrass] = useState(false);
  const [isTabFocused, setIsTabFocused] = useState(true);
  const [isMouseMovingTooMuch, setIsMouseMovingTooMuch] = useState(false);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mouseMoveCountRef = useRef(0);

  // Mobile Detection
  useEffect(() => {
    // Simple check for coarse pointer (touch device)
    const mediaCheck = window.matchMedia("(pointer: coarse)");
    setIsMobile(mediaCheck.matches);

    // Set timer based on device (default 45s, mobile 15s)
    if (mediaCheck.matches) {
      setTimer(15);
    }
  }, []);

  // --- CALIBRATION LOGIC ---
  useEffect(() => {
    if (state === "CALIBRATING") {
      let ticks = 0;
      let hasJumped = false;
      const ticksPerMessage = 15; // 1.5s per message
      let maxMessageIndex = -1; // Tracks max index reached to prevent cycling back

      const interval = setInterval(() => {
        ticks++;

        // Calculate message index based on ticks
        const messageIndex = Math.floor(ticks / ticksPerMessage);

        // Only update message if we are advancing past previous messages
        // This ensures "Wait, nevermind..." sticks until we catch up
        if (messageIndex > maxMessageIndex && messageIndex < CALIBRATION_MESSAGES.length) {
          maxMessageIndex = messageIndex;
          setCalibrationText(CALIBRATION_MESSAGES[messageIndex]);
        }

        // Deterministic Progress Curve
        const totalExpectedTicks = CALIBRATION_MESSAGES.length * ticksPerMessage;

        // Linear-ish progress calculation
        let targetProgress = (ticks / totalExpectedTicks) * 100;

        // The Jump Event at ~85%
        if (targetProgress > 85 && !hasJumped) {
          hasJumped = true;
          setCalibrationText("Wait, nevermind…");
          // Rewind ticks. maxMessageIndex prevents old messages from showing.
          ticks = Math.floor(0.65 * totalExpectedTicks);
        }

        // Re-calculate progress after potential tick adjustment
        targetProgress = (ticks / totalExpectedTicks) * 100;

        if (targetProgress >= 100) {
          if (hasJumped) {
            clearInterval(interval);
            setProgress(100);
            setCalibrationText("Yeah okay close enough.");
            setTimeout(() => setState("THE_GRASS"), 1500);
            return;
          }
        }

        // Cap visual progress
        setProgress(Math.min(Math.max(0, targetProgress), 99));

      }, 100); // 100ms updates

      return () => clearInterval(interval);
    }
  }, [state]);


  // --- GRASS LOGIC: TAB FOCUS ---
  useEffect(() => {
    if (state !== "THE_GRASS") return;

    const handleBlur = () => {
      setIsTabFocused(false);
      setGrassMessage("Don’t cheat.");
    };

    const handleFocus = () => {
      setIsTabFocused(true);
      setGrassMessage("Look at this grass.");
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    // Initial check
    setIsTabFocused(document.hasFocus());

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [state]);

  // --- GRASS LOGIC: MOUSE MOVEMENT ---
  useEffect(() => {
    if (state !== "THE_GRASS") return;

    const handleMouseMove = () => {
      mouseMoveCountRef.current++;

      if (mouseMoveCountRef.current > 40) { // Threshold
        setIsMouseMovingTooMuch(true);
        setGrassMessage("Relax.");
      }
    };

    // Reset movement counter periodically
    const resetInterval = setInterval(() => {
      mouseMoveCountRef.current = 0;
      setIsMouseMovingTooMuch(false);
    }, 1000);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(resetInterval);
    };
  }, [state]);

  // --- GRASS LOGIC: TIMER LOOP ---
  useEffect(() => {
    if (state !== "THE_GRASS") return;

    timerRef.current = setInterval(() => {
      // Determine if valid
      let isValid = isTabFocused && !isMouseMovingTooMuch && isTouchingGrass;

      // Update Message based on priority failure
      if (!isTabFocused) {
        setGrassMessage("Don’t cheat.");
      } else if (isMouseMovingTooMuch) {
        setGrassMessage("Relax.");
      } else if (!isTouchingGrass) {
        setGrassMessage(isMobile ? "Hold the grass." : "Touch the grass.");
      } else {
        setGrassMessage("Look at this grass.");
      }

      if (isValid) {
        setTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setupIntrospection();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, isTabFocused, isMouseMovingTooMuch, isTouchingGrass, isMobile]);


  const setupIntrospection = () => {
    const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setSelectedPrompt(randomPrompt);
    setState("INTROSPECTION");
  };

  const handleIntrospectionSubmit = () => {
    const randomResponse = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
    setSelectedResponse(randomResponse);
    setState("VALIDATION");
  };

  const reset = () => {
    window.location.reload();
  };

  // --- RENDER ---

  if (state === "LANDING") {
    // RAW HTML Mode
    return (
      <div>
        <h1>Touch Grass Simulator</h1>
        <p>“An app for people who refuse to go outside.”</p>
        <br />
        <button onClick={() => setState("CALIBRATING")}>Begin Healing</button>
      </div>
    );
  }

  // APP MODE
  return (
    <main className="app-mode">
      {state === "CALIBRATING" && (
        <div className="screen">
          <p>{calibrationText}</p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {state === "THE_GRASS" && (
        <div className="screen">
          <div
            className="grass-container"
            onMouseEnter={() => !isMobile && setIsTouchingGrass(true)}
            onMouseLeave={() => !isMobile && setIsTouchingGrass(false)}
            onTouchStart={() => setIsTouchingGrass(true)}
            onTouchEnd={() => setIsTouchingGrass(false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src="/grass.jpg"
              alt="Grass"
              width={640}
              height={480}
              draggable={false}
            />
          </div>
          <p>{grassMessage}</p>
          <p style={{ fontSize: "1rem", marginTop: "1rem" }}>{timer}s</p>
        </div>
      )}

      {state === "INTROSPECTION" && (
        <div className="screen">
          <p>{selectedPrompt}</p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          <button onClick={handleIntrospectionSubmit}>I’m Done Thinking</button>
        </div>
      )}

      {state === "VALIDATION" && (
        <div className="screen">
          <p style={{ marginBottom: "1rem" }}>{selectedResponse}</p>
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Session Complete 🌱</p>
          <p style={{ fontSize: "1rem" }}>You are now 0.7% more grounded.</p>
          <button onClick={reset}>Leave</button>
        </div>
      )}
    </main>
  );
}
