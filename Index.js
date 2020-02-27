const { Worker } = require('worker_threads');

let link = 'https://www.anilibria.tv/';

function analizeLink(link) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./scrapRobot.js', { workerData: link });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    })
  })
}

async function run() {
  const result = await analizeLink(link)
  console.log(result);
}

run().catch(err => console.error(err))