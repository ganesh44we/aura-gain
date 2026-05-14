import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, Play, Pause, Volume2 } from "lucide-react";

const BackgroundEffects = () => (
  <>
    {/* Grain and Vignette */}
    <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.035] bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%270%200%20256%20256%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.9%27%20numOctaves=%274%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23n)%27/%3E%3C/svg%3E')]" />
    <div className="fixed inset-0 pointer-events-none z-[1] bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
    
    {/* Orbs: Pink, Deep Pink, and White */}
    <div className="fixed w-[450px] h-[450px] bg-aura-gain rounded-full blur-[110px] -top-[120px] -left-[120px] opacity-[0.12] pointer-events-none animate-orb" />
    <div className="fixed w-[400px] h-[400px] bg-white rounded-full blur-[130px] top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none animate-orb [animation-delay:2s]" />
    <div className="fixed w-[350px] h-[350px] bg-aura-deep rounded-full blur-[90px] -bottom-[100px] -right-[100px] opacity-[0.12] pointer-events-none animate-orb [animation-delay:4s]" />
    <div className="fixed w-[300px] h-[300px] bg-white rounded-full blur-[100px] bottom-1/4 left-1/4 opacity-[0.04] pointer-events-none animate-orb [animation-delay:1s]" />
  </>
);

export default function App() {
  const [stage, setStage] = useState<"splash" | "step1" | "step2" | "final">("splash");
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [isChiClicked, setIsChiClicked] = useState(false);
  const [envelopePass, setEnvelopePass] = useState("");
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isAudioFinished, setIsAudioFinished] = useState(false);
  const [showFinalPage, setShowFinalPage] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Trigger final letter after 3 seconds of envelope opening
  useEffect(() => {
    if (isEnvelopeOpen) {
      const timer = setTimeout(() => {
        setShowLetter(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isEnvelopeOpen]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setAudioProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setIsAudioFinished(true);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    
    if (isPlaying) {
      audio.play().catch(console.error);
      setHasStarted(true);
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isPlaying]);

  const handleSkip = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = audio.duration || 0;
    }
    setIsPlaying(false);
    setIsAudioFinished(true);
    setAudioProgress(100);
  };

  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [songProgress, setSongProgress] = useState(0);
  const songRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = songRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      setSongProgress(progress || 0);
    };

    const handleEnded = () => {
      setIsSongPlaying(false);
      setSongProgress(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    
    if (isSongPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isSongPlaying, showFinalPage]);

  const handlePassCheck = (val: string) => {
    if (val === "220406" || val.toLowerCase() === "kajukatli") {
      setIsEnvelopeOpen(true);
      setIsIncorrect(false);
    } else if (val.length > 0) {
      setIsShaking(true);
      setIsIncorrect(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleNext = () => {
    if (stage === "splash") setStage("step1");
    if (stage === "step1" && input1.trim()) setStage("step2");
    if (stage === "step2" && input2.trim()) setStage("final");
  };

  const bubbleTexts = ["eww", "ayyyoo", "avnaa", "naicee", "okeyyy", "cutee"];

  // Stabilize bubble properties to prevent "refreshing" on every state update (like typing)
  const bubbles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      text: bubbleTexts[i % bubbleTexts.length],
      initialX: `${Math.random() * 100}vw`,
      scale: 0.5 + Math.random(),
      animateX: [`${Math.random() * 100}vw`, `${(Math.random() * 100) + (Math.random() * 10 - 5)}vw`],
      duration: 12 + Math.random() * 18,
      delay: Math.random() * 10,
    }));
  }, []);

  return (
    <main className="h-screen w-screen bg-aura-bg relative overflow-hidden p-8 font-sans">
      <BackgroundEffects />

      {/* Floating Bubbles */}
      <AnimatePresence>
        {!isChiClicked && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {bubbles.map((bubble) => (
              <motion.div
                key={bubble.id}
                initial={{ 
                  y: "110vh", 
                  x: bubble.initialX, 
                  opacity: 0,
                  scale: bubble.scale 
                }}
                animate={{ 
                  y: "-10vh", 
                  opacity: [0, 0.45, 0.45, 0],
                  x: bubble.animateX
                }}
                transition={{ 
                  duration: bubble.duration, 
                  repeat: Infinity, 
                  delay: bubble.delay,
                  ease: "linear"
                }}
                className="absolute px-4 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm flex items-center justify-center"
              >
                <span className="text-white text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">
                  {bubble.text}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Content: Hidden when chi is clicked */}
      <AnimatePresence>
        {!isChiClicked && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Heyyy Button: Center -> Top Right */}
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                top: stage === "splash" ? "50%" : "15%",
                right: stage === "splash" ? "50%" : "10%",
                left: stage === "splash" ? "auto" : "auto",
                x: stage === "splash" ? "50%" : "0%",
                y: stage === "splash" ? "-50%" : "0%",
                opacity: 1,
                scale: 1
              }}
              transition={{ duration: 1.2, ease: [0.77, 0, 0.18, 1] }}
              className="absolute z-20"
            >
              <button
                onClick={() => stage === "splash" && setStage("step1")}
                className={`px-10 py-3.5 text-lg font-bold rounded-full bg-linear-to-br from-aura-deep via-aura-gain to-aura-light shadow-[0_0_32px_rgba(255,25,139,0.35)] text-white ${stage === "splash" ? "animate-btn-pulse" : "opacity-70"}`}
              >
                Heyyyy
              </button>
            </motion.div>

            {/* Input 1: Below Heyyy on the Left */}
            <AnimatePresence>
              {stage !== "splash" && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-[30%] left-10 w-full max-w-[240px] px-4 z-20"
                >
                  <div className="flex items-center bg-aura-input border border-aura-gain/20 rounded-full px-5 py-2.5 transition-all focus-within:border-aura-gain/50 focus-within:shadow-[0_0_20px_rgba(255,25,139,0.15)]">
                    <input
                      autoFocus={stage === "step1"}
                      type="text"
                      disabled={stage !== "step1"}
                      placeholder="Message..."
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm font-light placeholder:text-neutral-700 caret-aura-gain disabled:text-neutral-500"
                      value={input1}
                      onChange={(e) => setInput1(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* WYD Button: Below Input 1 on the Right */}
            <AnimatePresence>
              {(stage === "step2" || stage === "final") && (
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-[50%] right-10 z-20"
                >
                  <div className="px-10 py-3.5 text-lg font-bold rounded-full bg-linear-to-br from-aura-deep via-aura-gain to-aura-light shadow-[0_0_32px_rgba(255,25,139,0.35)] text-white animate-btn-pulse">
                    Em chestunavvv
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input 2: Below WYD on the Left */}
            <AnimatePresence>
              {(stage === "step2" || stage === "final") && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-[65%] left-10 w-full max-w-[240px] px-4 z-20"
                >
                  <div className="flex items-center bg-aura-input border border-aura-gain/20 rounded-full px-5 py-2.5 transition-all focus-within:border-aura-gain/50 focus-within:shadow-[0_0_20px_rgba(255,25,139,0.15)]">
                    <input
                      autoFocus={stage === "step2"}
                      type="text"
                      disabled={stage === "final"}
                      placeholder="Action..."
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm font-light placeholder:text-neutral-700 caret-aura-gain disabled:text-neutral-500"
                      value={input2}
                      onChange={(e) => setInput2(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Final Stage: Cool Box and Chi Button */}
            <AnimatePresence>
              {stage === "final" && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-30"
                >
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="px-10 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm font-light backdrop-blur-sm shadow-xl whitespace-nowrap"
                  >
                    [okay coool, this is for you]
                  </motion.div>

                  <motion.button
                    onClick={() => setIsChiClicked(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-2.5 bg-white text-black font-bold rounded-lg shadow-[0_0_20px_rgba(255,25,255,0.2)] transition-shadow hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                  >
                    chi
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Envelope Stage */}
      <AnimatePresence>
        {isChiClicked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-40"
          >
            <motion.div 
              style={{ perspective: "1000px" }}
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ 
                scale: isEnvelopeOpen ? 1.05 : 1, 
                y: isEnvelopeOpen ? -20 : 0, 
                opacity: 1,
                x: isShaking ? [0, -10, 10, -10, 10, 0] : 0
              }}
              transition={{ 
                x: { duration: 0.4 },
                default: { delay: 0.5, duration: 0.8, ease: "easeOut" }
              }}
              className="relative w-80 h-52 flex items-center justify-center"
            >
              {/* Envelope Body */}
              <div className="absolute inset-0 bg-white rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_20px_rgba(255,255,255,0.1)] border border-gray-100 overflow-hidden z-10 flex items-center justify-center p-6 text-center">
                <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[length:4px_4px]" />
                <AnimatePresence>
                  {isEnvelopeOpen && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="text-aura-deep font-serif italic text-xl"
                    >
                      "I knew you would do it"
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Envelope Flap */}
              <motion.div 
                initial={{ rotateX: 0 }}
                animate={{ rotateX: isEnvelopeOpen ? -160 : 0 }}
                style={{ transformOrigin: "top", transformStyle: "preserve-3d" }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none"
              >
                <div 
                  className="w-full h-[60%] bg-white shadow-md border-b border-gray-100"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                />
              </motion.div>

              {/* Password Box at the Flap Edge */}
              <AnimatePresence>
                {!isEnvelopeOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: 1 }}
                    className="absolute top-[55%] left-1/2 -translate-x-1/2 z-30 w-full max-w-[200px] px-4 flex flex-col items-center gap-2"
                  >
                    <AnimatePresence>
                      {isIncorrect && (
                        <motion.span 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-[10px] text-aura-gain font-medium tracking-wide bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm"
                        >
                          sweetie one more try
                        </motion.span>
                      )}
                    </AnimatePresence>

                    <div className="relative group w-full">
                      <input 
                        autoFocus
                        type="password"
                        placeholder="pass key"
                        className={`w-full bg-black/90 backdrop-blur-md border rounded-lg py-2.5 px-3 text-xs text-center text-white tracking-[0.3em] outline-none transition-all placeholder:text-gray-600 placeholder:tracking-normal ${isIncorrect ? "border-aura-gain/50 shadow-[0_0_15px_rgba(255,25,139,0.2)]" : "border-white/10 focus:border-white/30"}`}
                        value={envelopePass}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEnvelopePass(val);
                          setIsIncorrect(false);
                          if (val === "220406" || val.toLowerCase() === "kajukatli") {
                            setIsEnvelopeOpen(true);
                          }
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handlePassCheck(envelopePass)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Hint Box Below Envelope */}
            <AnimatePresence>
              {isChiClicked && !isEnvelopeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.8 }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50 w-full max-w-[280px]"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowHint(!showHint)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl border ${showHint ? "bg-yellow-400 text-black border-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.6)]" : "bg-white/5 text-yellow-500/80 border-white/10 hover:border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.1)]"}`}
                  >
                    <Lightbulb className={`w-6 h-6 ${showHint ? "fill-black drop-shadow-[0_0_8px_rgba(255,255,255,1)]" : "drop-shadow-[0_0_5px_rgba(250,204,21,0.3)]"}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="p-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl text-center"
                      >
                        <p className="text-xs text-white/90 leading-relaxed font-light">
                          <span className="block mb-2 font-bold text-aura-gain uppercase tracking-widest text-[10px]">Hints</span>
                          1. Date the first time when we spoke on a call<br />
                          <span className="opacity-50 my-1 block">— or —</span>
                          2. Name of your favourite sweet
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Final Letter Page */}
      <AnimatePresence>
        {showLetter && !showFinalPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 bg-aura-bg sm:p-12 text-center"
          >
            <BackgroundEffects />
            
            <audio 
              ref={audioRef} 
              src="/joke.mp3" 
              onError={(e) => {
                console.warn("Audio file not found.");
                setIsPlaying(false);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="relative z-10 w-full max-w-md flex flex-col items-center gap-16"
            >
              <div className="flex flex-col items-center gap-12">
                <div className="relative">
                  <motion.div 
                    animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-32 h-32 rounded-full bg-linear-to-br from-aura-deep/20 via-aura-gain/20 to-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,25,139,0.15)_0%,transparent_70%)]" />
                    <Volume2 className="w-10 h-10 text-aura-gain opacity-50" />
                  </motion.div>
                  
                  {/* Decorative orbital rings */}
                  <div className="absolute -inset-4 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute -inset-8 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                </div>
              </div>

              {/* Audio Controls */}
              <div className="w-full space-y-8">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-linear-to-r from-aura-deep to-aura-gain"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>

                <div className="flex flex-col items-center gap-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-black shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-shadow hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black translate-x-0.5" />}
                  </motion.button>

                  <AnimatePresence>
                    {hasStarted && !isAudioFinished && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.4, y: 0 }}
                        whileHover={{ opacity: 0.8 }}
                        onClick={handleSkip}
                        className="text-[10px] text-white uppercase tracking-[0.4em] font-light italic"
                      >
                        Skip Message
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </motion.div>

            {/* GOOD TO GO Button at the fixed bottom */}
            <AnimatePresence>
              {isAudioFinished && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[110]"
                >
                  <motion.button
                    onClick={() => setShowFinalPage(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-12 py-4 bg-white text-black font-bold rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] tracking-widest text-sm"
                  >
                    GOOD TO GO
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Final Page */}
      <AnimatePresence>
        {showFinalPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-start p-8 bg-aura-bg sm:p-12 overflow-y-auto"
          >
            <BackgroundEffects />
            
            <div className="relative z-10 max-w-xl w-full pt-12 pb-24 space-y-16">
              {/* Mini Player */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="mx-auto w-full max-w-xs bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4 shadow-2xl"
              >
                <audio 
                  ref={songRef} 
                  src="/song.mp3"
                  className="hidden"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSongPlaying(!isSongPlaying)}
                  className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-black shadow-lg shrink-0"
                >
                  {isSongPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black translate-x-0.5" />}
                </motion.button>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Listening to Magadheera</span>
                    <motion.div 
                      animate={isSongPlaying ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-1.5 h-1.5 rounded-full bg-aura-gain shadow-[0_0_8px_rgba(255,107,157,0.8)]"
                    />
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-linear-to-r from-aura-gain to-aura-deep"
                      style={{ width: `${songProgress}%` }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Intro Note */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
              >
                <p className="text-white/50 italic text-[13px] leading-relaxed tracking-wide text-center">
                  "Nvu cheppav ne fav movie magadheera ani dantlo nak ee oka song ey nachutadi , if its really special nen vadodu ante u can ignore it , im pinning it any way"
                </p>
              </motion.div>

              {/* Main Letter Content */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1.5 }}
                className="text-white space-y-10 font-light"
              >
                <div className="space-y-8 text-[15px] leading-relaxed tracking-wide opacity-90">
                  <header>
                    <h3 className="text-2xl font-medium tracking-[0.1em] text-white">Heyy Reddy,</h3>
                  </header>
                  
                  <div className="space-y-6">
                    <p>
                      I know this may be cringe but it is what it is. Nen inthe.
                    </p>
                    
                    <p>
                      You remember the day you watched Man Utd for the first time? You know how excited I was that night someone actually watched it. Neku normal ga undochu, but I never asked anyone before.
                    </p>

                    <p>
                      Hmmm ; with that same excitement, I made all those playlists, wrote those mails, those letters.
                    </p>

                    <p>
                      I know I'm boring, yeah. Occasion em kadu idiantha cheppadanki. But it's been a month since I really started speaking to you.
                    </p>

                    <p>
                      You may find this clingy, creepy, cringe, obsessed wt not. But hell yea I'm cringe. Walkout bro, neku istam lekapothe.
                    </p>

                    <p>
                      I really lost my excitement a few months, years down the line I lost my smile, telsa. I wish I'll gain it back.
                    </p>

                    <p>
                      I shouldn't say all this but nuvvu ardham cheskuntav le.
                    </p>

                    <p>
                      Yabbee gibbee anaku it took me 3 hours doing this. It's fine if it makes you feel special for even 3 minutes.
                    </p>
                  </div>

                  {/* The Ask */}
                  <div className="py-6 border-y border-white/5 space-y-4">
                    <p className="text-aura-gain text-[11px] font-bold tracking-[0.4em] uppercase opacity-70">What should I ask? Hmmmmmm</p>
                    <motion.div
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    >
                      <p className="text-3xl font-bold bg-linear-to-r from-white to-white/40 bg-clip-text text-transparent">
                        CAN I GET YOUR NUMBER PURI? 
                      </p>
                    </motion.div>
                  </div>

                  <div className="space-y-6">
                    <p>Nen inka em lev chesevi seriously.</p>
                    
                    <div className="flex items-center gap-3 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10">
                      <p className="italic text-sm">You little gorgeousaurus</p>
                      <span className="text-lg">🌸</span>
                    </div>

                    <p className="italic opacity-60">Hehehe</p>
                    
                    <p className="text-[12px] opacity-40 font-normal">Thankyou for listening to all my sodhi, and reading all this. please dont make it a [999 x 0] atleast try [999 x 0.5], that would be great .</p>
                  </div>
                </div>

                {/* Signature */}
                <footer className="pt-12">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 3 }}
                    className="flex flex-col items-start gap-1"
                  >
                    <div className="h-px w-8 bg-white/20 mb-4" />
                    <p className="text-3xl font-serif italic text-white/90">— G</p>
                  </motion.div>
                </footer>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

