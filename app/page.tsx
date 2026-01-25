"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

interface Equation {
  num1: number;
  num2: number;
  operator: "+" | "-";
  answer: number;
}

const RAINBOW_COLORS = [
  "#FF0000", // Red
  "#FF7F00", // Orange
  "#FFFF00", // Yellow
  "#00FF00", // Green
  "#0000FF", // Blue
  "#4B0082", // Indigo
  "#9400D3", // Violet
];

const EQUATIONS_PER_ROUND = 3;

// Letters for "EQUATIONS" with + as the t
const TITLE_LETTERS = [
  { char: "E", color: "#FF0000" },
  { char: "q", color: "#FF7F00" },
  { char: "u", color: "#FFFF00" },
  { char: "a", color: "#00FF00" },
  { char: "+", color: "#0000FF" }, // t is a plus sign
  { char: "i", color: "#4B0082" },
  { char: "o", color: "#9400D3" },
  { char: "n", color: "#FF0000" },
  { char: "s", color: "#FF7F00" },
];

interface FloatingSymbol {
  id: number;
  x: number;
  y: number;
  symbol: "+" | "-";
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
    symbol: Math.random() > 0.5 ? "+" : "-",
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
          // Reset to bottom when reaching top
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
          {s.symbol}
        </div>
      ))}
    </div>
  );
}

function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [isForming, setIsForming] = useState(false);

  // Generate random starting positions for each letter
  const initialPositions = useMemo(() =>
    TITLE_LETTERS.map(() => ({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.5 + 0.8,
    })),
    []
  );

  // Final positions (centered, in a row)
  const finalPositions = useMemo(() =>
    TITLE_LETTERS.map((_, i) => ({
      x: 50 + (i - 4) * 6,
      y: 50,
      rotation: 0,
      scale: 1,
    })),
    []
  );

  useEffect(() => {
    // Start forming animation after a brief moment
    const formTimeout = setTimeout(() => {
      setIsForming(true);
    }, 100);

    // Complete after 3 seconds
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(formTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  const positions = isForming ? finalPositions : initialPositions;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <FloatingBackground />
      {TITLE_LETTERS.map((letter, index) => (
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

function generateEquation(): Equation {
  const isAddition = Math.random() > 0.5;

  if (isAddition) {
    const answer = Math.floor(Math.random() * 21); // 0-20
    const num1 = Math.floor(Math.random() * (answer + 1));
    const num2 = answer - num1;
    return { num1, num2, operator: "+", answer };
  } else {
    const num1 = Math.floor(Math.random() * 21); // 0-20
    const num2 = Math.floor(Math.random() * (num1 + 1));
    const answer = num1 - num2;
    return { num1, num2, operator: "-", answer };
  }
}

function generateAnswerChoices(correctAnswer: number): number[] {
  const choices = new Set<number>();
  choices.add(correctAnswer);

  while (choices.size < 5) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrongAnswer = correctAnswer + offset;

    if (wrongAnswer >= 0 && wrongAnswer <= 20 && wrongAnswer !== correctAnswer) {
      choices.add(wrongAnswer);
    }
  }

  return Array.from(choices).sort(() => Math.random() - 0.5);
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
        const fw = {
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20,
        };

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
    <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">
      {TITLE_LETTERS.map((letter, index) => (
        <span key={index} style={{ color: letter.color }}>
          {letter.char}
        </span>
      ))}
    </h1>
  );
}

export default function MathGame() {
  const [gameState, setGameState] = useState<"intro" | "start" | "playing" | "feedback" | "roundEnd">("intro");
  const [equation, setEquation] = useState<Equation | null>(null);
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [questionNumber, setQuestionNumber] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setGameState("start");
  }, []);

  const startNewQuestion = useCallback(() => {
    const newEquation = generateEquation();
    setEquation(newEquation);
    setChoices(generateAnswerChoices(newEquation.answer));
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameState("playing");
  }, []);

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

  const handleFireworksComplete = () => {
    setShowFireworks(false);
  };

  const nextQuestion = () => {
    if (questionNumber >= EQUATIONS_PER_ROUND) {
      setGameState("roundEnd");
    } else {
      setQuestionNumber((prev) => prev + 1);
      startNewQuestion();
    }
  };

  const getButtonColor = (index: number, choice: number) => {
    if (gameState === "feedback" && equation) {
      if (choice === equation.answer) {
        return "bg-green-500 hover:bg-green-500 scale-110 animate-bounce";
      }
      if (choice === selectedAnswer && !isCorrect) {
        return "bg-red-500 hover:bg-red-500";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {gameState === "intro" && <IntroAnimation onComplete={handleIntroComplete} />}

      {showFloatingBackground && <FloatingBackground />}

      {showFireworks && equation && (
        <Fireworks number={equation.answer} onComplete={handleFireworksComplete} />
      )}

      {gameState !== "intro" && <RainbowTitle />}

      {gameState === "start" && (
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center relative z-10">
          <p className="text-2xl mb-6 text-gray-700">Ready to play?</p>
          <p className="text-lg mb-6 text-gray-500">Answer {EQUATIONS_PER_ROUND} math questions!</p>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-3xl font-bold py-4 px-12 rounded-full transform hover:scale-110 transition-transform shadow-lg"
          >
            Start!
          </button>
        </div>
      )}

      {(gameState === "playing" || gameState === "feedback") && equation && (
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center w-full max-w-lg relative z-10">
          <div className="flex justify-between mb-4 text-lg">
            <span className="text-green-600 font-bold">✓ {score.correct}</span>
            <span className="text-gray-500">Question {questionNumber} of {EQUATIONS_PER_ROUND}</span>
            <span className="text-red-600 font-bold">✗ {score.wrong}</span>
          </div>

          <div className="text-6xl md:text-7xl font-bold mb-8 text-gray-800">
            {equation.num1} {equation.operator} {equation.num2} = ?
          </div>

          <div className="grid grid-cols-5 gap-2 md:gap-4 mb-6">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(choice)}
                disabled={gameState === "feedback"}
                className={`${getButtonColor(index, choice)} text-white text-2xl md:text-3xl font-bold py-4 px-2 md:px-6 rounded-xl transform transition-all duration-200 ${
                  gameState === "playing" ? "hover:scale-110 active:scale-95" : ""
                } shadow-lg disabled:cursor-not-allowed`}
              >
                {choice}
              </button>
            ))}
          </div>

          {gameState === "feedback" && (
            <div className="mt-4">
              {isCorrect ? (
                <div className="text-3xl font-bold text-green-600 animate-bounce">
                  Correct!
                </div>
              ) : (
                <div className="text-2xl font-bold text-red-600">
                  The answer was {equation.answer}
                </div>
              )}
              {!showFireworks && (
                <button
                  onClick={nextQuestion}
                  className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold py-3 px-8 rounded-full transform hover:scale-110 transition-transform shadow-lg"
                >
                  {questionNumber >= EQUATIONS_PER_ROUND ? "See Results" : "Next Question"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {gameState === "roundEnd" && (
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">Round Complete!</h2>
          <div className="text-6xl mb-4">
            {score.correct === EQUATIONS_PER_ROUND ? "⭐" : score.correct >= 2 ? "👏" : "💪"}
          </div>
          <div className="text-2xl mb-4">
            <span className="text-green-600 font-bold">{score.correct} correct</span>
            {" "}&{" "}
            <span className="text-red-600 font-bold">{score.wrong} wrong</span>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            {score.correct === EQUATIONS_PER_ROUND
              ? "Perfect! You're a math superstar!"
              : score.correct >= 2
              ? "Great job! Keep practicing!"
              : "Good try! Let's practice more!"}
          </p>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-2xl font-bold py-4 px-10 rounded-full transform hover:scale-110 transition-transform shadow-lg"
          >
            Play Again!
          </button>
        </div>
      )}
    </div>
  );
}
