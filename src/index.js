require('dotenv').config();
const personio = require('./personio');
const slack = require('./slack');
const dayOfTheYear = require('./dayOfTheYear');

const today = new Date();

Promise.all([
    personio.getEvents(today),
    dayOfTheYear.getToday(),
])
.then(result => {
    const todayEvents = result[0];
    const todayDayOfYear = result[1];
    
    return slack.sendPersonioEvents(today, todayDayOfYear, todayEvents);
})
.catch(error => {
    console.log(error);
});
