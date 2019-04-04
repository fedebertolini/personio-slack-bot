const _ = require('lodash');
const format = require('date-fns/format');
const IncomingWebhook = require('@slack/client').IncomingWebhook;

const SLACK_HOOK_URL = process.env.SLACK_HOOK_URL;

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

const sendSlackMessage = message => {
    const webhook = new IncomingWebhook(SLACK_HOOK_URL);
    webhook.send(message, (err, header, statusCode) => {
        if (err) {
            console.log('Slack Error:', err);
        } else {
            console.log('Received', statusCode, 'from Slack');
        }
    });
};

const getEventTypeMessage = calendarId => process.env[`PERSONIO_MESSAGE_${calendarId}`];
