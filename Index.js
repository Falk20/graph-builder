const { Worker } = require('worker_threads');

class GraphNode {
  constructor(title, href) {
    this.id = href
    this.label = title;
    this.checked = false;
  }
}

class GraphEdge {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
}

function analizeLink(link) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./scrapRobot.js', { workerData: link });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

function addNodes(links) {
  links.forEach(link => {
    let check = graphNodes.findIndex(node => node.id === link);
    if (check === -1) {
      let url = new URL(link);
      let node = new GraphNode(url.pathname, url.href);
      graphNodes.push(node);
      graphEdges.push(addEdges(mainPage.id, node.id));
    }
  });
}

function addEdges(from, to) {
  return new GraphEdge(from, to);
}

async function run(link) {
  const result = await analizeLink(link);
  addNodes(result);
  mainPage.checked = true;
}

let mainPage = new GraphNode('Home Page', 'https://www.anilibria.tv/');

const graphNodes = [];
const graphEdges = [];

graphNodes.push(mainPage);

run(mainPage.id)
  .then(() => {
    console.log(graphNodes);
    console.log(graphEdges);
  })
  .catch(err => console.error(err));