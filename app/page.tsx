"use client";

import { useState, useEffect, useCallback } from "react";

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
    // Generate wrong answers that are close to the correct answer
    const offset = Math.floor(Math.random() * 10) - 5;
    let wrongAnswer = correctAnswer + offset;

    // Keep answers in valid range (0-20) and not equal to correct answer
    if (wrongAnswer >= 0 && wrongAnswer <= 20 && wrongAnswer !== correctAnswer) {
      choices.add(wrongAnswer);
    }
  }

  // Shuffle the choices
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
    // Create multiple firework bursts
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const fw = {
          x: Math.random() * 80 + 10, // 10-90% of screen width
          y: Math.random() * 60 + 20, // 20-80% of screen height
        };

        // Create particles for this firework
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
            isNumber: j % 5 === 0, // Some particles show the number
          });
        }
        setParticles((prev) => [...prev, ...newParticles]);
      }, i * 200);
    }

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.5,
            y: p.y + p.vy * 0.5,
            vy: p.vy + 0.1, // gravity
            opacity: p.opacity - 0.02,
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 30);

    // Clean up after animation
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

export default function MathGame() {
  const [gameState, setGameState] = useState<"start" | "playing" | "feedback" | "roundEnd">("start");
  const [equation, setEquation] = useState<Equation | null>(null);
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [questionNumber, setQuestionNumber] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);

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
    // Rainbow colors for buttons
    const colors = [
      "bg-red-500 hover:bg-red-600",
      "bg-orange-500 hover:bg-orange-600",
      "bg-yellow-500 hover:bg-yellow-600",
      "bg-green-500 hover:bg-green-600",
      "bg-blue-500 hover:bg-blue-600",
    ];
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex flex-col items-center justify-center p-4">
      {showFireworks && equation && (
        <Fireworks number={equation.answer} onComplete={handleFireworksComplete} />
      )}

      {/* Rainbow Header */}
      <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">
        <span className="text-red-500">M</span>
        <span className="text-orange-500">a</span>
        <span className="text-yellow-400">t</span>
        <span className="text-green-500">h</span>
        <span className="text-blue-500"> </span>
        <span className="text-indigo-500">F</span>
        <span className="text-purple-500">u</span>
        <span className="text-red-500">n</span>
        <span className="text-orange-500">!</span>
      </h1>

      {gameState === "start" && (
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
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
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center w-full max-w-lg">
          {/* Score Display */}
          <div className="flex justify-between mb-4 text-lg">
            <span className="text-green-600 font-bold">✓ {score.correct}</span>
            <span className="text-gray-500">Question {questionNumber} of {EQUATIONS_PER_ROUND}</span>
            <span className="text-red-600 font-bold">✗ {score.wrong}</span>
          </div>

          {/* Equation */}
          <div className="text-6xl md:text-7xl font-bold mb-8 text-gray-800">
            {equation.num1} {equation.operator} {equation.num2} = ?
          </div>

          {/* Answer Choices */}
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

          {/* Feedback */}
          {gameState === "feedback" && (
            <div className="mt-4">
              {isCorrect ? (
                <div className="text-3xl font-bold text-green-600 animate-bounce">
                  🎉 Correct! 🎉
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
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">Round Complete!</h2>
          <div className="text-6xl mb-4">
            {score.correct === EQUATIONS_PER_ROUND ? "🌟" : score.correct >= 2 ? "👏" : "💪"}
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
