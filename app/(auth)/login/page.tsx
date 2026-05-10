"use client";

import { useTransition, useState } from "react";
import { signIn } from "../actions";
import {
  EnvelopeSimpleIcon,
  LockSimpleIcon,
  SignInIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result) {
        setError(result);
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-container/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-tertiary-container/50 rounded-full blur-[120px]" />

      <div className="w-full max-w-md p-8 animate-in fade-in zoom-in duration-500">
        <div className="bg-card rounded-xl border border-border card-shadow p-8 flex flex-col gap-8">

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <SignInIcon size={36} weight="bold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">퀸즈헤나 CRM</h1>
              <p className="text-sm text-muted-foreground">원장님 계정으로 로그인하세요</p>
            </div>
          </div>

          <form action={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
                이메일 주소
              </label>
              <div className="relative group">
                <EnvelopeSimpleIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full h-12 pl-12 pr-4 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-muted-foreground ml-1 uppercase tracking-wider">
                비밀번호
              </label>
              <div className="relative group">
                <LockSimpleIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-4 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error-container/30 rounded-lg text-error text-xs animate-in slide-in-from-top-2 duration-300">
                <WarningCircleIcon weight="fill" size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full h-12 bg-primary hover:bg-primary-dim disabled:bg-surface-container text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  로그인하기
                  <SignInIcon size={20} weight="bold" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-border/50 text-center">
            <p className="text-[12px] text-outline-variant">
              &copy; 2026 Queens Henna. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
