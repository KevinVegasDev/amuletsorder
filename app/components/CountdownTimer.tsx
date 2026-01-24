"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date | string; // Fecha objetivo (puede ser string ISO o Date)
  title?: string;
  description?: string;
  className?: string;
  onComplete?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  title = "Próxima Colección",
  description = "No te pierdas nuestro próximo lanzamiento",
  className = "",
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const targetTime = target.getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        if (onComplete) {
          onComplete();
        }
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    // Calcular inmediatamente
    setTimeLeft(calculateTimeLeft());

    // Actualizar cada segundo
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (isExpired) {
    return null; // O puedes mostrar un mensaje de "Ya disponible"
  }

  return (
    <div
      className={`bg-gradient-to-r from-negro to-gray-800 text-white rounded-2xl p-6 md:p-8 ${className}`}
    >
      <div className="max-w-4xl mx-auto text-center">
        {title && (
          <h3 className="text-2xl md:text-3xl font-bold mb-2">{title}</h3>
        )}
        {description && (
          <p className="text-sm md:text-base text-gray-300 mb-6">{description}</p>
        )}

        <div className="flex items-center justify-center gap-4 md:gap-6">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]">
              <div className="text-3xl md:text-4xl font-bold tabular-nums">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
            </div>
            <span className="text-xs md:text-sm text-gray-300 mt-2 uppercase tracking-wide">
              Días
            </span>
          </div>

          {/* Separator */}
          <div className="text-3xl md:text-4xl font-bold text-gray-400">:</div>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]">
              <div className="text-3xl md:text-4xl font-bold tabular-nums">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
            </div>
            <span className="text-xs md:text-sm text-gray-300 mt-2 uppercase tracking-wide">
              Horas
            </span>
          </div>

          {/* Separator */}
          <div className="text-3xl md:text-4xl font-bold text-gray-400">:</div>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]">
              <div className="text-3xl md:text-4xl font-bold tabular-nums">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
            </div>
            <span className="text-xs md:text-sm text-gray-300 mt-2 uppercase tracking-wide">
              Min
            </span>
          </div>

          {/* Separator */}
          <div className="text-3xl md:text-4xl font-bold text-gray-400">:</div>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]">
              <div className="text-3xl md:text-4xl font-bold tabular-nums">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
            </div>
            <span className="text-xs md:text-sm text-gray-300 mt-2 uppercase tracking-wide">
              Seg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
