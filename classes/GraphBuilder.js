const { Worker } = require('worker_threads');
const EventEmitter = require("events");
const GraphNode = require('./GraphNode');
const GraphEdge = require('./GraphEdge');

let eventName = 'graph-nodes-change';

class GraphBuilder extends EventEmitter {
  constructor(threadCount) {
    super();
    this.graphNodes = [];
    this.graphEdges = [];
    this.idleThread = threadCount;

    this.on(eventName, () => {
      console.log(this.graphNodes.length);
      console.log('потоков: ' + this.idleThread);

      let checkingNode = this.graphNodes.find((node) => !node.checked);
      checkingNode.checked = true;
      console.log(checkingNode);

      if (this.idleThread > 0) {
        this.idleThread--;

        this.analizeNode(checkingNode)
          .then(newLinks => {
            this.idleThread++;
            newLinks.forEach(newLink => {
              if (this.graphNodes.findIndex(node => node.id === newLink) == -1) {
                this.addNode(newLink, checkingNode.id);

              }
            });
          });
      }

    });
  }

  analizeNode(checkingNode) {
    return new Promise((resolve, reject) => {
      const scrapingRobot = new Worker('../scrapRobot.js', { workerData: checkingNode.id });

      scrapingRobot.on('message', (newLinks) => {

        resolve(newLinks);
      });
      scrapingRobot.on('error', reject);
      scrapingRobot.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }

  runAnalize(startLink) {
    this.addNode(startLink);
  }

  addNode(url, from = '') {
    url = new URL(url);
    let node;
    if (this.graphNodes.findIndex(node => node.id === url.href) == -1) {
      node = new GraphNode(decodeURI(url.pathname), url.href);
      this.graphNodes.push(node);
      this.addEdge(from, node.id);
    }
    this.emit(eventName, node);
  }

  addEdge(from, to) {
    let edge = new GraphEdge(from, to);
    this.graphEdges.push(edge);
    console.log(edge);
  }
}

let graph = new GraphBuilder(4);

graph.runAnalize('https://www.anilibria.tv/');


module.exports = GraphBuilder;