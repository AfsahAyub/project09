
"use client";

import { useEffect, useRef, useState } from "react";
import rules from "./rules.json";

type Rule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  role: "user" | "bot";
  text: string;
};

const restaurantRules = rules as Rule[];

const greeting =
  "Welcome to Desi Bites! 🍊\n\nYour demo restaurant in Sargodha. I can help you explore our menu, deals, delivery, opening hours, location and payment options.\n\nWhat would you like to know today?";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getBotReply(message: string): string {
  const question = normalize(message);

  if (!question) {
    return "Please type a question. I'd be happy to help! 😊";
  }

  const paddedQuestion = ` ${question} `;

  const matches = restaurantRules
    .map((rule) => {
      const matchedKeywords = rule.keywords
        .map(normalize)
        .filter(
          (keyword) =>
            keyword.length > 0 &&
            paddedQuestion.includes(` ${keyword} `)
        );

      const score = matchedKeywords.reduce(
        (total, keyword) => total + keyword.length * keyword.length,
        0
      );

      return { rule, score };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matches.length > 0) {
    return matches[0].rule.reply;
  }

  return (
    "Sorry, I couldn't find an answer to that question yet. 😊\n\n" +
    "I can help you with:\n" +
    "🍔 Menu and prices\n" +
    "🔥 Special deals\n" +
    "🛵 Delivery\n" +
    "🕒 Opening hours\n" +
    "📍 Location\n" +
    "💳 Payment options\n\n" +
    "Try asking about one of these topics!"
  );
}

const quickTopics = [
  { label: "Menu", question: "menu", emoji: "🍔" },
  { label: "Deals", question: "deals", emoji: "🔥" },
  { label: "Timings", question: "timings", emoji: "🕒" },
  { label: "Location", question: "location", emoji: "📍" },
  { label: "Delivery", question: "delivery", emoji: "🛵" },
  { label: "Payment", question: "payment", emoji: "💳" }
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: greeting }
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function sendMessage(question?: string) {
    const text = (question ?? input).trim();

    if (!text || isTyping) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text }
    ]);

    setInput("");
    setIsTyping(true);

    const reply = getBotReply(text);

    timerRef.current = setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        { role: "bot", text: reply }
      ]);

      setIsTyping(false);
      timerRef.current = null;
      inputRef.current?.focus();
    }, 500);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex h-[90vh] min-h-[560px] max-h-[900px] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-200/60">

        {/* Restaurant header */}
        <header className="flex items-center gap-3 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-4 py-5 text-white sm:px-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-2xl">
            🍔
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Desi Bites
            </h1>
            <p className="mt-1 text-xs text-orange-50 sm:text-sm">
              Restaurant Chatbot · Sargodha
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/20 px-3 py-2 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-green-300" />
            Online
          </div>
        </header>

        {/* Messages */}
        <section
          aria-label="Chat messages"
          aria-live="polite"
          className="flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-orange-50/70 to-amber-50/50 p-4 sm:p-6"
        >
          <div className="mx-auto w-fit rounded-full border border-orange-100 bg-white px-4 py-2 text-center text-xs text-orange-700 shadow-sm">
            Welcome to Desi Bites 🍊
          </div>

          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={`flex items-end gap-2 ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {message.role === "bot" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-200 text-lg">
                  🍔
                </div>
              )}

              <div
                className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[78%] ${
                  message.role === "user"
                    ? "rounded-br-sm bg-gradient-to-br from-orange-600 to-orange-500 text-white"
                    : "rounded-bl-sm border border-orange-100 bg-white text-stone-700"
                }`}
              >
                {message.text}
              </div>

              {message.role === "user" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-lg">
                  👤
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-200">
                🍔
              </div>

              <div className="rounded-2xl rounded-bl-sm border border-orange-100 bg-white px-4 py-3 text-sm text-orange-700">
                <span className="animate-pulse">Typing...</span>
                <span className="ml-1 inline-block animate-bounce">•••</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </section>

        {/* Quick topics */}
        <div className="border-t border-orange-100 bg-white px-4 pt-4 sm:px-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
            Quick topics
          </p>

          <div className="flex gap-2 overflow-x-auto pb-4">
            {quickTopics.map((topic) => (
              <button
                key={topic.label}
                type="button"
                disabled={isTyping}
                onClick={() => sendMessage(topic.question)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800 transition hover:border-orange-400 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{topic.emoji}</span>
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message input */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2 border-t border-orange-100 bg-white p-3 sm:gap-3 sm:px-5 sm:py-4"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about our food..."
            aria-label="Type your message"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-2xl border border-orange-200 bg-orange-50/60 px-4 py-3.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
          />

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="shrink-0 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3.5 font-bold text-white shadow-lg shadow-orange-200 transition hover:from-orange-700 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
          >
            Send <span aria-hidden="true">➤</span>
          </button>
        </form>

        <footer className="bg-white pb-3 text-center text-xs text-stone-400">
          Desi Bites · Good Food, Great Mood!
        </footer>
      </div>
    </main>
  );
}
