/// <amd-module name="GlobalTestModule"/>
import {PermissionTreeItem} from "./components/navigation/permissionTree/permissionTreeItem";

let urlStr = 'https://bwd.sanfu.com/sf/app_sanfu_retail/null/treepick/n3019_data-3019/test-multipick-001?pageparams=%7B%22index%22%3D1%2C%22size%22%3D3000%2C%22total%22%3D1%7D';
G.Ajax.fetch(urlStr).then(({response}) => {
    let res = JSON.parse(response);
    new PermissionTreeItem(Object.assign({}, res.data[0], {
        container: document.body
    }));
});
