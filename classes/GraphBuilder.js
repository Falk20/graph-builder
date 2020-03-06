const { Worker } = require('worker_threads');
const EventEmitter = require("events");
const GraphNode = require('./GraphNode');
const GraphEdge = require('./GraphEdge');

let threadReleased = 'thread-released';
let change = 'change-node';

class GraphBuilder extends EventEmitter {
  constructor(threadCount) {
    super();
    this.graphNodes = [];
    this.graphEdges = [];
    this.idleThread = this.maxThread = threadCount;
    this.on(change, () => {

    });

    this.on(threadReleased, () => {
      console.log('поток свободен');
      console.log(this.graphNodes.length);
      if (this.graphNodes.length < 500) {
        while (this.idleThread > 0 && this.graphNodes.findIndex(node => !node.checked) !== -1) {
          let chekingNode = this.graphNodes.find(node => !node.checked);
          this.analizeOneNode(chekingNode);
        }
      } else {
        console.log(this.graphNodes);
      }
    });
  }

  analizeOneNode(checkingNode) {
    const scrapingRobot = new Worker('./scrapRobot.js', { workerData: checkingNode.id });
    checkingNode.checked = true;
    this.idleThread--;
    scrapingRobot.on('message', (newLinks) => {
      this.idleThread++;

      newLinks.forEach(link => {
        this.addNode(link);
      });
      this.emit(threadReleased);
    });
    scrapingRobot.on('error', err => console.log(err));
    scrapingRobot.on('exit', (code) => {
      if (code !== 0)
        console.log(new Error(`Worker stopped with exit code ${code}`));
    });
  }

  addNode(link) {
    if (this.graphNodes.findIndex(node => node.id === link) == -1) {
      let url = new URL(link);
      let node = new GraphNode(url.pathname, url.href);
      this.graphNodes.push(node);
    }
  }

  runAnalize(startLink) {
    this.addNode(startLink);
    this.analizeOneNode(this.graphNodes[0]);
  }
}

module.exports = GraphBuilder;