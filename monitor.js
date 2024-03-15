const axios = require('axios');
const md5 = require('md5');

const monitorUrl = ''; // TODO: website page

const notifyMsg = `${monitorUrl} page update.`;

const monitorStep = 30 * 1000;

async function run() {
    let unqmd5 = '';

    while (true) {
        const curPageMd5 = await getTargetUniqMd5();

        log(`current page md5 is ${curPageMd5}`);

        if (!curPageMd5) {
            await sleep(monitorStep);
            continue;
        }

        if (unqmd5 && unqmd5 !== curPageMd5) {
            notify(notifyMsg);
        }

        unqmd5 = curPageMd5;

        await sleep(monitorStep);
    }
}

async function getTargetUniqMd5() {
    try {
        const result = await axios.get(monitorUrl, { timeout: monitorStep });

        const pageHtmlStr = result?.data || '';

        if (!pageHtmlStr) return '';

        return md5(pageHtmlStr);
    } catch (error) {
        console.error(error);
        return '';
    }
}

function log(...msgs) {
    const now = Date.now();
    const ms = String(now).slice(-3);
    const date = new Date(now).toLocaleString();

    console.log(`[${date}.${ms}]`, ...msgs);
}

function notify(msg = '') {
    // TODO: slack notify
    const url = 'https://slack.com/api/chat.postMessage';

    axios
        .post(
            url,
            {
                channel: '',
                text: msg,
            },
            {
                headers: {
                    Authorization: ``,
                },
            }
        )
        .catch((err) => {});
}

function catchException(log, notify) {
    process.on('uncaughtException', function (err) {
        if (log) log(err);
        if (notify) notify(`❌ Uncaught exception ${err.message}`);
    });

    process.on('unhandledRejection', function (err, promise) {
        if (log) log(err);
        if (notify) notify(`❌ Uncaught rejection ${err.message}`);
    });
}

async function sleep(time) {
    return await new Promise((resolve) => {
        setTimeout(() => {
            resolve('');
        }, time);
    });
}

run();

catchException(log, notify);