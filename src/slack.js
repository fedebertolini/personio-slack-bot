const _ = require('lodash');
const format = require('date-fns/format');
const IncomingWebhook = require('@slack/client').IncomingWebhook;

const SLACK_HOOK_URL = process.env.SLACK_HOOK_URL;

exports.sendPersonioEvents = (day, dayOfYear, events) => {
    const message = getEventsMessage(events);

    const header = `\n${format(day, 'dddd Do of MMMM')} - ${dayOfYear}\n\n`;
    const fullMessage = header + message;

    console.log(fullMessage);

    sendSlackMessage(fullMessage);
};

const getEventsMessage = events => {
    if (!events.length) {
        return 'Today there are no events in Personio\'s calendar\n';
    }
    const eventGroups = _.groupBy(events, 'calendarId');

    return Object.keys(eventGroups).reduce((message, calendarId) => {
        const groupTitle = getEventTypeMessage(calendarId);
        if (!groupTitle) {
            return message;
        }
        const people = eventGroups[calendarId].reduce((peopleList, event) => {
            return `${peopleList}- ${event.name}\n`;
        }, '');
        return `${message}${groupTitle}\n${people}\n`;
    }, '');
}

const sendSlackMessage = message => {
    const webhook = new IncomingWebhook(SLACK_HOOK_URL);
    webhook.send(message, (err, header, statusCode, body) => {
        if (err) {
            console.log('Slack Error:', err);
        } else {
            console.log('Received', statusCode, 'from Slack');
        }
    });
};

const getEventTypeMessage = calendarId => process.env[`PERSONIO_MESSAGE_${calendarId}`]
