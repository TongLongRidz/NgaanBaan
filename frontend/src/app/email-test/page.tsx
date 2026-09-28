"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, RefreshCw, Eye, Mail, Type, FileText, KeyRound, Link2 } from "lucide-react";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { SideNavbar } from "@/components/ui/SideNavbar";

export default function EmailTestPage() {
  const [recipient, setRecipient] = useState("chitraphanukonwang@gmail.com");
  const [subject, setSubject] = useState("รหัสยืนยันตัวตนอีเมลของคุณ - NgaanBaan");
  const [title, setTitle] = useState("ยืนยันที่อยู่อีเมลของคุณ");
  const [content, setContent] = useState("ขอบคุณสำหรับการสมัครใช้งาน NgaanBaan กรุณาใช้รหัส OTP ด้านล่างนี้เพื่อยืนยันตัวตนของคุณ:");
  const [otpCode, setOtpCode] = useState("849201");
  const [verifyLink, setVerifyLink] = useState("http://localhost:3000/login?token=demo-test-token");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/auth/email-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient,
          subject,
          title,
          content,
          otp_code: otpCode,
          verify_link: verifyLink,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setStatus({ type: "success", message: `ส่งอีเมลสำเร็จไปยัง ${recipient} แล้ว!` });
      if (data.preview_html) {
        setPreviewHtml(data.preview_html);
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "เกิดข้อผิดพลาดในการส่งอีเมล" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      <SideNavbar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar title="Email Template Tester" />

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Mail className="w-7 h-7 text-indigo-400" />
                Email Dispatch & Live Template Tester
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                ทดสอบปรับแต่ง Email Title, Header, เนื้อหา และสั่งส่งอีเมลจริงไปยังกล่องข้อความ
              </p>
            </div>
          </div>

          {/* Form & Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Form: Controls */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-base font-bold text-indigo-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                <Type className="w-4 h-4" />
                ตั้งค่าข้อความและรายละเอียดอีเมล
              </h2>

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    อีเมลผู้รับ (Recipient Email)
                  </label>
                  <input
                    type="email"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    หัวข้อเรื่อง (Email Subject Header)
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="รหัสยืนยันตัวตน..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    หัวข้อในตัวการ์ด (Email Title inside Card)
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ยืนยันที่อยู่อีเมลของคุณ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    เนื้อหาคำอธิบาย (Email Content Body)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="ขอบคุณสำหรับการสมัคร..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      รหัส OTP (6-digits)
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="849201"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ลิงก์ยืนยันตัวตน (Verify Link)
                    </label>
                    <input
                      type="text"
                      value={verifyLink}
                      onChange={(e) => setVerifyLink(e.target.value)}
                      placeholder="http://..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 truncate"
                    />
                  </div>
                </div>

                {status && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      status.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {status.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{status.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 text-xs disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>กดส่งอีเมลทดสอบ (Dispatch Email)</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Form: Live HTML Preview Window */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  Live Clean Email Preview (ไม่มี Emoji)
                </h2>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                  Clean & Professional
                </span>
              </div>

              {/* Email Client Preview Container */}
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[480px]">
                {/* Email Subject Line Header */}
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 text-xs flex items-center justify-between text-slate-400">
                  <div>
                    <span className="text-slate-500">Subject: </span>
                    <strong className="text-white">{subject}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">From: NgaanBaan Team</div>
                </div>

                {/* HTML Render Frame */}
                <div className="flex-1 p-4 bg-slate-100 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        previewHtml ||
                        `
                      <!DOCTYPE html>
                      <html>
                      <body style="font-family: sans-serif; background-color: #f8fafc; padding: 20px;">
                        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                          <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff; font-weight: bold; font-size: 16px;">
                            NgaanBaan <span style="font-size: 12px; color: #94a3b8; font-weight: normal;">| Workspace Management</span>
                          </div>
                          <div style="padding: 28px; text-align: center;">
                            <h2 style="font-size: 18px; color: #0f172a; margin-bottom: 12px;">${title}</h2>
                            <p style="font-size: 14px; color: #475569; line-height: 1.5;">${content}</p>
                            ${
                              otpCode
                                ? `<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin:20px 0; font-family:monospace; font-size:28px; font-weight:bold; letter-spacing:8px; color:#0f172a;">${otpCode}</div>`
                                : ""
                            }
                            ${
                              verifyLink
                                ? `<a href="${verifyLink}" style="display:inline-block; background-color:#0f172a; color:#ffffff; text-decoration:none; font-weight:bold; font-size:13px; padding:10px 24px; border-radius:8px;">ยืนยันอีเมลของคุณ</a>`
                                : ""
                            }
                          </div>
                        </div>
                      </body>
                      </html>
                      `,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
