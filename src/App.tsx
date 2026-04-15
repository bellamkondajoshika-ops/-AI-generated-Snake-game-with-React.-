import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "SYS.INIT // NEURAL_AWAKENING",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "DATA_STREAM // CORRUPTION",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "VOID_WALKER // SECTOR_7",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

const GlitchText = ({ text, className = "" }: { text: string, className?: string }) => {
  return (
    <div className={`glitch-wrapper ${className}`}>
      <div className="glitch" data-text={text}>
        {text}
      </div>
    </div>
  );
};

const SnakeGame = ({ onScoreChange }: { onScoreChange: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const directionRef = useRef(direction);
  directionRef.current = direction;

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: -1 });
    setFood({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
    setGameOver(false);
    setScore(0);
    onScoreChange(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (directionRef.current.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (directionRef.current.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (directionRef.current.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (directionRef.current.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const newHead = {
          x: prevSnake[0].x + directionRef.current.x,
          y: prevSnake[0].y + directionRef.current.y,
        };

        // Check collision with walls
        if (newHead.x < 0 || newHead.x >= 20 || newHead.y < 0 || newHead.y >= 20) {
          setGameOver(true);
          return prevSnake;
        }

        // Check collision with self
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => {
            const newScore = s + 10;
            onScoreChange(newScore);
            return newScore;
          });
          setFood({
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 120);
    return () => clearInterval(interval);
  }, [food, gameOver, onScoreChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 400, 400);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    for (let i = 0; i <= 400; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 400);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(400, i);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#FF00FF';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FF00FF';
    ctx.fillRect(food.x * 20 + 2, food.y * 20 + 2, 16, 16);
    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#FFFFFF' : '#00FFFF';
      ctx.shadowBlur = index === 0 ? 10 : 5;
      ctx.shadowColor = '#00FFFF';
      ctx.fillRect(segment.x * 20 + 1, segment.y * 20 + 1, 18, 18);
      ctx.shadowBlur = 0;
      
      // Glitch effect on snake body occasionally
      if (Math.random() > 0.95) {
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(segment.x * 20 + (Math.random() * 6 - 3), segment.y * 20, 18, 18);
      }
    });

  }, [snake, food]);

  return (
    <div className="relative border-glitch p-1 bg-black inline-block">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="block w-full max-w-[400px] aspect-square"
      />
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-10">
          <GlitchText text="SYSTEM_FAILURE" className="text-4xl text-magenta mb-4" />
          <p className="text-cyan text-xl mb-6">SCORE: {score}</p>
          <button 
            onClick={resetGame}
            className="px-6 py-2 border-2 border-cyan text-cyan hover:bg-cyan hover:text-black transition-colors uppercase tracking-widest cursor-pointer"
          >
            REBOOT_SEQUENCE
          </button>
        </div>
      )}
    </div>
  );
};

const MusicPlayer = ({ currentTrackIndex, isPlaying, onPlayPause, onSkip, tracks }: any) => {
  const track = tracks[currentTrackIndex];

  return (
    <div className="border-glitch p-4 bg-black/80 backdrop-blur-sm w-full max-w-md">
      <div className="flex justify-between items-center mb-4 border-b border-cyan/30 pb-2">
        <GlitchText text="AUDIO_SUBSYSTEM" className="text-xl text-magenta" />
        <div className="flex gap-1 items-end h-6">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`w-2 bg-cyan ${isPlaying ? 'animate-pulse' : 'opacity-30'}`}
              style={{ 
                height: isPlaying ? `${Math.random() * 100}%` : '20%', 
                animationDelay: `${i * 0.1}s`,
                transition: 'height 0.2s ease'
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-xs text-cyan/70 mb-1 tracking-widest">NOW_PLAYING:</p>
        <div className="text-lg truncate text-white">{track.title}</div>
        <div className="w-full bg-gray-900 h-1 mt-3 relative overflow-hidden">
          <div className={`absolute top-0 left-0 h-full bg-magenta ${isPlaying ? 'animate-[scan_2s_linear_infinite]' : 'w-0'}`} style={{ width: '100%' }} />
        </div>
      </div>

      <div className="flex justify-center gap-6">
        <button 
          onClick={onPlayPause}
          className="p-3 border border-cyan text-cyan hover:bg-cyan hover:text-black transition-colors cursor-pointer"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button 
          onClick={onSkip}
          className="p-3 border border-magenta text-magenta hover:bg-magenta hover:text-black transition-colors cursor-pointer"
        >
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [score, setScore] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(TRACKS[currentTrackIndex].url);
      audioRef.current.loop = true;
    } else {
      audioRef.current.src = TRACKS[currentTrackIndex].url;
    }
    
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkip = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00FFFF] font-mono flex flex-col items-center py-8 md:py-12 relative overflow-hidden tear-effect">
      <div className="scanlines"></div>
      
      <header className="mb-8 md:mb-12 text-center z-10 px-4">
        <GlitchText text="NEURO_SNAKE v2.4" className="text-4xl md:text-6xl font-bold mb-2" />
        <p className="text-magenta tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm">CYBERNETIC_ENTERTAINMENT_SYSTEM</p>
      </header>

      <div className="flex flex-col xl:flex-row gap-8 xl:gap-16 items-center xl:items-start z-10 w-full max-w-6xl px-4 justify-center">
        
        <div className="flex flex-col items-center w-full max-w-[400px]">
          <div className="flex justify-between w-full mb-4 px-2 text-lg md:text-xl">
            <span className="text-cyan">PLAYER_01</span>
            <span className="text-magenta">SCORE: {score.toString().padStart(4, '0')}</span>
          </div>
          <SnakeGame onScoreChange={setScore} />
        </div>

        <div className="flex flex-col gap-8 w-full max-w-md mt-4 xl:mt-11">
          <MusicPlayer 
            currentTrackIndex={currentTrackIndex}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSkip={handleSkip}
            tracks={TRACKS}
          />
          
          <div className="border-glitch p-6 bg-black/80 backdrop-blur-sm">
            <h3 className="text-magenta mb-4 border-b border-magenta/30 pb-2 text-lg">SYSTEM_LOGS</h3>
            <ul className="text-sm space-y-2 text-cyan/80 opacity-80">
              <li>&gt; INITIALIZING KINETIC ENGINE... OK</li>
              <li>&gt; LOADING AUDIO SUBSYSTEM... OK</li>
              <li>&gt; ESTABLISHING NEURAL LINK... OK</li>
              <li>&gt; AWAITING USER INPUT...</li>
              <li className="animate-pulse text-white mt-4">&gt; USE ARROW KEYS OR WASD TO MOVE</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
