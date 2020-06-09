const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.daysoftheyear.com';

exports.getToday = () => axios.get(URL)
    .then(result => {
        const $ = cheerio.load(result.data, {
            decodeEntities: false,
            normalizeWhitespace: true,
        });

        return {
            title: $('.today .heading a').text(),
            href: $('.today .heading a').attr('href'),
            imageUrl: $('.today img.cover').attr('src'),
        }
    });
