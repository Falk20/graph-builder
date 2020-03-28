const { Worker } = require('worker_threads');
const EventEmitter = require("events");
const GraphNode = require('./GraphNode');
const GraphEdge = require('./GraphEdge');

let threadReleased = 'thread-released';

class GraphBuilder extends EventEmitter {
  constructor(threadCount) {
    super();
    this.graphNodes = [];
    this.graphEdges = [];
    this.idleThread = this.maxThread = threadCount;

    this.on(threadReleased, () => {
      console.log(`кол-во свободных потоков: ${this.idleThread - 1}`);
      console.log(`кол-во узлов графа: ${this.graphNodes.length}`);
      console.log(`кол-во граней графа: ${this.graphEdges.length}`);

      while (this.idleThread > 0 && this.graphNodes.findIndex(node => !node.checked) !== -1) {
        let chekingNode = this.graphNodes.find(node => !node.checked);
        this.analizeOneNode(chekingNode);
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
        this.addNode(link, checkingNode.id);
      });
      this.emit(threadReleased);
    });
    scrapingRobot.on('error', err => console.log(err));
    scrapingRobot.on('exit', (code) => {
      if (code !== 0)
        console.log(new Error(`Worker stopped with exit code ${code}`));
    });
  }

  addNode(link, parentId) {
    if (this.graphNodes.findIndex(node => node.id === link) == -1) {
      let url = new URL(link);
      let node = new GraphNode(url.pathname, url.href);
      this.graphNodes.push(node);
      if (parentId) {
        let edge = new GraphEdge(parentId, url.href);
        this.graphEdges.push(edge);
      }
    }
  }

  runAnalize(startLink) {
    this.addNode(startLink);
    this.analizeOneNode(this.graphNodes[0]);
  }
}

module.exports = GraphBuilder;