const {Op} =require('sequelize');


const User = require('../model/user');
const Expense = require('../model/expense');


exports.addExpense = async (req, res) => {
    try {
        const { amount, description, category } = req.body;
        const expense = await req.user.createExpense({ amount, description, category});
        res.status(201).json({ success: true, message: 'succesfully added', expense });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'server error' });
    }
};

exports.removeExpense = async (req, res) => {
    try {
        const expenseId = req.params.expenseId;
        await Expense.destroy({ where: { id: expenseId } });
        res.status(200).json({ success: true, message: 'deleted successfully' })
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'server error' });
    }
}

exports.getExpense = async (req, res) => {
    try {
        const userId = req.query.userId;
        // console.log('>>>custom>>>>',userId,'<<<<<<<');
        const page = +req.query.page || 1;
        const ITEMS_PER_PAGE = +req.query.limit || 5;

        const numExpenses = await Expense.findAll({ where: { userId } });
        const totalItems = numExpenses.length;
        const expense = await Expense.findAll({
            where: { userId },
            offset: ((page - 1) * ITEMS_PER_PAGE),
            limit: ITEMS_PER_PAGE
        });

        res.status(200).json({
            'expense': expense,
            'pagination': {
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            }
        });
    } catch (err) {
        console.log(err)
    }
}


exports.getUsers = async (req, res) => {
    User.findAll({ attributes: ['id', 'name'] ,where:{id:{[Op.ne]:req.user.id}}})
        .then(user => {
            res.status(200).json(user);
        }).catch(err => console.log(err));
}