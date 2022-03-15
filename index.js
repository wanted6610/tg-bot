const TelegramApi = require('node-telegram-bot-api');

const {gameOptions, againOptions} = require('./options.js');

const token = '5119916700:AAHX0_iHwjyKvi23g2lc0PXlZvMjy_sqSdw';

const bot = new TelegramApi(token, {polling: true});

const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Я загадаю число от 0 до 9, а ты должен его угадать');
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
}

const start = () => {
    bot.setMyCommands( [
        {command: "/start", description: "Приветствие"},
        {command: "/game", description: "Игра"}
    ])
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const name = msg.from.first_name;
        if (text === '/start') {
            await bot.sendMessage(chatId, `Привет ${name}, рады видеть тебя в нашем телеграм-канале`);
            return bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/06c/d14/06cd1435-9376-40d1-b196-097f5c30515c/19.jpg')
        }

        if (text === '/game') {
            return startGame(chatId);
        }
        return bot.sendMessage(chatId, "Я не понимаю такую команду(")
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === '/again') return startGame(chatId);
        if (data === chats[chatId]) {
            return bot.sendMessage(chatId, `Поздравляю, ты угадал цифру ${chats[chatId]}!`, againOptions)
        } else {
            return bot.sendMessage(chatId,`Ты не угадал, я загадал цифру ${chats[chatId]}`, againOptions);
        }
    })
}

start()