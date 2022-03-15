const TelegramApi = require('node-telegram-bot-api');

const sequelize = require('./db.js');
const User = require('./models.js');

const UserModel = require('./models.js');

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

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch(e) {
        console.log('Подключение не удалось - ',e);
    }

    bot.setMyCommands( [
        {command: "/start", description: "Приветствие"},
        {command: "/game", description: "Игра"},
        {command: "/info", description: "Информация"}

    ])
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const name = msg.from.first_name;

        try {

            if (text === '/start') {
                await UserModel.create({chatId})
                await bot.sendMessage(chatId, `Привет ${name}, рады видеть тебя в нашем телеграм-канале`);
                return bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/06c/d14/06cd1435-9376-40d1-b196-097f5c30515c/19.jpg')
            }

            if (text === '/info') {
                const user = await UserModel.findOne({chatId});
                return bot.sendMessage(chatId, `В игре ты ответил правильно ${user.right}, неправильно ${user.wrong}`)
            }
    
            if (text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, "Я не понимаю такую команду(")

        } catch(e) {
            return bot.sendMessage(chatId, 'Произошла ошибка');
        }

    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === '/again') return startGame(chatId);
        const user = await UserModel.findOne({chatId});
        if (data == chats[chatId]) {
            user.right +=1;
            await bot.sendMessage(chatId, `Поздравляю, ты угадал цифру ${chats[chatId]}!`, againOptions)
        } else {
            user.wrong +=1;
            await bot.sendMessage(chatId,`Ты не угадал, я загадал цифру ${chats[chatId]}`, againOptions);
        }
        await user.save();
    })
}

start()