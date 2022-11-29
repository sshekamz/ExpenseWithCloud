const path = require('path');
const fs = require('fs');
// const https = require('https');
const helemt=require('helmet')
const express = require('express');
const morgan=require('morgan')

const app = express();

const cors = require('cors');


app.use(cors());
app.use(express.json());

//LOG file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
//env
const dotenv = require('dotenv');
dotenv.config();

//database
const sequelize = require('./util/database');

//routes
const userRoutes = require('./routes/userRoute');
const expenseRoutes= require('./routes/expenseRoute');
const premiumRoutes= require('./routes/premiumRoutes');

//models
const User = require('./model/user');
const Expense = require('./model/expense');
const Order = require('./model/order');
const ForgotPassword = require('./model/forgot-password');
const Report = require('./model/report');

// associations
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasOne(Order);
Order.belongsTo(User);

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

User.hasMany(Report);
Report.belongsTo(User);

app.use(helemt())
app.use(morgan('combined',{stream: accessLogStream}));

//routes

app.use(userRoutes);
app.use(expenseRoutes);
app.use(premiumRoutes);

//server
sequelize
    .sync({
        // force: true
    })
    .then(() => {
        
        app.listen(3000);
    })
    .catch(err => console.log(err))

