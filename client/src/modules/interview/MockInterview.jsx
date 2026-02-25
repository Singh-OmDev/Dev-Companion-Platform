import React, { useState, useRef, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Play, Send, CheckCircle, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const MockInterview = () => {
    const [topic, setTopic] = useState('');
    const [isInterviewing, setIsInterviewing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Interview State
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [history, setHistory] = useState([]); // Array of { q, a, score, feedback }

    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, currentQuestion]);

    const handleStart = async () => {
        if (!topic.trim()) return;

        setIsLoading(true);
        try {
            const res = await api.post('/ai/interview/start', { topic });
            setCurrentQuestion(res.data.question);
            setHistory([]);
            setIsInterviewing(true);
        } catch (err) {
            console.error("Failed to start interview", err);
            alert("Failed to start interview. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerSubmit = async () => {
        if (!userAnswer.trim() || !currentQuestion) return;

        setIsLoading(true);
        const currentAns = userAnswer;
        const currentQ = currentQuestion;

        // Optimistically clear input to feel responsive
        setUserAnswer('');
        setCurrentQuestion(null);

        try {
            const formattedHistory = history.map(h => ({ q: h.q, a: h.a }));

            const res = await api.post('/ai/interview/answer', {
                topic,
                question: currentQ,
                answer: currentAns,
                history: formattedHistory
            });

            // Add the graded round to history
            setHistory(prev => [...prev, {
                q: currentQ,
                a: currentAns,
                score: res.data.score,
                feedback: res.data.feedback
            }]);

            // Set the next question
            setCurrentQuestion(res.data.nextQuestion);

        } catch (err) {
            console.error("Failed to submit answer", err);
            alert("Error grading answer. Please try again.");
            setCurrentQuestion(currentQ); // Restore question on failure
            setUserAnswer(currentAns);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnd = () => {
        if (window.confirm("Are you sure you want to end this mock interview?")) {
            setIsInterviewing(false);
            setTopic('');
            setCurrentQuestion(null);
            setHistory([]);
            setUserAnswer('');
        }
    };

    const getScoreColor = (score) => {
        if (score >= 8) return 'text-green-500';
        if (score >= 5) return 'text-yellow-500';
        return 'text-red-500';
    };

    // Calculate moving average score if history exists
    const averageScore = history.length > 0
        ? (history.reduce((sum, item) => sum + item.score, 0) / history.length).toFixed(1)
        : 0;

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Technical Mock Interviewer</h1>
                    <p className="text-textSecondary mt-1">Practice technical interviews with an automated testing system.</p>
                </div>
                {isInterviewing && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-surfaceHighlight px-4 py-2 rounded-full border border-border">
                            <span className="text-sm text-textSecondary">Average Score:</span>
                            <span className={`font-bold ${getScoreColor(averageScore)}`}>{averageScore}/10</span>
                        </div>
                        <Button variant="danger" onClick={handleEnd}>End Interview</Button>
                    </div>
                )}
            </div>

            {!isInterviewing ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Ready to practice?</h2>
                    <p className="text-textSecondary max-w-md mx-auto mb-8">
                        Enter a job role, specific technology, or topic you want to be interviewed on. The system will ask you technical questions, grade your answers, and provide feedback.
                    </p>

                    <div className="w-full max-w-md flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="e.g., React Frontend Developer, Node.js, System Design"
                            className="w-full bg-background border border-border rounded-lg p-4 text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-primary transition-colors"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                        />
                        <Button
                            className="w-full py-4 text-lg"
                            onClick={handleStart}
                            disabled={!topic.trim() || isLoading}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                <>
                                    <Play className="w-5 h-5 mr-2" /> Start Mock Interview
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="flex flex-col h-[70vh] gap-6">
                    {/* Interview History Log */}
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                        {history.map((item, index) => (
                            <div key={index} className="space-y-4">
                                {/* Question */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-primary" />
                                    </div>
                                    <Card className="flex-1 border-primary/20 bg-primary/5">
                                        <h4 className="text-sm text-primary font-semibold mb-2">Interviewer (Question {index + 1})</h4>
                                        <p className="whitespace-pre-wrap">{item.q}</p>
                                    </Card>
                                </div>

                                {/* Answer & Feedback */}
                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex-shrink-0 flex items-center justify-center">
                                        <span className="font-bold text-sm">YOU</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-end gap-2">
                                        <div className="bg-surfaceHighlight border border-border rounded-lg p-4 max-w-[85%] text-left">
                                            <p className="whitespace-pre-wrap">{item.a}</p>
                                        </div>

                                        {/* System Feedback Box */}
                                        <div className="bg-background border border-border rounded-lg p-4 max-w-[85%] text-left w-full relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-1 h-full ${item.score >= 7 ? 'bg-green-500' : item.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="text-xs font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> System Evaluation
                                                </h5>
                                                <span className={`font-bold text-sm ${getScoreColor(item.score)}`}>Score: {item.score}/10</span>
                                            </div>
                                            <p className="text-sm text-textSecondary">{item.feedback}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Current Question */}
                        {currentQuestion && (
                            <div className="flex gap-4 animate-fade-in">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                </div>
                                <Card className="flex-1 border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                                    <h4 className="text-sm text-primary font-semibold mb-2">Interviewer {history.length > 0 ? '(Logically following up)' : ''}</h4>
                                    <p className="text-lg">{currentQuestion}</p>
                                </Card>
                            </div>
                        )}

                        {isLoading && !currentQuestion && (
                            <div className="flex gap-4 animate-fade-in">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                </div>
                                <Card className="flex-1 bg-surfaceHighlight border-0">
                                    <p className="text-textSecondary animate-pulse">Evaluating your answer and formulating the next question...</p>
                                </Card>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <Card className="mt-auto border-border">
                        <div className="flex flex-col gap-3">
                            <textarea
                                className="w-full bg-background border border-border rounded-lg p-4 text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-y"
                                placeholder="Type your answer here... Be as technical and detailed as possible."
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                disabled={isLoading || !currentQuestion}
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-textSecondary">
                                    {userAnswer.length > 0 ? `${userAnswer.length} characters` : 'Take your time and structure your answer clearly.'}
                                </span>
                                <Button
                                    onClick={handleAnswerSubmit}
                                    disabled={!userAnswer.trim() || isLoading || !currentQuestion}
                                    className="px-6"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>Submit Answer <Send className="w-4 h-4 ml-2" /></>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )
            }
        </div >
    );
};

export default MockInterview;
