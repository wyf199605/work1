/// <amd-module name="GlobalTestModule"/>
import f = G.d;
let levelArr = ['一级', '二级', '三级', '四级', '五级', '六级', '七级', '八级', '九级', '十级'],
    wrapper = document.body;
let titleHtml = [];
let maxDeep = 4;
console.time()
for (let i = 0; i < maxDeep; i++) {
  titleHtml.push(`<div class='level-title' style='width:${100 / maxDeep + "%"}'>${levelArr[i]}</div>`);
}
wrapper.innerHTML = titleHtml.join('');
console.timeEnd()
// let widthObj = {
//     width:100 / maxDeep + "%"
// };
// console.time()
// for (let i = 0; i < maxDeep; i++) {
//     f.append(wrapper,<div className='level-title' style={widthObj}>{levelArr[i]}</div>);
// }
// console.timeEnd()