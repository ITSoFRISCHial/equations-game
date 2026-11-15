"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

interface Equation {
  num1: number;
  num2: number;
  answer: number;
}

interface CountingEmoji {
  emoji: string;
  name: string;
}

const COUNTING_EMOJIS: CountingEmoji[] = [
  { emoji: "🍎", name: "apple" },
  { emoji: "🍌", name: "banana" },
  { emoji: "🍪", name: "cookie" },
  { emoji: "🍕", name: "pizza" },
  { emoji: "🧁", name: "cupcake" },
  { emoji: "🍦", name: "ice cream" },
  { emoji: "🐶", name: "dog" },
  { emoji: "🐱", name: "cat" },
  { emoji: "🐰", name: "rabbit" },
  { emoji: "🐟", name: "fish" },
  { emoji: "🧸", name: "teddy bear" },
  { emoji: "🎈", name: "balloon" },
  { emoji: "⚽", name: "soccer ball" },
  { emoji: "🚗", name: "car" },
  { emoji: "🚀", name: "rocket" },
  { emoji: "⭐", name: "star" },
  { emoji: "🌸", name: "flower" },
  { emoji: "🦄", name: "unicorn" },
  { emoji: "🐢", name: "turtle" },
  { emoji: "🦋", name: "butterfly" },
  { emoji: "🍓", name: "strawberry" },
  { emoji: "🎁", name: "gift" },
];

const RAINBOW_COLORS = [
  "#FF3B3B",
  "#FF9500",
  "#FFD60A",
  "#34C759",
  "#00C2FF",
  "#5E5CE6",
  "#BF5AF2",
];

const EQUATIONS_PER_ROUND = 5;

const TITLE_LETTERS = [
  { char: "T", color: "#FF3B3B" },
  { char: "i", color: "#FF9500" },
  { char: "m", color: "#FFD60A" },
  { char: "e", color: "#34C759" },
  { char: "s", color: "#00C2FF" },
  { char: "✕", color: "#BF5AF2" },
];

// Multiplication facts use factors 3..10 (no factors of 0, 1, or 2). The biggest
// allowed product is chosen on the start screen and adjustable by fives.
const MIN_FACTOR = 3;
const MAX_FACTOR = 10;
const DEFAULT_MAX_PRODUCT = 50;
const MIN_MAX_PRODUCT = 15; // keeps at least a handful of facts (3×3, 3×4, 3×5)
const CEILING_MAX_PRODUCT = 100; // 10×10, the largest possible with these factors
const PRODUCT_STEP = 5;

function buildFacts(maxProduct: number): Equation[] {
  const facts: Equation[] = [];
  for (let a = MIN_FACTOR; a <= MAX_FACTOR; a++) {
    for (let b = MIN_FACTOR; b <= MAX_FACTOR; b++) {
      if (a * b <= maxProduct) {
        facts.push({ num1: a, num2: b, answer: a * b });
      }
    }
  }
  return facts;
}

interface FloatingSymbol {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
}

function generateFloatingSymbols(count: number): FloatingSymbol[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 40 + 30,
    opacity: Math.random() * 0.15 + 0.05,
    speed: Math.random() * 0.5 + 0.2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 2,
  }));
}

function FloatingBackground() {
  const [symbols, setSymbols] = useState<FloatingSymbol[]>([]);

  useEffect(() => {
    setSymbols(generateFloatingSymbols(15));

    const interval = setInterval(() => {
      setSymbols((prev) =>
        prev.map((s) => ({
          ...s,
          y: s.y - s.speed,
          rotation: s.rotation + s.rotationSpeed,
          ...(s.y < -10 ? { y: 110, x: Math.random() * 100 } : {}),
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {symbols.map((s) => (
        <div
          key={s.id}
          className="absolute font-bold text-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: `${s.size}px`,
            opacity: s.opacity,
            transform: `rotate(${s.rotation}deg)`,
            transition: "top 0.05s linear",
          }}
        >
          ✕
        </div>
      ))}
    </div>
  );
}

function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [isForming, setIsForming] = useState(false);
  // Only render the scattered letters after mount so the randomized positions
  // never differ between the server render and the first client render.
  const [mounted, setMounted] = useState(false);

  const initialPositions = useMemo(
    () =>
      TITLE_LETTERS.map(() => ({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        rotation: Math.random() * 720 - 360,
        scale: Math.random() * 0.5 + 0.8,
      })),
    []
  );

  const finalPositions = useMemo(
    () =>
      TITLE_LETTERS.map((_, i) => ({
        x: 50 + (i - (TITLE_LETTERS.length - 1) / 2) * 8,
        y: 50,
        rotation: 0,
        scale: 1,
      })),
    []
  );

  useEffect(() => {
    setMounted(true);
    const formTimeout = setTimeout(() => setIsForming(true), 100);
    const completeTimeout = setTimeout(() => onComplete(), 3000);
    return () => {
      clearTimeout(formTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  const positions = isForming ? finalPositions : initialPositions;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <FloatingBackground />
      {mounted && TITLE_LETTERS.map((letter, index) => (
        <div
          key={index}
          className="absolute font-bold text-6xl md:text-8xl"
          style={{
            left: `${positions[index]?.x || 50}%`,
            top: `${positions[index]?.y || 50}%`,
            color: letter.color,
            transform: `translate(-50%, -50%) rotate(${positions[index]?.rotation || 0}deg) scale(${positions[index]?.scale || 1})`,
            transition: "all 2.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            textShadow: `0 0 20px ${letter.color}, 0 0 40px ${letter.color}`,
          }}
        >
          {letter.char}
        </div>
      ))}
    </div>
  );
}

function generateEquation(maxProduct: number): Equation {
  const facts = buildFacts(maxProduct);
  const base = facts[Math.floor(Math.random() * facts.length)];
  // Randomly swap the order so e.g. both 3×4 and 4×3 appear.
  return Math.random() > 0.5
    ? base
    : { num1: base.num2, num2: base.num1, answer: base.answer };
}

function generateAnswerChoices(correctAnswer: number, maxProduct: number): number[] {
  const choices = new Set<number>();
  choices.add(correctAnswer);

  while (choices.size < 5) {
    const offset = Math.floor(Math.random() * 13) - 6;
    const wrongAnswer = correctAnswer + offset;

    if (wrongAnswer >= 4 && wrongAnswer <= maxProduct && wrongAnswer !== correctAnswer) {
      choices.add(wrongAnswer);
    }
  }

  return Array.from(choices).sort(() => Math.random() - 0.5);
}

function getRandomEmoji(): CountingEmoji {
  return COUNTING_EMOJIS[Math.floor(Math.random() * COUNTING_EMOJIS.length)];
}

function pluralize(name: string, count: number): string {
  if (count === 1) return name;
  if (name.endsWith("s") || name.endsWith("sh") || name.endsWith("ch")) {
    return name + "es";
  }
  if (name.endsWith("y") && !["a", "e", "i", "o", "u"].includes(name[name.length - 2])) {
    return name.slice(0, -1) + "ies";
  }
  return name + "s";
}

/** A single group box holding `count` emoji. */
function EmojiGroup({ count, emoji }: { count: number; emoji: string }) {
  // Lay out the emoji in a tidy square-ish grid inside the group.
  const perRow = count <= 3 ? count : count <= 6 ? 3 : Math.ceil(Math.sqrt(count));
  const rows: number[] = [];
  let remaining = count;
  while (remaining > 0) {
    const rowCount = Math.min(remaining, perRow);
    rows.push(rowCount);
    remaining -= rowCount;
  }

  return (
    <div className="flex flex-col items-center gap-0.5 bg-white/70 rounded-xl p-1.5 shadow-sm border-2 border-white">
      {rows.map((rowCount, i) => (
        <div key={i} className="flex gap-0.5">
          {Array.from({ length: rowCount }).map((_, j) => (
            <span key={j} className="text-base sm:text-lg md:text-xl leading-none">
              {emoji}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Multiplication as `num1` groups of `num2` emoji. */
function EmojiEquationDisplay({
  equation,
  currentEmoji,
}: {
  equation: Equation;
  currentEmoji: CountingEmoji;
}) {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="text-sm sm:text-base font-bold text-gray-500">
        {equation.num1} groups of {equation.num2}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-full">
        {Array.from({ length: equation.num1 }).map((_, i) => (
          <EmojiGroup key={i} count={equation.num2} emoji={currentEmoji.emoji} />
        ))}
      </div>
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mt-1">
        {equation.num1} <span className="text-purple-500">✕</span> {equation.num2} = ?
      </div>
    </div>
  );
}

function TextEquationDisplay({ equation }: { equation: Equation }) {
  return (
    <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-800">
      {equation.num1} <span className="text-purple-500">✕</span> {equation.num2} = ?
    </div>
  );
}

function PlayButton({
  equation,
  isEmojiMode,
  currentEmoji,
}: {
  equation: Equation;
  isEmojiMode: boolean;
  currentEmoji: CountingEmoji;
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    let text: string;
    if (isEmojiMode) {
      const singular = currentEmoji.name;
      const pluralName = pluralize(currentEmoji.name, equation.num2);
      text = `If I have ${equation.num1} groups of ${equation.num2} ${pluralName}, how many ${equation.num2 === 1 ? singular : pluralName} are there in all?`;
    } else {
      text = `What is ${equation.num1} times ${equation.num2}?`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [equation, isEmojiMode, currentEmoji]);

  return (
    <button
      onClick={speak}
      disabled={isSpeaking}
      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
        isSpeaking ? "bg-purple-300 scale-110" : "bg-purple-500 hover:bg-purple-600 hover:scale-110"
      } shadow-lg`}
      aria-label="Read question aloud"
    >
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
}

function ModeToggle({
  isEmojiMode,
  onToggle,
}: {
  isEmojiMode: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors text-sm"
      aria-label="Switch between numbers and pictures"
    >
      <span className={!isEmojiMode ? "font-bold" : "text-gray-500"}>123</span>
      <div
        className={`w-10 h-5 rounded-full relative transition-colors ${
          isEmojiMode ? "bg-purple-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            isEmojiMode ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
      <span className={isEmojiMode ? "font-bold" : "text-gray-500"}>🍎</span>
    </button>
  );
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  isNumber?: boolean;
}

function Fireworks({ number, onComplete }: { number: number; onComplete: () => void }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const fw = { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20 };
        const newParticles: Particle[] = [];
        for (let j = 0; j < 30; j++) {
          const angle = (Math.PI * 2 * j) / 30;
          const speed = Math.random() * 5 + 3;
          newParticles.push({
            id: Date.now() + i * 100 + j,
            x: fw.x,
            y: fw.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)],
            size: Math.random() * 8 + 4,
            opacity: 1,
            isNumber: j % 5 === 0,
          });
        }
        setParticles((prev) => [...prev, ...newParticles]);
      }, i * 200);
    }

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.5,
            y: p.y + p.vy * 0.5,
            vy: p.vy + 0.1,
            opacity: p.opacity - 0.02,
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 30);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      onComplete();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute font-bold flex items-center justify-center"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.isNumber ? "40px" : `${p.size}px`,
            height: p.isNumber ? "40px" : `${p.size}px`,
            backgroundColor: p.isNumber ? "transparent" : p.color,
            borderRadius: "50%",
            opacity: p.opacity,
            transform: "translate(-50%, -50%)",
            boxShadow: p.isNumber ? "none" : `0 0 ${p.size}px ${p.color}`,
            fontSize: p.isNumber ? "24px" : "0",
            color: p.color,
            textShadow: p.isNumber ? `0 0 10px ${p.color}, 0 0 20px ${p.color}` : "none",
          }}
        >
          {p.isNumber ? number : ""}
        </div>
      ))}
    </div>
  );
}

function RainbowTitle() {
  return (
    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 text-center drop-shadow-lg">
      {TITLE_LETTERS.map((letter, index) => (
        <span key={index} style={{ color: letter.color }}>
          {letter.char}
        </span>
      ))}
    </h1>
  );
}

export default function TimesGame() {
  const [gameState, setGameState] = useState<"intro" | "start" | "playing" | "feedback" | "roundEnd">("intro");
  const [equation, setEquation] = useState<Equation | null>(null);
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [questionNumber, setQuestionNumber] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [isEmojiMode, setIsEmojiMode] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState<CountingEmoji>(COUNTING_EMOJIS[0]);
  const [maxProduct, setMaxProduct] = useState(DEFAULT_MAX_PRODUCT);

  const handleIntroComplete = useCallback(() => setGameState("start"), []);

  const startNewQuestion = useCallback(() => {
    const newEquation = generateEquation(maxProduct);
    setEquation(newEquation);
    setChoices(generateAnswerChoices(newEquation.answer, maxProduct));
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentEmoji(getRandomEmoji());
    setGameState("playing");
  }, [maxProduct]);

  const adjustMaxProduct = (delta: number) => {
    setMaxProduct((prev) =>
      Math.min(CEILING_MAX_PRODUCT, Math.max(MIN_MAX_PRODUCT, prev + delta))
    );
  };

  const startGame = () => {
    setScore({ correct: 0, wrong: 0 });
    setQuestionNumber(1);
    startNewQuestion();
  };

  const handleAnswer = (answer: number) => {
    if (gameState !== "playing" || !equation) return;

    setSelectedAnswer(answer);
    const correct = answer === equation.answer;
    setIsCorrect(correct);
    setGameState("feedback");

    if (correct) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setShowFireworks(true);
    } else {
      setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    }
  };

  const handleFireworksComplete = () => setShowFireworks(false);

  const nextQuestion = () => {
    if (questionNumber >= EQUATIONS_PER_ROUND) {
      setGameState("roundEnd");
    } else {
      setQuestionNumber((prev) => prev + 1);
      startNewQuestion();
    }
  };

  const toggleMode = () => setIsEmojiMode((prev) => !prev);

  const getButtonColor = (index: number, choice: number) => {
    if (gameState === "feedback" && equation) {
      if (choice === equation.answer) {
        return "bg-green-500 hover:bg-green-500 scale-110 animate-bounce";
      }
      if (choice === selectedAnswer && !isCorrect) {
        return "bg-red-500 hover:bg-red-500";
      }
      if (!isCorrect) {
        return "bg-gray-400 hover:bg-gray-400 opacity-50";
      }
    }
    const colors = [
      "bg-red-500 hover:bg-red-600",
      "bg-orange-500 hover:bg-orange-600",
      "bg-yellow-500 hover:bg-yellow-600",
      "bg-green-500 hover:bg-green-600",
      "bg-blue-500 hover:bg-blue-600",
    ];
    return colors[index];
  };

  const showFloatingBackground = gameState === "start" || gameState === "roundEnd";

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex flex-col items-center justify-center p-2 sm:p-4 relative">
      {gameState === "intro" && <IntroAnimation onComplete={handleIntroComplete} />}

      {showFloatingBackground && <FloatingBackground />}

      {showFireworks && equation && (
        <Fireworks number={equation.answer} onComplete={handleFireworksComplete} />
      )}

      {gameState !== "intro" && <RainbowTitle />}

      {gameState === "start" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative z-10 max-w-sm sm:max-w-md">
          <div className="text-5xl mb-3">✖️</div>
          <p className="text-xl sm:text-2xl mb-3 text-gray-700 font-bold">Ready to play?</p>
          <p className="text-base sm:text-lg mb-4 text-gray-500">
            Answer {EQUATIONS_PER_ROUND} times questions! Tap 🍎 to see the pictures or 🔊 to hear it.
          </p>

          {/* Biggest-answer stepper */}
          <div className="mb-5 sm:mb-6">
            <p className="text-sm sm:text-base font-bold text-gray-600 mb-2">Biggest answer</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => adjustMaxProduct(-PRODUCT_STEP)}
                disabled={maxProduct <= MIN_MAX_PRODUCT}
                aria-label="Make the biggest answer smaller"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white text-3xl font-bold shadow-lg transform hover:scale-110 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                −
              </button>
              <div className="min-w-[72px] text-4xl sm:text-5xl font-bold text-purple-600 tabular-nums">
                {maxProduct}
              </div>
              <button
                onClick={() => adjustMaxProduct(PRODUCT_STEP)}
                disabled={maxProduct >= CEILING_MAX_PRODUCT}
                aria-label="Make the biggest answer bigger"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white text-3xl font-bold shadow-lg transform hover:scale-110 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-2xl sm:text-3xl font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-full transform hover:scale-110 transition-transform shadow-lg"
          >
            Start!
          </button>
        </div>
      )}

      {(gameState === "playing" || gameState === "feedback") && equation && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-2xl text-center w-full max-w-xs sm:max-w-md md:max-w-lg relative z-10 flex flex-col">
          <div className="flex items-center justify-between mb-2 sm:mb-4 gap-2">
            <span className="text-green-600 font-bold text-sm sm:text-lg">✓ {score.correct}</span>
            <div className="flex items-center gap-2">
              <ModeToggle isEmojiMode={isEmojiMode} onToggle={toggleMode} />
              <PlayButton equation={equation} isEmojiMode={isEmojiMode} currentEmoji={currentEmoji} />
            </div>
            <span className="text-red-600 font-bold text-sm sm:text-lg">✗ {score.wrong}</span>
          </div>

          <div className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
            Question {questionNumber} of {EQUATIONS_PER_ROUND}
          </div>

          <div className="mb-4 sm:mb-6 md:mb-8 flex items-center justify-center min-h-[80px] sm:min-h-[120px]">
            {isEmojiMode ? (
              <EmojiEquationDisplay equation={equation} currentEmoji={currentEmoji} />
            ) : (
              <TextEquationDisplay equation={equation} />
            )}
          </div>

          <div className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-4 mb-3 sm:mb-6">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(choice)}
                disabled={gameState === "feedback"}
                className={`${getButtonColor(index, choice)} text-white text-lg sm:text-2xl md:text-3xl font-bold py-2 sm:py-4 px-1 sm:px-2 md:px-6 rounded-lg sm:rounded-xl transform transition-all duration-200 ${
                  gameState === "playing" ? "hover:scale-110 active:scale-95" : ""
                } shadow-lg disabled:cursor-not-allowed`}
              >
                {choice}
              </button>
            ))}
          </div>

          {gameState === "feedback" && (
            <div className="mt-2 sm:mt-4">
              {isCorrect ? (
                <div className="text-xl sm:text-3xl font-bold text-green-600 animate-bounce">
                  Correct!
                </div>
              ) : (
                <div className="text-lg sm:text-2xl font-bold text-red-600">
                  The answer was {equation.answer}
                </div>
              )}
              {!showFireworks && (
                <button
                  onClick={nextQuestion}
                  className="mt-2 sm:mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-base sm:text-xl font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full transform hover:scale-110 transition-transform shadow-lg"
                >
                  {questionNumber >= EQUATIONS_PER_ROUND ? "See Results" : "Next Question"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {gameState === "roundEnd" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative z-10 max-w-sm sm:max-w-md">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-800">Round Complete!</h2>
          <div className="text-4xl sm:text-6xl mb-4">
            {score.correct === EQUATIONS_PER_ROUND ? "⭐" : score.correct >= 3 ? "👏" : "💪"}
          </div>
          <div className="text-xl sm:text-2xl mb-4">
            <span className="text-green-600 font-bold">{score.correct} correct</span> &{" "}
            <span className="text-red-600 font-bold">{score.wrong} wrong</span>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6">
            {score.correct === EQUATIONS_PER_ROUND
              ? "Perfect! You're a times superstar!"
              : score.correct >= 3
              ? "Great job! Keep practicing!"
              : "Good try! Let's practice more!"}
          </p>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl sm:text-2xl font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full transform hover:scale-110 transition-transform shadow-lg"
          >
            Play Again!
          </button>
        </div>
      )}
    </div>
  );
}
