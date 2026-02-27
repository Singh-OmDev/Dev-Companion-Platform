import React, { useEffect, useState, useRef } from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Layers, Terminal as TerminalIcon, Cpu, Database, ArrowRight } from 'lucide-react';

// --- Web Audio API for UI Sounds ---
const playBeep = (type = 'hover') => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'hover') {
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.02, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } else if (type === 'click') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        }
    } catch (e) {
        console.error("Audio playback failed", e);
    }
};

// --- Custom Cursor ---
// Removed per user request

// --- Interactive Terminal ---
const InteractiveTerminal = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState([
        "DEV_OS Kernel v2.4.0 initialized.",
        "Type 'help' for available commands or 'init' to start."
    ]);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [output]);

    const handleCommand = (e) => {
        if (e.key === 'Enter') {
            const cmd = input.trim().toLowerCase();
            let response = [];

            playBeep('click');

            if (cmd === 'help') {
                response = ['Available commands: help, status, ping, init, clear'];
            } else if (cmd === 'status') {
                response = ['System Nominal.', 'Modules Loaded: GitHub, LeetCode, Daily_Goals.'];
            } else if (cmd === 'ping') {
                response = ['PONG', 'Latency: 12ms'];
            } else if (cmd === 'init') {
                response = ['Initializing DevOS profile...', 'Please use the top-right button to authenticate.'];
            } else if (cmd === 'clear') {
                setOutput([]);
                setInput('');
                return;
            } else if (cmd !== '') {
                response = [`Command not found: ${cmd}`];
            }

            setOutput(prev => [...prev, `> ${input}`, ...response]);
            setInput('');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-[#0a0a0a] border border-[#333] rounded-lg p-4 font-mono text-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-text"
            onMouseEnter={() => playBeep('hover')}>
            <div className="flex gap-2 mb-4 border-b border-[#333] pb-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="h-48 overflow-y-auto custom-scrollbar flex flex-col gap-1 text-[#00ff00]">
                {output.map((line, i) => (
                    <div key={i} className={`${line.startsWith('>') ? 'text-white' : 'opacity-80'}`}>{line}</div>
                ))}
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-white">&gt;</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleCommand}
                        className="bg-transparent border-none outline-none w-full text-white"
                        autoFocus
                        spellCheck="false"
                        onMouseEnter={() => playBeep('hover')}
                    />
                </div>
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

const FloatingElement = ({ children, delay = 0, initialPosition = { x: 0, y: 0 }, rotate = 0, scale = 1, mousePosition }) => {
    return (
        <motion.div
            initial={{ opacity: 0, ...initialPosition, rotate, scale: scale * 0.8 }}
            animate={{
                opacity: 1,
                x: initialPosition.x,
                y: [initialPosition.y - 15, initialPosition.y + 15, initialPosition.y - 15],
                rotate: [rotate - 5, rotate + 5, rotate - 5],
                scale
            }}
            style={{
                translateX: `${mousePosition.x * 20 * scale}px`,
                translateY: `${mousePosition.y * 20 * scale}px`,
            }}
            transition={{
                opacity: { duration: 1, delay },
                scale: { duration: 1, delay, ease: "backOut" },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay },
                rotate: { duration: 8, repeat: Infinity, ease: "easeInOut", delay }
            }}
            className="absolute z-20 pointer-events-none drop-shadow-2xl transition-transform duration-300 ease-out"
        >
            {children}
        </motion.div>
    );
};

const RevealText = ({ children, delay = 0 }) => {
    return (
        <motion.div
            initial={{ y: 50, opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0% 0%)' }}
            whileInView={{ y: 0, opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
};

const FeatureBlock = ({ number, title, subtitle, description, onHover }) => {
    return (
        <div
            className="w-full flex flex-col md:flex-row items-start justify-between py-24 border-t border-white/10 group"
            onMouseEnter={() => { onHover(true); playBeep('hover'); }}
            onMouseLeave={() => onHover(false)}
        >
            <div className="w-full md:w-1/3 mb-10 md:mb-0">
                <RevealText>
                    <p className="font-mono text-[10px] tracking-[0.3em] text-[#D4F23F] uppercase mb-4 opacity-50 group-hover:opacity-100 transition-opacity">{number} // MODULE</p>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-6 glitch group-hover:animate-none" data-text={title}>
                        {title}
                    </h2>
                </RevealText>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-6">
                <RevealText delay={0.1}>
                    <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[#D4F23F] opacity-80 group-hover:opacity-100 transition-opacity">
                        {subtitle}
                    </h3>
                </RevealText>
                <RevealText delay={0.2}>
                    <p className="text-lg md:text-xl text-[#A0A0A0] font-light leading-relaxed max-w-lg group-hover:text-white transition-colors">
                        {description}
                    </p>
                </RevealText>
                <RevealText delay={0.3}>
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#D4F23F] group-hover:text-[#D4F23F] transition-colors duration-500 mt-4">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </RevealText>
            </div>
        </div>
    );
}

const LandingPage = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, clientX: 0, clientY: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 500]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    // Real-time faux telemetry state
    const [telemetry, setTelemetry] = useState({
        latency: 12,
        mem: 1024,
        rps: 45
    });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            setMousePosition({ x, y, clientX: e.clientX, clientY: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    // Telemetry tickers
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

            // Randomize telemetry slightly
            setTelemetry(prev => ({
                latency: Math.max(5, Math.min(30, prev.latency + (Math.random() > 0.5 ? 1 : -1))),
                mem: Math.max(800, Math.min(2048, prev.mem + Math.floor(Math.random() * 50 - 25))),
                rps: Math.max(10, Math.min(100, prev.rps + Math.floor(Math.random() * 10 - 5)))
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const scrollToFeatures = () => {
        const element = document.getElementById('features');
        if (element) {
            playBeep('click');
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-[#020202] text-[#EBEBEB] font-sans selection:bg-[#D4F23F] selection:text-black overflow-x-hidden w-full relative">

            {/* Subtle Gradient Overlay mimicking 3D environment lighting - Fixed Position */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10 mix-blend-screen"
                style={{
                    background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(212,242,63,0.15) 0%, transparent 60%)`
                }}>
            </div>

            {/* HUD / Microcopy - Fixed */}
            <div className="fixed top-8 left-8 z-[100] pointer-events-none hidden md:block mix-blend-difference">
                <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#A0A0A0] uppercase">System Status<br />Nominal</p>
                <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#D4F23F] uppercase mt-2">v2.4.0-beta</p>
            </div>

            <div className="fixed top-1/2 right-8 -translate-y-1/2 z-[100] pointer-events-none hidden lg:block mix-blend-difference" style={{ writingMode: 'vertical-rl' }}>
                <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#A0A0A0] uppercase flex gap-4">
                    <span>LATENCY: {telemetry.latency}ms</span>
                    <span>MEM: {telemetry.mem}MB</span>
                    <span>RPS: {telemetry.rps}</span>
                </p>
            </div>

            <div className="fixed top-1/2 left-8 -translate-y-1/2 z-[100] pointer-events-none hidden lg:block mix-blend-difference" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#A0A0A0] uppercase">
                    {time} LOCAL // ENGINEERING TERMINAL
                </p>
            </div>

            <footer className="fixed bottom-0 inset-x-0 w-full z-[100] px-8 py-6 flex items-end justify-between pointer-events-none mix-blend-difference">
                <div className="hidden md:flex flex-col gap-1 pointer-events-auto cursor-help group"
                    onMouseEnter={() => { setIsHovering(true); playBeep('hover'); }}
                    onMouseLeave={() => setIsHovering(false)}>
                    <p className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-[#A0A0A0] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse shadow-[0_0_8px_#0f0]"></span>
                        Connections: {Math.floor(telemetry.rps / 10)} (Stable)
                    </p>
                    <p className="font-mono text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-opacity text-[#D4F23F]">
                        GITHUB • LEETCODE • CLERK • DB
                    </p>
                </div>
                <div className="text-right pointer-events-auto mr-0 lg:mr-10">
                    <a href="#"
                        className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-[#A0A0A0] hover:text-[#D4F23F] transition-colors border-b border-white/20 hover:border-[#D4F23F] pb-1"
                        onMouseEnter={() => { setIsHovering(true); playBeep('hover'); }}
                        onMouseLeave={() => setIsHovering(false)}
                        onClick={() => playBeep('click')}
                    >
                        View Documentation
                    </a>
                </div>
            </footer>

            {/* Distant Navigation (Brutalist spread out) - Fixed */}
            <nav className="fixed top-8 inset-x-0 w-full z-[100] px-8 mx-auto flex items-start justify-between mix-blend-difference pointer-events-none">
                <div className="w-1/3 pt-12 md:pl-24 hidden md:block pointer-events-auto">
                    <button
                        onClick={scrollToFeatures}
                        className="text-xs font-bold tracking-widest uppercase hover:text-[#D4F23F] text-[#A0A0A0] transition-all glitch"
                        data-text="Explore Modules"
                        onMouseEnter={() => { setIsHovering(true); playBeep('hover'); }}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        Explore Modules
                    </button>
                </div>
                <div className="w-full md:w-1/3 flex justify-center pt-2 pointer-events-auto">
                    <div
                        className="flex items-center gap-2 group cursor-pointer"
                        onClick={() => { playBeep('click'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        onMouseEnter={() => { setIsHovering(true); playBeep('hover'); }}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <Layers className="w-8 h-8 text-white group-hover:text-[#D4F23F] transition-colors duration-500" strokeWidth={2.5} />
                    </div>
                </div>
                <div className="w-full md:w-1/3 flex justify-end gap-6 md:pr-12 pt-12 pointer-events-auto">
                    <SignInButton mode="modal">
                        <button
                            className="text-xs font-bold tracking-[0.1em] uppercase text-[#A0A0A0] hover:text-[#D4F23F] hover:tracking-[0.2em] transition-all duration-300"
                            onMouseEnter={() => { setIsHovering(true); playBeep('hover'); }}
                            onMouseLeave={() => setIsHovering(false)}
                            onClick={() => playBeep('click')}
                        >
                            SignIn
                        </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <button
                            className="text-xs font-bold tracking-[0.1em] uppercase text-black bg-white hover:bg-[#D4F23F] px-4 py-1 flex items-center gap-2 transition-all duration-300 shadow-[4px_4px_0_rgba(255,255,255,0.2)] hover:-translate-y-1 hover:shadow-[4px_8px_0_rgba(212,242,63,0.3)] border border-transparent"
                            onMouseEnter={() => { setIsHovering(true); playBeep('hover'); }}
                            onMouseLeave={() => setIsHovering(false)}
                            onClick={() => playBeep('click')}
                        >
                            Initialize
                        </button>
                    </SignUpButton>
                </div>
            </nav>

            {/* Main Scrolling Content Area */}
            <div className="relative z-10 w-full">

                {/* Hero Section */}
                <section className="w-full h-screen relative flex flex-col justify-center overflow-hidden">
                    <motion.div
                        style={{ y: heroY, opacity: heroOpacity }}
                        className="relative z-10 w-full flex flex-col items-center pointer-events-none"
                    >
                        <motion.h1
                            initial={{ y: 100, opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0% 0%)' }}
                            animate={{ y: 0, opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[16vw] sm:text-[18vw] font-black tracking-tighter leading-[0.8] text-white uppercase text-center mix-blend-difference w-full glitch"
                            data-text="DEV"
                        >
                            DEV
                        </motion.h1>
                        <motion.h1
                            initial={{ y: -100, opacity: 0, clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)' }}
                            animate={{ y: 0, opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
                            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[16vw] sm:text-[18vw] font-black tracking-widest leading-[0.8] text-white uppercase text-center mix-blend-difference w-full ml-[6vw] glitch"
                            data-text=" OS"
                        >
                            <span className="text-[#D4F23F] inline-block mix-blend-normal transform -translate-y-[2vw]">O</span>S
                        </motion.h1>

                        {/* Subtitle strictly aligned to center bottom */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 1 }}
                            className="absolute bottom-[-20vh] max-w-sm text-center font-mono text-[11px] tracking-[0.3em] uppercase leading-relaxed text-[#A0A0A0] pointer-events-auto"
                        >
                            The unified dashboard for high-frequency <br /> engineering and deep technical work.<br /><br />
                            <span className="animate-bounce inline-block mt-4 opacity-50 text-[#D4F23F]">↓ SCROLL TO EXPLORE</span>
                        </motion.div>
                    </motion.div>

                    {/* Floating Abstract "Obj" Elements (Parallax) */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        {/* 3D-esque Code Block */}
                        <FloatingElement delay={0.3} initialPosition={{ x: '10vw', y: '20vh' }} rotate={-15} scale={1.2} mousePosition={mousePosition}>
                            <div className="bg-[#111] border border-[#333] p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-2 backdrop-blur-xl">
                                <div className="flex gap-1.5 mb-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                </div>
                                <div className="h-2 w-24 bg-[#D4F23F]/80 rounded"></div>
                                <div className="h-2 w-16 bg-[#D4F23F]/40 rounded"></div>
                                <div className="h-2 w-32 bg-[#D4F23F]/60 rounded"></div>
                            </div>
                        </FloatingElement>

                        {/* Geometric shape 1 */}
                        <FloatingElement delay={0.6} initialPosition={{ x: '75vw', y: '15vh' }} rotate={25} scale={1.5} mousePosition={mousePosition}>
                            <div className="w-16 h-16 border-4 border-[#D4F23F] rounded-full drop-shadow-[0_0_15px_rgba(212,242,63,0.5)] blur-[1px]"></div>
                        </FloatingElement>

                        {/* Terminal Icon */}
                        <FloatingElement delay={0.4} initialPosition={{ x: '80vw', y: '65vh' }} rotate={10} scale={1.8} mousePosition={mousePosition}>
                            <div className="bg-white text-black p-4 rounded bg-opacity-90 backdrop-blur-md rotate-[-5deg]">
                                <TerminalIcon className="w-8 h-8" strokeWidth={3} />
                            </div>
                        </FloatingElement>

                        {/* Database Icon / Data viz placeholder */}
                        <FloatingElement delay={0.8} initialPosition={{ x: '5vw', y: '70vh' }} rotate={-20} scale={1.4} mousePosition={mousePosition}>
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#111] to-[#333] border border-[#444] flex items-center justify-center overflow-hidden shadow-2xl relative">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_5s_infinite]"></div>
                                <Database className="w-8 h-8 text-[#A0A0A0]" strokeWidth={1.5} />
                            </div>
                        </FloatingElement>

                        {/* Micro-sticker */}
                        <FloatingElement delay={1} initialPosition={{ x: '50vw', y: '85vh' }} rotate={5} scale={1} mousePosition={mousePosition}>
                            <div className="bg-[#D4F23F] text-black px-3 py-1 text-[10px] font-black tracking-widest uppercase rotate-[-5deg] inline-block shadow-lg">
                                Auth. Required
                            </div>
                        </FloatingElement>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full max-w-[90vw] lg:max-w-[75vw] mx-auto py-32 relative z-30 bg-[#020202]">
                    <div className="mb-32">
                        <RevealText>
                            <h2 className="text-[10vw] md:text-[8vw] font-black tracking-tighter uppercase leading-[0.8] mb-8 glitch" data-text="Engineering Protocol.">
                                Engineering <br /> <span className="text-white/20">Protocol.</span>
                            </h2>
                        </RevealText>
                        <RevealText delay={0.2}>
                            <p className="font-mono text-sm tracking-[0.2em] text-[#A0A0A0] uppercase max-w-xl">
                                DevOS removes the noise of scattered tools. It enforces strict, data-driven workflows for developers who treat careers like complex systems.
                            </p>
                        </RevealText>
                    </div>

                    <div className="w-full flex flex-col gap-0 border-b border-white/10 mb-32">
                        <FeatureBlock
                            number="01"
                            title="GitHub Matrix"
                            subtitle="Telemetry for Your Repositories"
                            description="Visualize commit history and repo interactions with surgical precision. Keep the streak alive and maintain velocity without checking five different tabs."
                            onHover={setIsHovering}
                        />
                        <FeatureBlock
                            number="02"
                            title="DSA Intelligence"
                            subtitle="Algorithmic Mastery"
                            description="Sync your LeetCode progress. Track topics, analyze runtime complexity metrics, and prepare for technical screenings with cold, hard data."
                            onHover={setIsHovering}
                        />
                        <FeatureBlock
                            number="03"
                            title="Daily Tactics"
                            subtitle="Unrelenting Execution"
                            description="Define strict, non-negotiable daily objectives. Build momentum block by block within a distraction-free, high-contrast interface."
                            onHover={setIsHovering}
                        />
                        <FeatureBlock
                            number="04"
                            title="AI Review"
                            subtitle="Pre-merge Analysis"
                            description="Catch security flaws and anti-patterns before they hit production using context-aware static analysis tied directly to your workflow."
                            onHover={setIsHovering}
                        />
                    </div>

                    {/* Interactive Terminal Section */}
                    <div className="w-full py-20 mb-32"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}>
                        <RevealText>
                            <InteractiveTerminal />
                        </RevealText>
                    </div>

                    {/* Huge CTA Section */}
                    <div className="w-full pb-32 flex flex-col items-center justify-center text-center">
                        <RevealText>
                            <h2 className="text-[12vw] font-black tracking-tighter uppercase leading-[0.8] mb-12 hover:text-[#D4F23F] transition-colors duration-500 cursor-none glitch" data-text="INITIATE">
                                INITIATE
                            </h2>
                        </RevealText>
                        <RevealText delay={0.2}>
                            <SignUpButton mode="modal">
                                <button
                                    className="text-xl md:text-2xl font-black uppercase bg-white text-black px-12 py-6 flex items-center gap-4 transition-all hover:bg-[#D4F23F] group pointer-events-auto"
                                    onMouseEnter={() => { setIsHovering(true); playBeep('hover'); }}
                                    onMouseLeave={() => setIsHovering(false)}
                                    onClick={() => playBeep('click')}
                                >
                                    Create Profile
                                    <div className="w-3 h-3 bg-black rounded-full group-hover:scale-150 transition-transform"></div>
                                </button>
                            </SignUpButton>
                        </RevealText>
                    </div>

                </section>

            </div>

            {/* Blank padding at the bottom so the final CTA scroll completely clears the HUD footer */}
            <div className="h-32 w-full bg-[#020202] relative z-20"></div>

        </div>
    );
};

export default LandingPage;
