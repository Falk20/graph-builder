const GraphBuilder = require('./classes/GraphBuilder');
// указываем число потоков
let treadCount = process.argv[3] ? process.argv[3] > 10 ? 10 : process.argv[3] : 4;
let graph = new GraphBuilder(treadCount);
// указываем ссылку на ресурс для анализа

//https://www.anilibria.tv/
if (process.argv[2]) {
    try {
        graph.runAnalize(process.argv[2]);
    } catch (err) {
        console.log(err);
    }

} else {
    console.log('введите полный url сайта');
}
