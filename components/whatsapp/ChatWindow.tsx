'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble, { type Message } from './MessageBubble';
import InputBox from './InputBox';

// ---------------------------------------------------------------------------
// Bilingual prompts for each registration step
// ---------------------------------------------------------------------------
type Lang = 'en' | 'hi';

interface StepConfig {
  prompt: Record<Lang, string>;
  field: string;
  inputType: 'text' | 'file' | 'files' | 'text-or-file';
  accept?: string;
  multiple?: boolean;
}

const STEPS: StepConfig[] = [
  {
    prompt: {
      en: 'Please enter your full name.',
      hi: 'Kripya apna poora naam darj karein.',
    },
    field: 'name',
    inputType: 'text',
  },
  {
    prompt: {
      en: 'Please enter your full address.',
      hi: 'Kripya apna poora pata darj karein.',
    },
    field: 'address',
    inputType: 'text',
  },
  {
    prompt: {
      en: 'Please enter your 12-digit Aadhaar number.',
      hi: 'Kripya apna 12-digit Aadhaar number darj karein.',
    },
    field: 'aadhaar_number',
    inputType: 'text',
  },
  {
    prompt: {
      en: 'Please upload a clear photo of your Aadhaar card.',
      hi: 'Kripya apne Aadhaar card ki saaf photo upload karein.',
    },
    field: 'aadhaar_image',
    inputType: 'file',
    accept: 'image/*',
  },
  {
    prompt: {
      en: 'What is the name of your product / craft?',
      hi: 'Aapke product / shilp ka naam kya hai?',
    },
    field: 'product_name',
    inputType: 'text',
  },
  {
    prompt: {
      en: 'Tell us your story as an artisan. You can type your story or upload a short video about yourself.',
      hi: 'Hume apni kahani bataiye ek shilpkaar ke roop mein. Aap apni kahani likh sakte hain ya apne baare mein ek chhota video upload kar sakte hain.',
    },
    field: 'artist_story',
    inputType: 'text-or-file',
    accept: 'video/*',
  },
];

// ---------------------------------------------------------------------------
// Helper to create a unique message ID
// ---------------------------------------------------------------------------
let _msgSeq = 0;
function msgId(): string {
  return `msg-${Date.now()}-${++_msgSeq}`;
}

// ---------------------------------------------------------------------------
// ChatWindow Component
// ---------------------------------------------------------------------------
export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(-1); // -1 = awaiting "Hi", 0 = language, 1-9 = registration steps
  const [language, setLanguage] = useState<Lang>('en');
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isTyping]);

  // ---------------------------------------------------------------------------
  // Persistence: Load from sessionStorage on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const saved = sessionStorage.getItem('kala_kendra_chat_state');
    if (saved) {
      try {
        const { messages: m, step: s, language: l, formData: f, submitted: sub } = JSON.parse(saved);
        setMessages(m.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
        setStep(s);
        setLanguage(l);
        setFormData(f);
        setSubmitted(sub);
      } catch (e) {
        console.error('Failed to load chat state', e);
      }
    } else {
      // First time greeting
      setTimeout(() => {
        setMessages([
          {
            id: msgId(),
            text: '🙏 Namaste! Welcome to Kala-Kendra.\nType "Hi" to begin your artisan registration.',
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
          },
        ]);
      }, 500);
    }
    setIsLoaded(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Persistence: Save to sessionStorage on change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isLoaded) return;
    const state = { messages, step, language, formData, submitted };
    sessionStorage.setItem('kala_kendra_chat_state', JSON.stringify(state));
  }, [messages, step, language, formData, submitted, isLoaded]);

  // ---------------------------------------------------------------------------
  // Reset function
  // ---------------------------------------------------------------------------
  const resetChat = () => {
    sessionStorage.removeItem('kala_kendra_chat_state');
    window.location.reload();
  };

  // ---------------------------------------------------------------------------
  // Bot message helper with simulated typing delay
  // ---------------------------------------------------------------------------
  const addBotMessage = useCallback(
    (
      text: string,
      extra?: Partial<Message>,
      delay = 800,
    ): Promise<void> => {
      return new Promise((resolve) => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: msgId(),
              text,
              sender: 'bot',
              timestamp: new Date(),
              type: 'text',
              ...extra,
            },
          ]);
          resolve();
        }, delay);
      });
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Ask the current registration step question
  // ---------------------------------------------------------------------------
  const askStep = useCallback(
    async (stepIndex: number) => {
      const config = STEPS[stepIndex];
      if (!config) return;
      const stepLabel = `Step ${stepIndex + 1}/${STEPS.length}`;
      await addBotMessage(config.prompt[language], { stepInfo: stepLabel });
    },
    [language, addBotMessage],
  );

  // ---------------------------------------------------------------------------
  // Upload a file
  // ---------------------------------------------------------------------------
  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/whatsapp/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json.url as string;
  };

  // ---------------------------------------------------------------------------
  // Submit collected data to the API
  // ---------------------------------------------------------------------------
  const submitRegistration = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        const res = await fetch('/api/whatsapp/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, language, status: 'pending' }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Submission failed');
        setRegistrationResult(json);

        // Registration success
        setTimeout(async () => {
          const msg =
            language === 'hi'
              ? `✅ Dhanyavaad! Aapka registration poora ho gaya hai.\n\n📧 Email: ${json.credentials.email}\n🔑 Password: ${json.credentials.password}\n\nAb aap niche diye gaye button se Login karein aur apna kaam dikhayein.`
              : `✅ Thank you! Your registration is complete.\n\n📧 Email: ${json.credentials.email}\n🔑 Password: ${json.credentials.password}\n\nPlease click the button below to Login and start showcasing your work.`;
          
          await addBotMessage(msg, {
            type: 'option',
            options: [language === 'hi' ? 'Login Page par Jayein 🔗' : 'Go to Login Page 🔗']
          });
        }, 1500);
      } catch (err) {
        console.error('Registration error:', err);
        await addBotMessage(
          language === 'hi'
            ? '⚠️ Kuch gadbad ho gayi. Kripya dobara koshish karein.'
            : '⚠️ Something went wrong. Please try again later.',
        );
      }
    },
    [language, addBotMessage],
  );

  // ---------------------------------------------------------------------------
  // Handle user text input
  // ---------------------------------------------------------------------------
  const handleSend = async (text: string) => {
    if (text === '/reset') {
      resetChat();
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: msgId(), text, sender: 'user', timestamp: new Date(), type: 'text' },
    ]);

    if (step === -1) {
      if (/^(hi|hello|hey|namaste)/i.test(text)) {
        setStep(0);
        await addBotMessage(
          'Aap kis language mein baat karna chahte hain?\nWhich language would you like to continue in?',
          { type: 'option', options: ['English', 'Hindi'] },
        );
      } else {
        await addBotMessage('Please type "Hi" to start. 🙏');
      }
      return;
    }

    if (step >= 1 && step <= STEPS.length) {
      const config = STEPS[step - 1];

      if (config.field === 'aadhaar_number') {
        const cleanAadhaar = text.replace(/\s/g, '');
        const isValid = /^\d{12}$/.test(cleanAadhaar);
        if (!isValid) {
          const errorMsg =
            language === 'hi'
              ? '⚠️ Kripya sahi 12-digit Aadhaar number darj karein.'
              : '⚠️ Please enter a valid 12-digit Aadhaar number.';
          await addBotMessage(errorMsg);
          return;
        }
      }

      if (config.inputType === 'text' || config.inputType === 'text-or-file') {
        const updated = { ...formData, [config.field]: text };
        setFormData(updated);

        if (step < STEPS.length) {
          setStep(step + 1);
          await askStep(step);
        } else {
          setSubmitted(true);
          setStep(step + 1);
          await submitRegistration(updated);
        }
      } else {
        const hint =
          language === 'hi'
            ? '📎 Kripya file upload karein (clip icon use karein).'
            : '📎 Please upload a file using the attachment icon.';
        await addBotMessage(hint);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Handle option selection
  // ---------------------------------------------------------------------------
  const handleOptionSelect = async (option: string) => {
    setMessages((prev) => [
      ...prev,
      { id: msgId(), text: option, sender: 'user', timestamp: new Date(), type: 'text' },
    ]);

    if (step === 0) {
      const lang: Lang = option === 'Hindi' ? 'hi' : 'en';
      setLanguage(lang);
      setStep(1);

      const welcome =
        lang === 'hi'
          ? '👋 Swaagat hai! Aapka registration shuru karte hain.\nKripya neeche diye gaye sawaalon ka jawaab dein.'
          : '👋 Welcome! Let\'s begin your registration.\nPlease answer the following questions.';
      await addBotMessage(welcome);
      const config = STEPS[0];
      const stepLabel = `Step 1/${STEPS.length}`;
      await addBotMessage(config.prompt[lang], { stepInfo: stepLabel }, 600);
      return;
    }

    if (option.includes('Login Page')) {
      window.location.href = '/login';
      return;
    }
  };

  // ---------------------------------------------------------------------------
  // Handle file uploads
  // ---------------------------------------------------------------------------
  const handleFileUpload = async (files: FileList) => {
    if (step < 1 || step > STEPS.length) return;
    const config = STEPS[step - 1];

    if (
      config.inputType !== 'file' &&
      config.inputType !== 'files' &&
      config.inputType !== 'text-or-file'
    )
      return;

    setIsTyping(true);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadFile(file);
        uploadedUrls.push(url);

        const fileType: 'image' | 'video' | 'document' = file.type.startsWith('image')
          ? 'image'
          : file.type.startsWith('video')
            ? 'video'
            : 'document';

        setMessages((prev) => [
          ...prev,
          {
            id: msgId(),
            text: '',
            sender: 'user',
            timestamp: new Date(),
            type: 'file-preview',
            fileUrl: url,
            fileName: file.name,
            fileType,
          },
        ]);
      }

      setIsTyping(false);

      // Update formData
      const newValue = config.multiple ? uploadedUrls : uploadedUrls[0];
      const updatedFormData = { ...formData, [config.field]: newValue };
      setFormData(updatedFormData);

      // Confirmation
      const confirmMsg =
        language === 'hi' ? '✅ File(s) upload ho gayi!' : '✅ File(s) uploaded successfully!';
      await addBotMessage(confirmMsg, undefined, 400);

      // Auto-advance
      if (step < STEPS.length) {
        setStep(step + 1);
        await askStep(step);
      } else {
        setSubmitted(true);
        setStep(step + 1);
        await submitRegistration(updatedFormData);
      }
    } catch (err) {
      setIsTyping(false);
      console.error('Upload error:', err);
      const errMsg =
        language === 'hi'
          ? '⚠️ Upload mein samasya aayi. Kripya dobara try karein.'
          : '⚠️ Upload failed. Please try again.';
      await addBotMessage(errMsg);
    }
  };

  // ---------------------------------------------------------------------------
  // Input Box Configuration
  // ---------------------------------------------------------------------------
  const getInputConfig = () => {
    if (submitted || step > STEPS.length) {
      return { accept: undefined, multiple: false, placeholder: 'Registration complete' };
    }
    if (step >= 1 && step <= STEPS.length) {
      const config = STEPS[step - 1];
      return {
        accept: config.accept,
        multiple: config.multiple || false,
        placeholder:
          config.inputType === 'file' || config.inputType === 'files'
            ? language === 'hi'
              ? '📎 File upload karein...'
              : '📎 Upload a file...'
            : config.inputType === 'text-or-file'
              ? language === 'hi'
                ? 'Type karein ya file upload karein...'
                : 'Type or upload a file...'
              : language === 'hi'
                ? 'Yahan type karein...'
                : 'Type here...',
      };
    }
    return { accept: undefined, multiple: false, placeholder: 'Type a message...' };
  };

  const inputConfig = getInputConfig();

  if (!isLoaded) return null; // Prevent hydration jump

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#ECE5DD',
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onOptionSelect={handleOptionSelect} />
        ))}
        {isTyping && (
          <MessageBubble
            message={{
              id: 'typing',
              text: '',
              sender: 'bot',
              timestamp: new Date(),
              type: 'typing',
            }}
          />
        )}
      </div>

      {/* Input area */}
      <InputBox
        onSend={handleSend}
        onFileUpload={handleFileUpload}
        disabled={isTyping || submitted}
        placeholder={inputConfig.placeholder}
        acceptFileTypes={inputConfig.accept}
        multipleFiles={inputConfig.multiple}
      />
    </div>
  );
}
