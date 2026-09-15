import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { X, Delete } from 'lucide-react';

export default function AdminPinModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const hiddenInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setTimeout(() => {
        if (hiddenInputRef.current) {
          hiddenInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
    } else if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (pin.length === 4) {
        submitPin(pin);
      }
    }
  };

  const submitPin = async (pinValue) => {
    if (pinValue.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.login(pinValue);
      setLoading(false);
      onClose();
      onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Incorrect PIN');
      setPin('');
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    }
  };

  return (
    <div
      id="admin-pin-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-sm bg-white p-8 border border-[#E5E5E5] shadow-xs relative select-none"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Close icon */}
        <button
          id="close-admin-pin-modal-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#666666] hover:text-black transition-colors focus:outline-hidden cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hidden input for physical keyboard support */}
        <input
          ref={hiddenInputRef}
          type="tel"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
            setPin(val);
            if (val.length === 4) submitPin(val);
          }}
          className="opacity-0 absolute -z-10 pointer-events-none"
          autoComplete="off"
        />

        <div className="text-center space-y-2 mb-8">
          <h2 className="text-xl font-bold tracking-tight text-black">Admin Access</h2>
          <p className="text-sm text-[#666666]">Enter PIN</p>
        </div>

        {/* 4-digit circles display */}
        <div className="flex justify-center items-center gap-4 mb-8">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isFilled ? 'bg-black scale-110' : 'bg-transparent border border-black/40'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-center text-red-600 mb-6 font-medium">
            {error}
          </p>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              id={`pin-key-${num}`}
              type="button"
              onClick={() => handleDigit(String(num))}
              disabled={loading}
              className="h-12 flex items-center justify-center text-lg font-medium border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] active:bg-black active:text-white transition-colors cursor-pointer rounded-xs focus:outline-hidden"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            id="pin-key-0"
            type="button"
            onClick={() => handleDigit('0')}
            disabled={loading}
            className="h-12 flex items-center justify-center text-lg font-medium border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] active:bg-black active:text-white transition-colors cursor-pointer rounded-xs focus:outline-hidden"
          >
            0
          </button>
          <button
            id="pin-key-backspace"
            type="button"
            onClick={handleBackspace}
            disabled={loading || pin.length === 0}
            className="h-12 flex items-center justify-center text-[#666666] border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] active:bg-black active:text-white transition-colors cursor-pointer rounded-xs focus:outline-hidden"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Unlock Button */}
        <button
          id="admin-unlock-btn"
          type="button"
          onClick={() => submitPin(pin)}
          disabled={loading || pin.length !== 4}
          className="w-full py-3 bg-black text-white text-sm font-medium tracking-wide transition-opacity disabled:opacity-30 hover:opacity-90 cursor-pointer focus:outline-hidden rounded-xs"
        >
          {loading ? 'Verifying...' : 'Unlock'}
        </button>
      </div>
    </div>
  );
}
