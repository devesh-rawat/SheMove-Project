'use client';

import React, { useState } from 'react';
import { X, Clock, ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';

interface ModifyTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModify: (pin: string, additionalMinutes: number) => Promise<{ success: boolean; duress?: boolean; message?: string }>;
}

export const ModifyTimeModal: React.FC<ModifyTimeModalProps> = ({
  isOpen,
  onClose,
  onModify,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [pin, setPin] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedbackPopup, setFeedbackPopup] = useState<{
    show: boolean;
    isDuress: boolean;
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleKeyClick = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setErrorMsg(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setErrorMsg('Please enter a 4-digit PIN');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await onModify(pin, selectedMinutes);

      // Show the frontend popup for modification
      setFeedbackPopup({
        show: true,
        isDuress: !!res.duress,
        text: res.message || `Journey extended by ${selectedMinutes} minutes.`,
      });

      // Auto close after showing feedback
      setTimeout(() => {
        setFeedbackPopup(null);
        setPin('');
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid PIN entered. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm rounded-3xl wireframe-border bg-zinc-950 p-5 shadow-2xl relative text-white border border-white/30">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="w-10 h-10 rounded-full wireframe-border bg-white/10 flex items-center justify-center mx-auto mb-2 text-white">
            <Clock className="w-5 h-5 text-zinc-200" />
          </div>
          <h3 className="font-sketch text-2xl font-bold tracking-wide text-white">
            modify time
          </h3>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Select additional duration &amp; enter your security PIN
          </p>
        </div>

        {/* Frontend Popup for False or Real Modification (per sketch annotation) */}
        {feedbackPopup && (
          <div
            className={`p-3 rounded-2xl mb-4 border transition-all text-center animate-in zoom-in-95 duration-200 ${
              feedbackPopup.isDuress
                ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                : 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Time Modified</span>
            </div>
            <p className="text-xs text-zinc-300 mt-1">{feedbackPopup.text}</p>
            {feedbackPopup.isDuress && (
              <div className="mt-2 text-[10px] text-red-400 font-mono bg-red-950/80 p-1.5 rounded border border-red-900">
                [COVERT SOS ACTIVATED] Silent CAD alarm dispatched to police station. Screen maintains legitimate disguise.
              </div>
            )}
          </div>
        )}

        {!feedbackPopup && (
          <>
            {/* Time Extension Options */}
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSelectedMinutes(mins)}
                  type="button"
                  className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all wireframe-border ${
                    selectedMinutes === mins
                      ? 'bg-white text-black font-extrabold border-white scale-105'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  +{mins}m
                </button>
              ))}
            </div>

            {/* PIN Display */}
            <div className="flex flex-col items-center mb-3">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-2 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-zinc-400" />
                <span>Security PIN</span>
              </div>
              <div className="flex gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-11 h-12 rounded-xl wireframe-border flex items-center justify-center text-xl font-mono font-bold transition-all ${
                      pin.length > idx
                        ? 'bg-white/20 border-white text-white'
                        : 'bg-zinc-900/60 border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {pin.length > idx ? '●' : ''}
                  </div>
                ))}
              </div>
              {errorMsg && (
                <div className="text-xs text-red-400 font-medium mt-2">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeyClick(digit)}
                  type="button"
                  className="py-2.5 rounded-xl wireframe-border bg-zinc-900/80 hover:bg-zinc-800 active:scale-95 font-mono text-base font-bold text-white transition cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => setPin('')}
                type="button"
                className="py-2.5 rounded-xl wireframe-border bg-zinc-900/50 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-400 transition"
              >
                Clear
              </button>
              <button
                onClick={() => handleKeyClick('0')}
                type="button"
                className="py-2.5 rounded-xl wireframe-border bg-zinc-900/80 hover:bg-zinc-800 active:scale-95 font-mono text-base font-bold text-white transition cursor-pointer"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                type="button"
                className="py-2.5 rounded-xl wireframe-border bg-zinc-900/50 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition"
              >
                ⌫
              </button>
            </div>

            {/* Helper Hint matching user sketch notes */}
            <div className="bg-zinc-900/90 rounded-xl p-2.5 border border-zinc-800 text-[10px] text-zinc-400 font-sketch mb-4 leading-relaxed">
              <span className="text-zinc-200 font-bold">Demo PINs:</span>
              <br />
              • <span className="text-emerald-400 font-mono font-bold">1234</span> : Real PIN (modifies time)
              <br />
              • <span className="text-red-400 font-mono font-bold">9999</span> : Fake Duress PIN (sends covert police alert with false popup)
            </div>

            {/* Submit Action */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || pin.length !== 4}
              type="button"
              className={`w-full py-3 rounded-2xl wireframe-border-bright font-sketch text-xl font-bold transition-all cursor-pointer ${
                pin.length === 4
                  ? 'bg-white text-black hover:bg-zinc-200 active:scale-95'
                  : 'bg-zinc-900 text-zinc-500 cursor-not-allowed border-zinc-700'
              }`}
            >
              {isSubmitting ? 'Verifying PIN...' : 'Confirm Modification'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
