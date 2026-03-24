'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Mic, MicOff, Loader2, Phone, PhoneOff, Volume2 } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner';

const VAPI_PUBLIC_KEY = 'ee0e1ff3-5a7c-49de-b395-478d132f08d6';
// NOTE: Ideally, use a specific Assistant ID designed for BUYERS here. 
// For now, using the available one.
const VAPI_BUYER_ASSISTANT_ID = 'c2691d4b-7380-4641-b181-4479c8a6f099';

let vapiInstance: Vapi | null = null;

export interface ChatProduct {
  _id: string;
  name: string;
  images?: string[];
  basePrice: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: ChatProduct[];
}

export default function BuyerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false); // Dictation mode
  const [isCalling, setIsCalling] = useState(false); // Vapi live call mode
  const [vapiVolume, setVapiVolume] = useState(0); 
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Initialize with a greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: 'Hello! I am your Kala-Kendra AI Assistant. How can I help you find authentic MP crafts today?'
        }
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = messages.map(m => ({ role: m.role, content: m.content })).concat({ role: 'user', content: text });
      
      const res = await fetch('/api/ai/buyer-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.reply,
          products: data.products
        }]);
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I am having trouble connecting right now.'
      }]);
    }

    setIsLoading(false);
  };

  const playBeep = (type: 'start' | 'stop') => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      if (type === 'start') {
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch for start
      } else {
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // Low pitch for stop
      }
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn('AudioContext not supported');
    }
  };

  const toggleCall = async () => {
    if (!vapiInstance) {
      vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
    }

    if (isCalling) {
      vapiInstance.stop();
      setIsCalling(false);
      return;
    }

    try {
      setIsCalling(true);
      await vapiInstance.start(VAPI_BUYER_ASSISTANT_ID);
      toast.success('Live AI Call Connected!');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vapiInstance.on('message', async (message: any) => {
        // Log to console so we can see what Vapi is sending
        console.log("VAPI Event:", message);
        
        // Handle Vapi client tool calls to display products
        if (message.type === 'tool-calls' || message.type === 'function-call') {
            // Check all possible shapes the Vapi SDK might use for tool calls
            const toolCalls = message.toolCalls || message.toolCallList || (message.functionCall ? [message.functionCall] : []);
            
            for (const toolCall of toolCalls) {
               // Extract the function name and arguments securely
               const functionName = toolCall.name || toolCall.function?.name;
               
               if (functionName === 'search_market_products') {
                 const argsRaw = toolCall.arguments || toolCall.function?.arguments || toolCall.parameters || '{}';
                 const args = typeof argsRaw === 'string' ? JSON.parse(argsRaw) : argsRaw;
                 const query = args.query || args.search || 'items';
                 
                 toast.info(`Looking up: ${query}...`);
                 
                 try {
                   // Create a temporary "Thinking..." message 
                   const tempId = Date.now().toString();
                   setMessages(prev => [...prev, { id: tempId, role: 'assistant', content: `Displaying ${query} for you...` }]);

                   const res = await fetch('/api/ai/buyer-chat', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ messages: [{ role: 'user', content: `Show me ${query}` }] })
                   });
                   
                   if (res.ok) {
                     const data = await res.json();
                     
                     // Update the chat message to have the actual products
                     setMessages(prev => prev.map(m => 
                        m.id === tempId ? { ...m, content: `Here are some beautiful ${query}.`, products: data.products } : m
                     ));
                     
                     // Return result to Vapi so the voice can say it found the items
                     vapiInstance?.send({
                       type: 'tool-call-result',
                       toolCallId: toolCall.id,
                       result: `Successfully displayed ${data.products?.length || 0} products on the user's screen.`
                     } as any);
                   }
                 } catch(e) {
                   console.error(e);
                 }
               }
            }
        }
      });

      vapiInstance.on('volume-level', (volume: number) => {
        setVapiVolume(volume);
      });

      vapiInstance.on('call-end', () => {
        setIsCalling(false);
        setVapiVolume(0);
        toast.info('Call ended');
      });

      vapiInstance.on('error', (err) => {
        console.error('Vapi error:', err);
        setIsCalling(false);
        setVapiVolume(0);
        toast.error('Voice assistant error');
      });

    } catch (e) {
      console.error(e);
      setIsCalling(false);
      toast.error('Could not start call.');
    }
  };

  const toggleListen = () => {
    if (isListening) return; // handled by standard speech recognition 'end' event
    
    // Check support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Input. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian English, supports mixing Hindi
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      playBeep('start');
      setIsListening(true);
    };

    let beepPlayed = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.onerror = (event: Event) => {
      console.error('Speech error', event);
      if (!beepPlayed) {
        playBeep('stop');
        beepPlayed = true;
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (!beepPlayed) {
        playBeep('stop');
        beepPlayed = true;
      }
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-amber-500 hover:bg-amber-600 text-white z-50 p-0"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[600px] shadow-2xl flex flex-col z-50 overflow-hidden border-amber-500/20">
          <CardHeader className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Kala-Kendra AI Assistant
            </CardTitle>
            <div className="flex gap-1 items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleCall} 
                className={`h-8 w-8 hover:bg-white/20 transition-all ${isCalling ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' : 'text-white/90'}`}
                title={isCalling ? "End Call" : "Live Voice Call"}
              >
                {isCalling ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:text-white/80 hover:bg-white/10 h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-background">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Always keep chat history visible so product cards show during calls */}
              <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                <div className="flex flex-col gap-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-amber-500 text-white rounded-br-none' 
                          : 'bg-muted rounded-bl-none'
                      }`}>
                        {msg.content}
                      </div>
                      
                      {/* Render Recommended Products if any */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="w-full mt-2 grid gap-2 grid-cols-2">
                          {msg.products.map(p => (
                            <div key={p._id} className="border bg-card rounded-md overflow-hidden flex flex-col text-xs shadow-sm">
                              <div className="h-20 bg-muted relative">
                                {p.images?.[0] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.images[0]} alt={p.name} className="object-cover w-full h-full" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                                )}
                              </div>
                              <div className="p-2">
                                <p className="font-semibold truncate">{p.name}</p>
                                <p className="text-amber-600">₹{p.basePrice * 1.15}</p>
                                <a href={`/buyer/product/${p._id}`} target="_blank" className="text-blue-500 hover:underline mt-1 block">View</a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start">
                      <div className="bg-muted rounded-2xl p-3 text-sm rounded-bl-none flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Show Calling Voice Overlay OR Text Input Area at bottom */}
              {isCalling ? (
                <div className="p-4 border-t bg-amber-500/10 flex flex-col items-center justify-center animate-in slide-in-from-bottom-2">
                  <div className="relative mb-2 flex items-center justify-center">
                    <div 
                      className="absolute inset-0 bg-amber-500 rounded-full opacity-30"
                      style={{ transform: `scale(${1 + vapiVolume * 2})`, transition: 'transform 0.1s ease-out' }}
                    />
                    <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center relative z-10">
                      <Volume2 className="h-6 w-6 text-white animate-pulse" />
                    </div>
                  </div>
                  <p className="text-xs text-amber-700 font-medium mb-3">Live Assistant Active</p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="rounded-full shadow-md text-xs h-8 px-6"
                    onClick={toggleCall}
                  >
                    <PhoneOff className="h-3 w-3 mr-2" /> End Call
                  </Button>
                </div>
              ) : (
                <div className="p-3 border-t bg-card flex items-center gap-2">
                  <div className="relative flex shrink-0">
                    {isListening && (
                      <span className="absolute inset-0 rounded-md animate-ping bg-amber-500 opacity-30"></span>
                    )}
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className={`relative z-10 transition-all ${isListening ? 'bg-amber-100 text-amber-600 border-amber-500 scale-105' : ''}`}
                      onClick={toggleListen}
                    >
                      {isListening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type your request..." 
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    size="icon" 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="bg-amber-500 hover:bg-amber-600 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
