const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

//premium-user
document.getElementById('btn-rzp').onclick = async function (e) {
    const response = await axios.get('http://localhost:3000/premium', { headers: { 'Authorization': token } });
    console.log(response);
    var options =
    {
        'key': response.data.key_id,
        'name': 'test',
        'order_id': response.data.order_id,
        'prefill': {
            'name': 'test user',
            'email': 'test@gmail.com',
            'contact': '1234567893'
        },
        'theme': {
            'color': '#3399cc'
        },
        'handler': function (response) {
            console.log(response);
            console.log(options);
            axios.post('http://localhost:3000/transaction-status', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id
            }, { headers: { 'Authorization': token } }).then((response) => {
                console.log(response.data);
                localStorage.setItem('premium', response.data.premium);
                document.body.style.backgroundColor = '#3399cc';
                alert('You are now a premium user')
            }).catch(() => {
                alert('Something went wrong, try again')
            })
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
    e.preventDefault();

    rzp.on('payment failed', function (response) {
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
    })
}

//add-expense
function addexpense(e) {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    const obj = {
        amount: amount,
        description: description,
        category: category
    }

    axios.post('http://localhost:3000/addexpense', obj, { headers: { 'Authorization': token } })
        .then(response => {
            console.log(response.data);

            const expenseContainer = document.getElementById('expense-display');

            const id= response.data.expense.id;
            const div = document.createElement('div');
            div.innerHTML = `
                <div class='display-expense-inside' id='display-${id}'>
                    <span>${amount}</span>
                    <span>${description}</span>
                    <span>${category}</span>
                <button id='del-btn-inside' onclick='deletee(${id})'>Delete</button>
                </div>`;
        
            expenseContainer.appendChild(div);

            alert('expense added');
        })
        .catch(err => {
            console.log(err);
        });
}

//remove expense
function deletee(expenseId) {
    // console.log(token)
    axios.post(`http://localhost:3000/delete-expense/${expenseId}`, { headers: { 'Authorization': token } })
        .then(response => {
            console.log(response.data);
            alert('deleted successfully');
        }).catch(err => console.log(err));

    document.getElementById(`display-${expenseId}`).remove();
}

/////////////////////////////////////////////////////////////

window.addEventListener('DOMContentLoaded', () => {
    //get-expenses
    const limit = localStorage.getItem('pageLimit');
    axios.get(`http://localhost:3000/get-expense?limit=${limit}&userId=${userId}`, { headers: { 'Authorization': token } })
        .then(response => {
            // console.log(response.data);
            showExpensesNew(response);
        }).catch(err => console.log(err));
})


//daily-expense
function showExpensesNew(response) {
    const displayDiv = document.getElementById('expense-display');
    displayDiv.innerHTML = '';

    response.data.expense.forEach(expense => {
        const div = `
            <div class='display-expense-inside' id='display-${expense.id}'>
                <span>${expense.amount}</span>
                <span>${expense.description}</span>
                <span>${expense.category}</span>
            <button id='del-btn-inside' onclick='deletee(${expense.id})'>Delete</button>
            </div>`;

        displayDiv.innerHTML += div;
    })

    //pagination
    const pagination = document.getElementById('pagination');
    pagination.classList.add('pagination');
    let paginationChild = '';

    if (response.data.pagination.currentPage !== 1 && response.data.pagination.previousPage !== 1) {
        paginationChild += `<button class='pagination-btn' id='pagination' onclick='paginationFunc(${1})'>First</button>`;
    }

    if (response.data.pagination.hasPreviousPage) {
        paginationChild += `<button class='pagination-btn' id='pagination' onclick='paginationFunc(${response.data.pagination.previousPage})'>Prev</button>`;
    }

    paginationChild += `<button class='pagination-btn' id='pagination' onclick='paginationFunc(${response.data.pagination.currentPage})'>${response.data.pagination.currentPage}</button>`;

    if (response.data.pagination.hasNextPage) {
        paginationChild += `<button class='pagination-btn' id='pagination' onclick='paginationFunc(${response.data.pagination.nextPage})'>Next</button>`;
    }

    if (response.data.pagination.lastPage !== response.data.pagination.currentPage && response.data.pagination.nextPage !== response.data.pagination.lastPage) {
        paginationChild += `<button class='pagination-btn' id='pagination' onclick='paginationFunc(${response.data.pagination.lastPage})'>Last</button>`;
    }

    pagination.innerHTML = paginationChild;
}


function paginationFunc(page) {
    const limit = localStorage.getItem('pageLimit');
    console.log(limit)
    axios.get(`http://localhost:3000/get-expense?page=${page}&limit=${limit}&userId=${userId}`, { headers: { 'Authorization': token } })
        .then(response => {
            console.log(response.data)

            showExpensesNew(response);
        })
        .catch(err => {
            console.log(err);
        })
}

function newLimit() {
    const limit = document.getElementById('page').value;
    localStorage.setItem('pageLimit', limit);
    paginationFunc(1);
}

/////////////////////////////////////////////

window.addEventListener('DOMContentLoaded',()=>{
    // for premium users, show leaderborad
    if (localStorage.getItem('premium') === 'true') {
        document.body.style.backgroundColor = '#3399cc';
        const leaderboardContainer = document.getElementById('leaderboard-container');
        leaderboardContainer.style.display = 'block';

        //leaderboard
        axios.get('http://localhost:3000/get-users', { headers: { 'Authorization': token } })
            .then((response) => {
            console.log(response.data)
            const div = document.getElementById('leaderboard-content');
            response.data.forEach(name => {
                div.innerHTML += `
                    <div id='${name.id}' class='user'>
                    <span>${name.name}</span>
                    <span><button id="show-expense" >Show Expense</button></span>
                    </div>`;

                });
            }).catch(err => console.log(err));

        document.getElementById('download-btn').style.display = 'block';
        document.getElementById('btn-rzp').style.display = 'none';
    };
})


document.getElementById('leaderboard-container').addEventListener('click', e=>{
    const id= e.target.parentNode.parentNode.id;
    // console.log(id)
    if(e.target.id === 'show-expense'){
        axios.get(`http://localhost:3000/get-expense?userId=${id}`, { headers: { 'Authorization': token } })
        .then(response => {
            console.log(response.data);
            // console.log(id)
            
            const div= document.getElementById('leaderboard-expense-show');
            div.innerHTML=''
            div.innerHTML+=`<div>
                <span>Amount</span>
                <span>Description</span>
                <span>Category</span>    
                </div>`;
            response.data.expense.forEach(expense => {
                div.innerHTML += `
                    <div id='${expense.id}-exp'>
                    <span>${expense.amount}</span>
                    <span>${expense.description}</span>
                    <span>${expense.category}</span>
                    </div>`;
            })

        }).catch(err => console.log(err));
    }
})


////////////////////////////////

function logout(e) {
    window.location.href = './login.html';
    localStorage.clear();
}

function download() {
    axios.get('http://localhost:3000/download', { headers: { 'Authorization': token } })
        .then(response => {
            if (response.status === 201) {
                var a = document.createElement('a');
                a.href = response.data.fileURL;
                a.download = 'myexpense.csv';
                a.click();
            } else {
                throw new Error(response.data.message);
            }
        }).catch(err => {
            showError(err);
        })
}

function showReports(){
    axios.get('http://localhost:3000/get-reports', { headers: { 'Authorization': token } })
        .then(res=>{
            console.log(res.data);
            document.getElementById('show-reports').innerHTML= '';
            res.data.forEach(report=>{
                document.getElementById('show-reports').innerHTML+= `
                    <li id="${report.id}" style="list-style:none;"><a href="${report.fileUrl}" style="text-decoration:none; color:black;">${report.fileUrl}</a></li>
                `;
            })
        }).catch(err=>console.log(err));
}

function showError(err) {
    document.body.innerHTML += `<div style='color:red;'>${err}</div>`
}