"use client";

import Link from "next/link";
import ButtonSupport from "@/components/ButtonSupport";
import config from "@/config";
import { useEffect, useState } from "react";

export default function Custom404() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-base-100 via-base-200 to-base-100 text-base-content min-h-screen w-full flex flex-col justify-center gap-8 items-center p-10 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Coins */}
        <div className={`absolute top-20 left-10 w-16 h-16 rounded-full bg-primary/20 blur-sm ${mounted ? 'animate-float-1' : ''}`}></div>
        <div className={`absolute top-40 right-20 w-12 h-12 rounded-full bg-primary/15 blur-sm ${mounted ? 'animate-float-2' : ''}`}></div>
        <div className={`absolute bottom-32 left-1/4 w-20 h-20 rounded-full bg-primary/10 blur-sm ${mounted ? 'animate-float-3' : ''}`}></div>
        <div className={`absolute bottom-20 right-1/3 w-14 h-14 rounded-full bg-primary/20 blur-sm ${mounted ? 'animate-float-4' : ''}`}></div>
        
        {/* Chart Lines Animation */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-5" viewBox="0 0 400 300">
          <path
            d="M 0,200 Q 100,100 200,150 T 400,100"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className={mounted ? 'animate-draw-line' : ''}
          />
          <path
            d="M 0,250 Q 150,50 300,150 T 400,80"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className={mounted ? 'animate-draw-line-delayed' : ''}
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 flex flex-col items-center gap-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
        {/* Animated 404 Number */}
        <div className="relative">
          <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x bg-[length:200%_200%]">
            404
          </h1>
          {/* Glow effect */}
          <div className="absolute inset-0 text-9xl md:text-[12rem] font-black text-primary/20 blur-2xl -z-10 animate-pulse-slow">
            404
          </div>
        </div>

        {/* Animated Illustration Container */}
        <div className={`relative ${mounted ? 'animate-bounce-slow' : ''}`}>
          <div className="p-8 bg-gradient-to-br from-base-200 to-base-300 rounded-3xl shadow-2xl border border-primary/20 backdrop-blur-sm">
            {/* Finance-themed SVG with animations */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-64 h-64 md:w-80 md:h-80"
              viewBox="0 0 400 300"
            >
              {/* Animated Chart Bars */}
              <g className={mounted ? 'animate-fade-in' : ''}>
                <rect x="50" y="200" width="40" height="60" fill="currentColor" className="fill-primary opacity-80">
                  <animate attributeName="height" values="0;60" dur="1s" begin="0.2s" fill="freeze" />
                  <animate attributeName="y" values="260;200" dur="1s" begin="0.2s" fill="freeze" />
                </rect>
                <rect x="110" y="180" width="40" height="80" fill="currentColor" className="fill-primary opacity-80">
                  <animate attributeName="height" values="0;80" dur="1s" begin="0.4s" fill="freeze" />
                  <animate attributeName="y" values="260;180" dur="1s" begin="0.4s" fill="freeze" />
                </rect>
                <rect x="170" y="150" width="40" height="110" fill="currentColor" className="fill-primary opacity-80">
                  <animate attributeName="height" values="0;110" dur="1s" begin="0.6s" fill="freeze" />
                  <animate attributeName="y" values="260;150" dur="1s" begin="0.6s" fill="freeze" />
                </rect>
                <rect x="230" y="130" width="40" height="130" fill="currentColor" className="fill-primary opacity-80">
                  <animate attributeName="height" values="0;130" dur="1s" begin="0.8s" fill="freeze" />
                  <animate attributeName="y" values="260;130" dur="1s" begin="0.8s" fill="freeze" />
                </rect>
                <rect x="290" y="140" width="40" height="120" fill="currentColor" className="fill-primary opacity-80">
                  <animate attributeName="height" values="0;120" dur="1s" begin="1s" fill="freeze" />
                  <animate attributeName="y" values="260;140" dur="1s" begin="1s" fill="freeze" />
                </rect>
              </g>

              {/* Animated Coins */}
              <circle cx="80" cy="80" r="25" fill="currentColor" className="fill-warning opacity-90">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 80 80;360 80 80"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="320" cy="70" r="20" fill="currentColor" className="fill-warning opacity-90">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="360 320 70;0 320 70"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Trending Arrow */}
              <path
                d="M 200 50 L 220 30 L 240 50 L 230 50 L 230 80 L 210 80 L 210 50 Z"
                fill="currentColor"
                className="fill-success opacity-90"
              >
                <animate
                  attributeName="opacity"
                  values="0.5;1;0.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 0,-5; 0,0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Dollar Sign */}
              <text
                x="200"
                y="100"
                fontSize="40"
                fontWeight="bold"
                fill="currentColor"
                className="fill-primary opacity-60"
                textAnchor="middle"
              >
                $
                <animate
                  attributeName="opacity"
                  values="0.3;0.8;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </text>
            </svg>
          </div>
          
          {/* Floating particles around illustration */}
          <div className="absolute -top-4 -right-4 w-3 h-3 bg-primary rounded-full animate-ping"></div>
          <div className="absolute -bottom-4 -left-4 w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
        </div>

        {/* Message */}
        <div className="text-center space-y-4 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Oops! This page doesn&apos;t exist
          </h2>
          <p className="text-lg md:text-xl text-base-content/70">
            Looks like this investment opportunity went off the charts! 🚀
          </p>
          <p className="text-base md:text-lg text-base-content/60">
            Don&apos;t worry, your portfolio is still growing. Let&apos;s get you back on track to track your investments with {config.appName}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <Link 
            href="/" 
            className="btn btn-primary btn-lg gap-2 group hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
            >
              <path
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                clipRule="evenodd"
              />
            </svg>
            Go Home
          </Link>

          <ButtonSupport />
        </div>

        {/* Motivational Quote */}
        <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl border border-primary/20 backdrop-blur-sm max-w-xl">
          <p className="text-center text-base-content/80 italic font-medium">
            &quot;The best investment you can make is in yourself.&quot;
          </p>
          <p className="text-center text-sm text-base-content/60 mt-2">— Warren Buffett</p>
        </div>
      </div>

    </section>
  );
}
