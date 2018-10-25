/// <amd-module name="GlobalTestModule"/>
import {Accessory} from "./components/form/upload/accessory";

new Accessory({
    container:document.body,
    files:[
        {
            fileSize: 123,
            fileName: '测试1.pdf',
            addr: 'test.php'
        },
        {
            fileSize: 456,
            fileName: '测试2.pdf',
            addr: 'test.php'
        }
    ]
});

