"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", {
      email, password, redirect: false,
    });
    if (res?.error) setError("Invalid credentials");
    else router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-[#D8C9BC] p-10 w-full max-w-sm">
        <div className="mb-8">
          <div className="text-3xl font-bold text-[#5A0E12] tracking-widest">FLORA</div>
          <div className="text-xs text-[#6B625A] tracking-[0.15em] uppercase mt-1">Interior Operations</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#6B625A] block mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2]"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[#6B625A] block mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2]"
            />
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#5A0E12] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#7A1E22] transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}