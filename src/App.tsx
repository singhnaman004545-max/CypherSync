/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Copy, Check, Key } from 'lucide-react';

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~';
    const alphabet = letters.split('');

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100; // Start drops at random heights above screen
    }

    const draw = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = 'rgba(9, 9, 11, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#10b981'; // Emerald green
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        // Only draw if drop is on screen
        if (drops[i] * fontSize > 0) {
          const text = alphabet[Math.floor(Math.random() * alphabet.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        }

        // Reset drop to top randomly after it passes the screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-20"
    />
  );
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const CUSTOM_ALPHABET = "qWeRtYuIoPaSdFgHjKlZxCvBnM1234567890!@#$%^&*()_+-=[]{}|;:,.<>?/~`'";

function encryptText(text: string, key: string = "secret_key_123"): string {
    if (!text) return "";
    if (!key) key = "secret_key_123";
    try {
        const textBytes = new TextEncoder().encode(text);
        const keyBytes = new TextEncoder().encode(key);
        const encryptedBytes = new Uint8Array(textBytes.length);
        for (let i = 0; i < textBytes.length; i++) {
            encryptedBytes[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        const binString = Array.from(encryptedBytes, (byte) => String.fromCodePoint(byte)).join("");
        const b64 = btoa(binString);
        
        let res = "";
        for(let char of b64) {
            let idx = ALPHABET.indexOf(char);
            if(idx !== -1) res += CUSTOM_ALPHABET[idx];
            else res += char;
        }
        return res;
    } catch (e) {
        return "";
    }
}

function decryptText(customText: string, key: string = "secret_key_123"): string {
    if (!customText) return "";
    if (!key) key = "secret_key_123";
    try {
        let b64 = "";
        for(let char of customText) {
            let idx = CUSTOM_ALPHABET.indexOf(char);
            if(idx !== -1) b64 += ALPHABET[idx];
            else b64 += char;
        }
        
        const binString = atob(b64);
        const encryptedBytes = new Uint8Array(binString.length);
        for (let i = 0; i < binString.length; i++) {
            encryptedBytes[i] = binString.codePointAt(i)!;
        }
        const keyBytes = new TextEncoder().encode(key);
        const decryptedBytes = new Uint8Array(encryptedBytes.length);
        for (let i = 0; i < encryptedBytes.length; i++) {
            decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        return new TextDecoder().decode(decryptedBytes);
    } catch (e) {
        return "Error: Invalid secret message.";
    }
}

export default function App() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [input, setInput] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const activeKey = customKey || "secret_key_123";
    if (mode === 'encrypt') {
      setOutput(encryptText(input, activeKey));
    } else {
      setOutput(decryptText(input, activeKey));
    }
  }, [input, mode, customKey]);

  const handleCopy = async () => {
    if (!output || output.startsWith('Error')) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <MatrixRain />
      
      {/* Main Container */}
      <div className="w-full max-w-4xl bg-zinc-900/70 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md relative z-10">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Lock className="w-7 h-7 text-emerald-400" />
              CipherSync
            </h1>
            <p className="text-zinc-400 mt-2 text-sm sm:text-base max-w-md">
              Convert your messages into an unrecognizable secret language of symbols, numbers, and letters.
            </p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center bg-zinc-950/50 rounded-full p-1 border border-zinc-800 shrink-0">
            <button
              onClick={() => { setMode('encrypt'); setInput(''); }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${mode === 'encrypt' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Encrypt
            </button>
            <button
              onClick={() => { setMode('decrypt'); setInput(''); }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${mode === 'decrypt' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Decrypt
            </button>
          </div>
        </div>

        {/* Secret Key Input */}
        <div className="px-6 sm:px-8 pt-6 pb-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Secret Key
            </label>
            <input
              type="text"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="Enter a custom key (optional)"
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-sm"
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Input Area */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                {mode === 'encrypt' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {mode === 'encrypt' ? 'Plain Text' : 'Secret Message'}
              </label>
              <button
                onClick={() => setInput('')}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encrypt' ? "Type your secret message here..." : "Paste the secret symbols here..."}
              className="w-full h-56 sm:h-72 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none transition-all font-mono text-sm leading-relaxed shadow-inner"
            />
          </div>

          {/* Output Area */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                {mode === 'encrypt' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {mode === 'encrypt' ? 'Secret Message' : 'Plain Text'}
              </label>
              <button
                onClick={handleCopy}
                disabled={!output || output.startsWith('Error')}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500/20 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Result'}
              </button>
            </div>
            <div className={`w-full h-56 sm:h-72 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 overflow-auto font-mono text-sm leading-relaxed shadow-inner break-all ${!output ? 'text-zinc-600' : output.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
              {output || (mode === 'encrypt' ? "Encrypted text will appear here..." : "Decrypted text will appear here...")}
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <p className="mt-8 text-zinc-500 text-sm flex items-center gap-2 font-medium relative z-10">
        <Lock className="w-4 h-4" /> End-to-end local conversion. No data leaves your device.
      </p>
    </div>
  );
}
