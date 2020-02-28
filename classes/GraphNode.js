module.exports = class GraphNode {
  constructor(title, href) {
    this.id = href
    this.label = title;
    this.checked = false;
  }
}