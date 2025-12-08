export const metadata = {
  title: 'Daily Creed Letter - 어제의 나에게서 오늘 아침 편지가 오는 시스템',
  description: '매일 밤 짧은 일기를 쓰면, 다음 날 아침 AI가 감성 편지를 작성해 이메일로 보내줍니다.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
