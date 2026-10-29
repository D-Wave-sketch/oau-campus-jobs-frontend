"use client";

import { useState } from "react";

export function AuthSocialButtons({ mode = "register" }) {
  const [toast, setToast] = useState("");

  const handleSocialClick = (provider) => {
    setToast(`Institutional ${provider} login will be connected via your university portal.`);
    setTimeout(() => setToast(""), 4500);
  };

  return (
    <div className="w-full space-y-3">
      {toast && (
        <div className="rounded-xl border border-purple-500/30 bg-[#221c38] px-3.5 py-2 text-xs text-purple-200 animate-fade-in shadow-lg">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Google Button */}
        <button
          type="button"
          onClick={() => handleSocialClick("Google")}
          className="group flex items-center justify-center gap-2.5 rounded-xl border border-[#2e2844] bg-[#1a162b] px-4 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-[#453b66] hover:bg-[#231d3a] hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-xs sm:text-sm">Google</span>
        </button>

        {/* Apple Button */}
        <button
          type="button"
          onClick={() => handleSocialClick("Apple")}
          className="group flex items-center justify-center gap-2.5 rounded-xl border border-[#2e2844] bg-[#1a162b] px-4 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-[#453b66] hover:bg-[#231d3a] hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        >
          <svg className="h-4 w-4 shrink-0 fill-current text-white" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.7-11.71-13.98-5.65-8.6-10.1-18.42-13.34-29.47-3.24-11.05-4.86-21.73-4.86-32.04 0-14.28 3.59-26.04 10.77-35.28 7.18-9.24 16.09-13.98 26.74-14.22 5.09-.12 10.51 1.25 16.27 4.12 5.76 2.87 9.53 4.36 11.3 4.47 1.41 0 5.43-1.61 12.06-4.83 6.63-3.22 12.63-4.64 18-4.25 13.79.98 24.32 6.07 31.6 15.26-12.18 7.39-18.17 17.51-17.97 30.37.2 10.01 4.09 18.57 11.67 25.68 7.58 7.11 16.59 11.05 27.02 11.82-2.39 7.07-5.33 14.57-8.82 22.52zM119.22 31.84c0-7.39 2.66-14.39 7.98-21 5.32-6.61 11.96-10.43 19.92-11.46.22 1.09.33 2.07.33 2.94 0 7.39-2.77 14.49-8.31 21.31-5.54 6.82-12.35 10.63-20.43 11.44-.22-1.09-.33-2.07-.33-2.94z" />
          </svg>
          <span className="text-xs sm:text-sm">Apple</span>
        </button>
      </div>
    </div>
  );
}
