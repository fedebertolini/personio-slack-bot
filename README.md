# personio-slack-bot
NodeJS app that fetches today's events from Personio and posts a summary to a Slack channel.

## Installation
First install the node dependencies:
`npm install` or `yarn install`.

Then create a `.env` file (you can use [.env.dist](https://github.com/fedebertolini/personio-slack-bot/blob/master/.env.dist)
as an example). You need to add these environment variable definitions:
- `SLACK_HOOK_URL`: Slack's hook URL that will be used to post messages to Slack.
- `PERSONIO_CALENDARS`: List of calendar identifiers separated by comma. For each calendar id defined
in this list you need to add another two environment variable definitions:
  - `PERSONIO_URL_{CALENDAR_ID}`: Personio's _iCalendar_ link. You can get this link by going to the
 Personio's Calendar page, cliking the `ICAL` button, then changing the filters you want and finally
 copying the link.
  - `PERSONIO_MESSAGE_{CALENDAR_ID}`: When the events are posted to Slack, these are grouped by Calendar
 ID. This env variable defines the group's header.

## Usage
Run `npm run start`.

## Example
`.env` file:
```
SLACK_HOOK_URL=https://hooks.slack.com/services/ABCDEF

PERSONIO_CALENDARS=BIRTHDAY,VACATION

PERSONIO_URL_BIRTHDAY=https://my-company.personio.de/calendar/ical/123456/birthdays/0/calendar.ics
PERSONIO_URL_VACATION=https://my-company.personio.de/calendar/ical/123456/vacations/0/calendar.ics

PERSONIO_MESSAGE_BIRTHDAY=:birthday: *Birthday* :birthday:
PERSONIO_MESSAGE_VACATION=:palm_tree: *Vacation* :palm_tree:
```

Slack message:
```
Sunday 22nd of October - Nut Day

:birthday: *Birthday* :birthday:
- Jane Doe

:palm_tree: *Vacation* :palm_tree:
- Federico Bertolini
- John Doe
```
