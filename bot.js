const http = require('http');

const TOKEN = '7169498990:AAHgPOY5_vxJUbMkFdiibqbZledvMfiYuxw';
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const USD_KURS = 12500;

// Userlar holatini saqlaymiz
const userState = {};

// Foydalanuvchiga xabar yuborish
function sendMessage(chatId, text, replyMarkup) {
  const data = JSON.stringify({
    chat_id: chatId,
    text: text,
    reply_markup: replyMarkup
  });

  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    res.on('data', () => {});
  });

  req.on('error', (e) => {
    console.error(`xatolik: ${e.message}`);
  });

  req.write(data);
  req.end();
}

// Webhook orqali xabarni qabul qilish
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === `/bot${TOKEN}`) {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const update = JSON.parse(body);
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text;

      // log uchun
      console.log('Keldi:', text);

      if (text === '/start') {
        sendMessage(chatId, "Valyuta yo‘nalishini tanlang:", {
          keyboard: [
            ['USD → UZS'],
            ['UZS → USD']
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        });
      } else if (text === 'USD → UZS') {
        userState[chatId] = 'usd_to_uzs';
        sendMessage(chatId, "USD miqdorini kiriting:");
      } else if (text === 'UZS → USD') {
        userState[chatId] = 'uzs_to_usd';
        sendMessage(chatId, "UZS miqdorini kiriting:");
      } else if (!isNaN(text) && userState[chatId]) {
        const miqdor = parseFloat(text);
        let natija = '';

        if (userState[chatId] === 'usd_to_uzs') {
          natija = `${miqdor} USD ≈ ${miqdor * USD_KURS} UZS`;
        } else {
          natija = `${miqdor} UZS ≈ ${(miqdor / USD_KURS).toFixed(2)} USD`;
        }

        sendMessage(chatId, `💱 ${natija}`);
        delete userState[chatId];
      }

      res.writeHead(200);
      res.end('OK');
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// 3000-portda ishga tushiramiz
server.listen(3000, () => {
  console.log('Server http://localhost:3000 da ishlayapti');
});
