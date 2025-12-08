"use client";

import { useState } from "react";

export default function DiaryPage() {
  const [text, setText] = useState("");
  const [mood, setMood] = useState("normal");
  const [status, setStatus] = useState<null | "saving" | "saved" | "error">(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mood }),
      });
      
      if (res.ok) {
        setStatus("saved");
        setText("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  }

  return (
    <main style={{
      maxWidth: 600,
      margin: "40px auto",
      padding: "0 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      lineHeight: 1.6
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        오늘의 짧은 일기 ✍️
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        오늘 있었던 일, 감정, 떠오르는 생각을 3~5줄 정도만 적어보세요.
        <br/>
        내일 아침, 이 일기를 바탕으로 감성 편지가 도착합니다.
      </p>
      
      <form onSubmit={handleSubmit}>
        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="오늘 하루는 어땠나요?"
          required
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "1rem",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            fontFamily: "inherit",
            resize: "vertical"
          }}
        />
        
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <label style={{ marginRight: 12 }}>오늘의 기분:</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            style={{
              padding: "8px 12px",
              fontSize: "1rem",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            <option value="low">조금 무거움 😔</option>
            <option value="normal">보통 😊</option>
            <option value="high">가벼움 😄</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={status === "saving"}
          style={{
            padding: "12px 24px",
            fontSize: "1rem",
            backgroundColor: status === "saving" ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: status === "saving" ? "not-allowed" : "pointer",
            fontWeight: "bold"
          }}
        >
          {status === "saving" ? "저장 중..." : "저장하기"}
        </button>
      </form>
      
      {status === "saved" && (
        <p style={{ marginTop: 16, padding: 16, backgroundColor: "#e8f5e9", borderRadius: 8 }}>
          ✅ 저장되었어요. 내일 아침 편지를 기대해주세요. 잘 쉬어요 🌙
        </p>
      )}
      
      {status === "error" && (
        <p style={{ marginTop: 16, padding: 16, backgroundColor: "#ffebee", borderRadius: 8 }}>
          ❌ 저장이 안 됐어요. 나중에 다시 시도해주세요.
        </p>
      )}
    </main>
  );
}
