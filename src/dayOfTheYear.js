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
            title: $('#mainBannerLink').text(),
            href: URL + $('#mainBannerLink').attr('href'),
        }
    });
