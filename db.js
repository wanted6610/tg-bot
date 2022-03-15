const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'tgbot',
    'root',
    'root',
    {
        host: '109.71.12.251',
        port: '6432',
        dialect: 'postgres'
    }
)