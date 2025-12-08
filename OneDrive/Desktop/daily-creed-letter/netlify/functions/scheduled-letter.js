// Netlify Scheduled Function
// 매일 오전 7시(KST)에 실행

const { schedule } = require('@netlify/functions');

const handler = async (event, context) => {
  try {
    // 자신의 API 호출
    const response = await fetch(`${process.env.URL}/api/daily-creed`);
    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Daily letter sent successfully',
        data: data
      })
    };
  } catch (error) {
    console.error('Error sending daily letter:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send letter' })
    };
  }
};

// Cron 표현식: 0 22 * * * = UTC 22:00 = KST 07:00 (다음날)
module.exports.handler = schedule('0 22 * * *', handler);
