const _ = require('lodash');
const axios = require('axios');
const format = require('date-fns/format');

const { SLACK_HOOK_URL, SLACK_CHANNEL } = process.env;

exports.sendPersonioEvents = (day, dayOfYear, events) => {
    const message = getEventsMessage(events);
    const dayOfTheYearLink = `<${dayOfYear.href}|${dayOfYear.title}>`;
    const header = `\n${format(day, 'dddd Do of MMMM')} - ${dayOfTheYearLink}\n\n`;
    const fullMessage = header + message;

    console.log(fullMessage);

    if (SLACK_HOOK_URL) {
        sendSlackMessage(fullMessage);
    }
};

const getEventsMessage = events => {
    if (!events.length) {
        return "Today there are no events in Personio's calendar\n";
    }
    const eventGroups = _.groupBy(events, 'calendarId');

    return Object.keys(eventGroups).reduce((message, calendarId) => {
        const groupTitle = getEventTypeMessage(calendarId);
        if (!groupTitle) {
            return message;
        }
        const people = eventGroups[calendarId]
            .map(event => {
                if (event.start.getTime() === event.end.getTime()) {
                    return `- ${event.name}`;
                }
                return `- ${event.name} [${formatDate(event.start)} - ${formatDate(event.end)}]`;
            })
            .join('\n');

        return `${message}${groupTitle}\n${people}\n\n`;
    }, '');
};

const formatDate = date => format(date, 'MMMM Do');

const sendSlackMessage = message => axios.post(SLACK_HOOK_URL, {
    channel: SLACK_CHANNEL,
    text: message,
});

const getEventTypeMessage = calendarId => process.env[`PERSONIO_MESSAGE_${calendarId}`];
