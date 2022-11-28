const express = require('express');

const expenseRoutes = express.Router();

const expenseController = require('../controller/expenseController');
const authMiddleware = require('../middleware/auth');

expenseRoutes.post('/addexpense', authMiddleware.authenticate, expenseController.addExpense);

expenseRoutes.get('/get-users', authMiddleware.authenticate,expenseController.getUsers);

expenseRoutes.get('/get-expense',  authMiddleware.authenticate,expenseController.getExpense);

expenseRoutes.post('/delete-expense/:expenseId', /*authMiddleware.authenticate,*/ expenseController.removeExpense);

expenseRoutes.get('/download', authMiddleware.authenticate, expenseController.downloadExpense);

expenseRoutes.get('/get-reports', authMiddleware.authenticate, expenseController.getReports);

module.exports = expenseRoutes;