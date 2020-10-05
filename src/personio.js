const axios = require('axios');
const icalParser = require('vdata-parser');
const flatten = require('lodash/flatten');
const orderBy = require('lodash/orderBy');
const isWithinInterval = require('date-fns/isWithinInterval');
const endOfDay = require('date-fns/endOfDay');
const addDays = require('date-fns/addDays');

const ignoreList = (process.env.IGNORE_LIST || '').split(',').map(name => name.trim());

exports.getEvents = date => {
    const calendars = getCalendars();
    const calendarParsingPromises = calendars.map(parseCalendar);

    return Promise.all(calendarParsingPromises).then(results => {
        const events = flatten(results);
        return events.filter(event => {
            if (!event.isYearlyEvent) {
                const interval = { start: event.start, end: endOfDay(event.end) }
                return isWithinInterval(date, interval);
            }
            return (
                event.start.getDate() === date.getDate() &&
                event.start.getMonth() === date.getMonth()
            );
        });
    });
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

        let events = data.VCALENDAR.VEVENT.map(event => ({
            calendarId: calendar.id,
            name: removeCalendarName(event.SUMMARY),
            start: parseDate(event.DTSTART.value),
            end: addDays(parseDate(event.DTEND.value), -1),
            isYearlyEvent: isYearlyEvent(event),
        }));

        if (ignoreList.length) {
            events = events.filter(e => ignoreList.indexOf(e.name) === -1);
        }
        return orderBy(events, 'name');
    });
};

const parseDate = dateString => {
    const match = /(\d\d\d\d)(\d\d)(\d\d)/.exec(dateString).slice(1, 4);
    return new Date(match[0], match[1] - 1, match[2]);
};

const isYearlyEvent = event => event.RRULE === 'FREQ=YEARLY';

const removeCalendarName = summary => {
    const match = /(\[.*\]\s+)?(.*)/.exec(summary);
    return match ? match[2] : summary;
};
