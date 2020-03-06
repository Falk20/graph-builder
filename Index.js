const GraphBuilder = require('./classes/GraphBuilder');
// указываем число потоков
let graph = new GraphBuilder(4);
// указываем ссылку на ресурс для анализа
graph.runAnalize('https://www.anilibria.tv/');