const TelegramBot = require('node-telegram-bot-api');

// Bot tokenini bu yerga yoz
const token = '7169498990:AAHgPOY5_vxJUbMkFdiibqbZledvMfiYuxw';

// Botni ishga tushiramiz (polling rejimda)
const bot = new TelegramBot(token, { polling: true });

// Valyuta kurslari (real emas, misol uchun)
const USD_KURS = 12500;

// Har bir user uchun vaqtinchalik holatni saqlash
const userState = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Qaysi yo‘nalishda valyuta o‘girishni xohlaysiz?', {
    reply_markup: {
      keyboard: [
        ['🇺🇸 USD → 🇺🇿 UZS'],
        ['🇺🇿 UZS → 🇺🇸 USD']
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// O‘giruv yo‘nalishini aniqlash
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '🇺🇸 USD → 🇺🇿 UZS') {
    userState[chatId] = 'usd_to_uzs';
    bot.sendMessage(chatId, "Iltimos, USD miqdorini kiriting:");
  } else if (text === '🇺🇿 UZS → 🇺🇸 USD') {
    userState[chatId] = 'uzs_to_usd';
    bot.sendMessage(chatId, "Iltimos, UZS miqdorini kiriting:");
  } else if (!isNaN(text) && userState[chatId]) {
    const amount = parseFloat(text);
    let result;

    if (userState[chatId] === 'usd_to_uzs') {
      result = amount * USD_KURS;
      bot.sendMessage(chatId, `💰 ${amount} USD ≈ ${result.toLocaleString()} UZS`);
    } else if (userState[chatId] === 'uzs_to_usd') {
      result = amount / USD_KURS;
      bot.sendMessage(chatId, `💵 ${amount} UZS ≈ ${result.toFixed(2)} USD`);
    }

    // Holatni tozalash
    delete userState[chatId];
  }
});
