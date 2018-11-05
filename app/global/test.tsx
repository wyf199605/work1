/// <amd-module name="GlobalTestModule"/>
import {PermissionTree} from "./components/navigation/permissionTree/permissionTree";
import {Button} from "./components/general/button/Button";
let pt:PermissionTree = null;
let urlStr = 'https://bwd.sanfu.com/sf/app_sanfu_retail/null/treepick/n3019_data-3019/test-multipick-001?pageparams=%7B%22index%22%3D1%2C%22size%22%3D3000%2C%22total%22%3D1%7D';
G.Ajax.fetch(urlStr).then(({response}) => {
    let res = JSON.parse(response);
    pt = new PermissionTree({
        container: document.body,
        treeData:res.data,
        textHeight:60,
        textWidth:0
    });
});

new Button({
    content:'点击获取变化的值',
    onClick:()=>{
        console.log(pt.get());
    }
})
