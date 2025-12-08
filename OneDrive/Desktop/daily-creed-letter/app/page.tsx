import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      maxWidth: 800,
      margin: "60px auto",
      padding: "0 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      textAlign: "center",
      lineHeight: 1.8
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        ✉️ Daily Creed Letter
      </h1>
      <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "3rem" }}>
        어제의 나에게서 오늘 아침 편지가 오는 시스템
      </p>

      <div style={{
        display: "grid",
        gap: "20px",
        maxWidth: 600,
        margin: "0 auto"
      }}>
        <div style={{
          padding: "30px",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          textAlign: "left"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>📝 매일 밤</h2>
          <p style={{ color: "#555", marginBottom: "1.5rem" }}>
            하루를 돌아보며 3-5줄 정도의 짧은 일기를 작성합니다.
            <br/>
            오늘의 기분과 생각을 솔직하게 기록해보세요.
          </p>
          <Link
            href="/diary"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#4CAF50",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "bold"
            }}
          >
            일기 쓰러 가기 →
          </Link>
        </div>

        <div style={{
          padding: "30px",
          backgroundColor: "#fff3e0",
          borderRadius: "12px",
          textAlign: "left"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>☀️ 다음 날 아침</h2>
          <p style={{ color: "#555" }}>
            어제 작성한 일기를 바탕으로 AI가 감성 편지를 작성합니다.
            <br/>
            7개의 신조와 함께 당신만을 위한 메시지가 이메일로 도착합니다.
          </p>
        </div>
      </div>

      <div style={{
        marginTop: "4rem",
        padding: "30px",
        backgroundColor: "#e3f2fd",
        borderRadius: "12px"
      }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>💡 어떻게 작동하나요?</h2>
        <ol style={{
          textAlign: "left",
          maxWidth: 500,
          margin: "0 auto",
          color: "#555"
        }}>
          <li style={{ marginBottom: "0.5rem" }}>
            매일 밤 일기 페이지에서 짧은 일기를 작성하고 저장합니다
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            자동화된 시스템이 매일 아침 어제의 일기를 가져옵니다
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            AI가 일기 내용을 바탕으로 7가지 신조에 대한 감성 코멘트를 생성합니다
          </li>
          <li>
            완성된 편지가 당신의 이메일로 발송됩니다
          </li>
        </ol>
      </div>

      <div style={{
        marginTop: "3rem",
        padding: "20px",
        color: "#999",
        fontSize: "0.9rem"
      }}>
        <p>
          이 시스템은 당신의 일상을 기록하고,<br/>
          매일 아침 따뜻한 격려와 함께 하루를 시작할 수 있도록 돕습니다.
        </p>
      </div>
    </main>
  );
}
