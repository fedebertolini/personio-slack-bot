const axios = require('axios');
const icalParser = require('vdata-parser');
const flatten = require('lodash/flatten');
const isWithinRange = require('date-fns/is_within_range');
const setYear = require('date-fns/set_year');

exports.getEvents = date => {
    const calendars = getCalendars();
    const calendarParsingPromises = calendars.map(parseCalendar);

    return Promise.all(calendarParsingPromises)
        .then(results => {
            const events = flatten(results);
            return events.filter(event => {
                if (!event.isYearlyEvent) {
                    return isWithinRange(date, event.start, event.end);
                }
                return (event.start.getDate() === date.getDate()) &&
                    (event.start.getMonth() === date.getMonth());
            });
        })
};

const getCalendars = () => {
    const calendarIds = process.env.PERSONIO_CALENDARS.split(',');
    return calendarIds.map(id => ({
        id: id,
        url: process.env[`PERSONIO_URL_${id}`],
    }));
};

const parseCalendar = calendar => {
    return axios.get(calendar.url).then(result => {
        const data = icalParser.fromString(result.data);
        const events = data.VCALENDAR.VEVENT;

        return events.map(event => ({
            calendarId: calendar.id,
            name: getNameFromSummary(event.SUMMARY),
            start: parseDate(event.DTSTART.value),
            end: parseDate(event.DTEND.value),
            isYearlyEvent: isYearlyEvent(event),
        }));
    });
};

const getNameFromSummary = summary => /^([\w\s]*)\W?/.exec(summary)[1].trim();

const parseDate = date => {
    const match = /(\d\d\d\d)(\d\d)(\d\d)/.exec(date).slice(1, 4);
    return new Date(match[0], match[1] - 1, match[2]);
};

const isYearlyEvent = event => event.RRULE === 'FREQ=YEARLY';
