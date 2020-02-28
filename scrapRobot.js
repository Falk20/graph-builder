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
            if (a.href !== '') {
                let check = a.pathname;
                if (check.includes('.')) {
                    if (/(\.(html?|php))$/.test(check)) {
                        anchors.push(a.href);
                    }
                } else {
                    anchors.push(a.href);
                }
            }
        });
        return anchors;
    })
    .end()
    .then(urls => {
        let links = [];
        [...new Set(urls)].forEach(href => {
            let link = new URL(href);
            if (link.origin == url.origin) {
                links.push(link.origin + link.pathname);
            }
        });
        parentPort.postMessage(links);
    })
    .catch(err => console.log(err));