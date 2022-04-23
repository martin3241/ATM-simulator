'use strict';

/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data


const account1 = {
  owner: 'Martin Kristoffersson',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2020-11-18T21:31:17.178Z',
    '2020-12-23T07:42:02.383Z',
    '2021-01-28T09:15:04.904Z',
    '2021-04-01T10:17:24.185Z',
    '2021-05-08T14:11:59.604Z',
    '2021-05-27T17:01:17.194Z',
    '2022-03-29T23:36:17.929Z',
    '2022-03-31T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'John Smith',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
// My JS will affect all of the elements so I figured that I will make the selectors simpler
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

// Selector for buttons
const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');

// It you look at line 65 in the html doc, you will see that there is a sorting button (that I commented out). I have tried to make it work but I can't find a way. So I decided to leave it for now
const btnSort = document.querySelector('.btn--sort');

// Login related classes
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');



const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);


// ***CALCULATING CURRENT DATE***
const formatMovementDate = function (date) {
  // I am multiplying the numbers so that I get the ammount of days in milliseconds.
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))

  // If something happened yesterday or today, I dont want the date to be shown, I want it to show: "today"
  const daysPassed = calcDaysPassed(new Date(), date)
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    const now = new Date();
    // padStart gives padding. Example: 4:2 -> 04:02
    const day = `${date.getDate()}`.padStart(2, 0)
    const month = `${date.getMonth() + 1}`.padStart(2, 0)
    const year = date.getFullYear();
    return `${day}/${month}/${year}`
  }
}

// I am making a function that changes the value so that it has the right currency and separators
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value);
}

// It you look at line 65 in the html doc, you will see that there is a sorting button. I have tried to make it work but I can't find a way. So I decided to leave it for now

// This function takes the array of deposits and withdrawals and creates a new html for each.
// I also make it possible to sort the array
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  // if the movements are to be sorted, it should not be written "movements.sort()" because I dont want to change the underlaying data, just a copy of it. They will be sorted ascending from the bottom
  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // I am using the same "i" in order to get the exact date of the transaction from the dates-array
    const date = new Date(acc.movementsDates[i])
    const displayDate = formatMovementDate(date)

    // I didn't like the fact that longer numbers didn't have any separators so I found this formula that helps out. The ".format" calls out the function. The currency is EUR but the formating is according to US
    const formattedMov = formatCurrency(mov, acc.locale, acc.currency);


    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
  `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  })
}


// This function looks into the chosen account and picks an array of ALL the money coming in and out of the account and returns the sum in the "labelBalance" html section
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCurrency(acc.balance, acc.locale, acc.currency);
};


// This function looks at an array of money coming in and out. It then puts all the positive numbers together (incomes), all the negative numbers together (out) and then then gives an interest on all the deposits that are bigger than 1.
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  // Making the display internationalized and with separators
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency)

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(Math.abs(out), acc.locale, acc.currency)

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * acc.interestRate / 100)
    .filter((int, i, arr) => {

      return int >= 1
    })
    .reduce((acc, int) => acc + int, 0)
  labelSumInterest.textContent = formatCurrency(interest, acc.locale, acc.currency)
}

// This function takes the users name (for example Martin Kristoffersson), takes the initials and returns them in lowercase (=mk) (=login name)
const createUsernames = function (accs) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner.
      toLocaleLowerCase()
      .split(' ')
      .map(name => name[0]).join('')
  })
}
createUsernames(accounts);

// Before I made the three functions into one, it used to say "currentAccount" instead of "acc". The reason why is because we will pass in the "currentAccount" when we are calling for it 
const updateUI = function (acc) {
  // Display movements
  displayMovements(acc)
  // Display balance
  calcDisplayBalance(acc)
  // Display summary
  calcDisplaySummary(acc)
}

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0)
    const sec = String(time % 60).padStart(2, 0)

    // Print the remaining time  on the UI every time it is called out
    labelTimer.textContent = `${min}:${sec}`;


    // Log out the user and stop the timer when the timer has reached 0 seconds
    if (time === 0) {
      clearInterval(timer)
      labelWelcome.textContent = 'Log in with "js" and "1111"'
      containerApp.style.opacity = 0;
    }
    // Decrese 1s
    time--
  }
  //Setting the timer to 3 minutes
  let time = 180
  // Call the timer every second
  tick()
  const timer = setInterval(tick, 1000)
  return timer
}

////////////////////////
// Event handlers


// I am only defining this empty variable because I will use it in different functions, for example in the login and the transfer functions. It is good to know where the money is being sent from.
// I also want currentAccount and timer to be global
let currentAccount, timer
// ***FAKE ALWAYS LOGGED IN***
// (So that I dont have to log in all the time during work)
// currentAccount = account1
// updateUI(currentAccount)
// containerApp.style.opacity = 100;

// ***LOGIN BUTTON FUNCTION***
// Lets make this the login button do what it does!
btnLogin.addEventListener('click', function (e) {
  // Prevents the form from submitting
  e.preventDefault()
  // console.log('LOGIN')

  // Im checking if the users account exists
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value);

  // If I wouldn't have put the question mark in front of the ".pin", a faulty pin would have resulted in an error, now the function only reacts to truthy inputs. 

  // The users type in their pin as a string so I have to change that to a number
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // If the user logs in - display UI and message
    // I want to be less formal and say "Welcome back, 'First name'"

    labelWelcome.textContent = `Welcome back,
  ${currentAccount.owner.split(' ')[0]} `

    // Changing the opacity when the user logs in (yes, I am aware that it is a huge security issue to do that, there is a reason why I don't work for a bank :-P )
    containerApp.style.opacity = 100;

    // ***CREATING THE DATE***
    // day/month/year
    const now = new Date();
    const day = `${now.getDate()} `.padStart(2, 0)
    const month = `${now.getMonth() + 1} `.padStart(2, 0)
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0)
    const min = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${day} /${month}/${year}, ${hour}:${min} `


    // Clearing two input fields in one line. I'm just gonna go ahead and give myself a star for that one - ⭐
    inputLoginUsername.value = inputLoginPin.value = '';

    // The cursor remained at the login lables so I removed it (blur)
    inputLoginPin.blur()

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer()

    // I created this function because I have to keep the code dry. Updating the UI
    updateUI(currentAccount)

  }

})

// ***SEND MONEY***
// Im creating the functionality of the Transfer money box. "e" stands for event
btnTransfer.addEventListener('click', function (e) {
  // If I wouldn't have done this part, the page would reload every time I press the button 
  e.preventDefault();
  // Making the input string into a number
  const amount = Number(inputTransferAmount.value)
  const receiverAcc = accounts.find(
    // Checking if the name matches any existing user names and continue if the "find-method" finds a match 
    acc => acc.username === inputTransferTo.value)
  inputTransferAmount.value = inputTransferTo.value = ''


  // You are only allowed to send money if you have more than 0 on your acount & the receiver exists & if you have more (or equal) money to the ammount that you are sending & if the receiver isn't the same as the sender
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    // ? is "optional chaining": if the "receiverAcc" doesn't exist, the operation will fail
    receiverAcc?.username !== currentAccount.username) {
    // Doing the transfer 
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // ***ADD TRANSFER DATE***
    currentAccount.movementsDates.push(new Date().toISOString())
    receiverAcc.movementsDates.push(new Date().toISOString())

    // Updating the UI. This took me hours to figure out so I think I have deserved a pizza 🍕
    updateUI(currentAccount)

    // Reset timer, Starting a new timer
    clearInterval(timer);
    timer = startLogOutTimer()
  }

})

// ***LOAN FUNCTION***
// The "Some-method" checks if anything in the array meets the requirement stated in the method 
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  // Rounded the number down
  const amount = Math.floor(inputLoanAmount.value)


  // You can only loan if the amount is greater than 0 & if you have made a deposit that is 10% of the loan 
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {

      // If the requirements are met, then the movement will be added
      currentAccount.movements.push(amount)


      // Add loan date 
      currentAccount.movementsDates.push(new Date().toISOString())

      // Clearing the UI since an action has been completed
      updateUI(currentAccount)

      // Reset timer and start a new one 
      clearInterval(timer)
      timer = startLogOutTimer()
    }, 3000)
  };
  inputLoanAmount.value = '';
})

// ***DELETE ACCOUNT FUNCTION***
btnClose.addEventListener('click', function (e) {
  e.preventDefault()
  // If the username matches the current accounts
  if (inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username)
    // Delete account
    accounts.splice(index, 1);
    // Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = ''
})


// It you look at line 65 in the html doc, you will see that there is a sorting button. I have tried to make it work but I can't find a way. So I decided to leave it for now
// ***SORTING THE MOVEMENT IN THE ACCOUNT BUTTON***
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
})






