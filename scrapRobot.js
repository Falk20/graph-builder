const { workerData, parentPort } = require('worker_threads')
const Nightmare = require('nightmare');

const nightmare = Nightmare({ show: false });

const url = new URL(workerData);


nightmare
    .goto(url)
    .wait()
    .evaluate(() => {
        let anchors = [];
        Array.prototype.forEach.call(document.querySelectorAll('a'), (a) => {
            anchors.push(a.href);
        });
        return anchors;
    })
    .end()
    .then(urls => {
        let links = [...new Set(urls)];
        parentPort.postMessage(links);
    })
    .catch(err => console.log(err));