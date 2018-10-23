/// <amd-module name="GlobalTestModule"/>


import {UploadFileList} from "./components/uploadFile/UploadFileList";

new UploadFileList({
    data: [
        {
            uploadUrl: 'test',
            fileInfo: ['1.pdf', '123M']
        }
    ]
});


