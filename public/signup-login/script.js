function signup(e) {
    e.preventDefault();

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const tel = document.getElementById('tel');
    const pass = document.getElementById('pass');

    const obj = {
        name: name.value,
        email: email.value,
        telephone: tel.value,
        password: pass.value
    }

    axios.post('http://localhost:3000/sign-up', obj)
        .then(response => {
            console.log(response.data);
            if (response.status === 201) {
                alert('Successfuly signed up');
                window.location.href = '../login/login.html';
            }
            else alert('Something went wrong');
        })
        .catch(response => {
            console.log(response);
            if (response.status === 403) alert('User already exists, Please Login');
        });
}

function login(e) {
    e.preventDefault();

    const email = document.getElementById('email');
    const pass = document.getElementById('pass');

    const obj = {
        email: email.value,
        password: pass.value
    }

    axios.post('http://localhost:3000/login', obj)
        .then(response => {
            console.log(response.data);
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                localStorage.setItem('premium', response.data.premium);
                window.location.href = './expense.html';
            }
            else {
                throw new Error('failed to login');
            }
        })
        .catch(err => {
            console.log(err.response.status);
        });
    }

// forgot password
function forgotPass() {
    const resetDiv = document.getElementById('reset-div');
    if(resetDiv.style.display==='block') resetDiv.style.display = 'none';
    else if(resetDiv.style.display==='none') resetDiv.style.display = 'block';
}

function resetLink(event){
    event.preventDefault();
    const emailReset = document.getElementById('email-reset').value;
    // console.log(emailReset.value)
    axios.post('http://localhost:3000/forgot-password', {email: emailReset})
        .then(response => {
            console.log(response.data);
        }).catch(err => console.log(err.response.data));
}

