const _ = require('lodash');
const axios = require('axios');
const format = require('date-fns/format');

const { SLACK_HOOK_URL, SLACK_CHANNEL } = process.env;

exports.sendPersonioEvents = (day, dayOfYear, events) => {
    const headerText = getHeaderText(day, dayOfYear);
    const eventMessage = getEventsMessage(events);
    const fullMessage = `${headerText}\n\n${eventMessage}`;

    console.log(fullMessage);

    const block = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: fullMessage,
        },
    };
    if (dayOfYear.imageUrl && dayOfYear.title) {
        block.accessory = {
            type: 'image',
            image_url: dayOfYear.imageUrl,
            alt_text: dayOfYear.title
        };
    }

    if (SLACK_HOOK_URL) {
        return sendSlackBlocks([block]);
    }
    return Promise.resolve();
};

const getHeaderText = (day, dayOfYear) => {
    const { href, title } = dayOfYear;
    const dayOfTheYearLink = href && title ? ` - <${href}|${title}>` : '';
    return `*${format(day, 'dddd Do of MMMM')}*${dayOfTheYearLink}`;
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

const sendSlackBlocks = blocks => axios.post(SLACK_HOOK_URL, {
    channel: SLACK_CHANNEL,
    text: '',
    blocks,
});

const getEventTypeMessage = calendarId => process.env[`PERSONIO_MESSAGE_${calendarId}`];
