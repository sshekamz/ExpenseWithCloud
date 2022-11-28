const Sequelize = require('sequelize');

const sequelize = new Sequelize('expense-track', 'root', 'sshekamz', {
    dialect: 'mysql',
    host: 'localhost'
})

module.exports = sequelize;