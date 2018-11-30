/// <amd-module name="FileUpload"/>

import tools = G.tools;

export interface IFileUpload{
    beforeSendFile?: (file: File) => Promise<any>;
    formData?: () => obj;   // 上传附带数据
    uploadUrl: string;  // 上传地址
    chunk?: {//是否分块
        beforeSendBlock: (block: IFileBlock, ...any) => Promise<any>;
        afterSendFile: (file: File, ...any) => Promise<any>;
        chunkSize: number;  // 分块大小
    }
}

export interface IFileBlock {
    end: number;
    start: number;
    index: number;
}

export class FileUpload{
    protected chunkSize: number;
    protected chunked: boolean;
    protected beforeSendFile: (file: File) => Promise<any>;
    protected beforeSendBlock: (block: IFileBlock, ...any) => Promise<any>;
    protected afterSendFile: (file: File, ...any) => Promise<any>;
    protected uploadUrl: string;
    constructor(para: IFileUpload){
        this.uploadUrl = para.uploadUrl;
        this.beforeSendFile = para.beforeSendFile || Promise.resolve;
        this.formData = para.formData;
        this.chunked = tools.isNotEmpty(para.chunk);
        if(this.chunked){
            this.beforeSendBlock = para.chunk.beforeSendBlock;
            this.afterSendFile = para.chunk.afterSendFile;
            this.chunkSize = para.chunk.chunkSize;
        }
    }

    formData: () => obj;

    // 验证并上传文件
    upload(file: File): Promise<any>{
        return new Promise((resolve, reject) => {
            // 秒传验证
            this.beforeSendFile(file).then((...any) => {
                // 分片验证
                if(this.chunked){
                    this.chunkUpload(file, ...any).then(() => {
                        // 合并请求
                        this.afterSendFile && this.afterSendFile(file, ...any).then((...any) => {
                            resolve(any); // 上传成功
                        }).catch(() => {
                            reject();
                        });
                    }).catch(() => {
                        reject(); // 表示分片上传失败
                    })
                }else{
                    this.uploadFile(file, file.name).then((...any) => {
                        // 合并请求
                        this.afterSendFile && this.afterSendFile(file, ...any).then((...any) => {
                            resolve(any); // 上传成功
                        }).catch(() => {
                            reject();
                        });
                    }).catch(() => {
                        reject(); // 表示分片上传失败
                    })
                }
            }).catch((...any) => {
                console.log(any);
                resolve(...any); // 表示已存在后台
            })
        })
    }

    // 分片验证逻辑
    protected chunkUpload(file: File, ...any) {
        let totalSize = file.size,
            totalPieces = Math.ceil(totalSize / this.chunkSize),
            list: Promise<any>[] = [],
            startSize = 0,
            endSize = 0,
            chunkIndex = 0,
            blob: Blob;

        while (totalPieces --) {
            endSize = startSize + this.chunkSize;
            blob = file.slice(startSize, endSize); // 切片

            list.push(new Promise((resolve, reject) => {
                this.beforeSendBlock({
                    end: endSize,
                    start: startSize,
                    index: chunkIndex,
                }, ...any).then(() => {
                    // 调用文件上传
                    this.uploadFile(blob, file.name).then(() => {
                        resolve();
                    }).catch(() => {
                        reject();
                    });
                }).catch(() => {
                    resolve(); // 返回失败表示文件已存在后台
                });
            }));
            startSize = endSize;
        }
        return Promise.all(list);
    }

    // 文件上传方法
    protected uploadFile(file: Blob, filename: string): Promise<any> {
        let url = this.uploadUrl;
        return new Promise<any>((resolve, reject) => {
            if (tools.isNotEmpty(file) && tools.isNotEmpty(url)) {
                let formData = new FormData();
                let data = this.formData ? this.formData() : null;
                if (data) {
                    for (let key in data) {
                        formData.append(key, data[key]);
                    }
                }
                formData.append('file', file, filename);
                let result = {success: false, uploading: false, progress: 0};
                let xhr = new XMLHttpRequest();
                xhr.open("post", url, true);
                xhr.addEventListener('error', () => {
                    reject();
                });
                xhr.addEventListener('progress', (evt) => {
                    if (evt.lengthComputable) {
                        let percentComplete = Math.round(evt.loaded * 100 / evt.total);
                        result.uploading = true;
                        result.progress = percentComplete;
                    }
                    else {
                        result.uploading = false;
                        result.progress = 0;
                    }
                });
                // xhr.addEventListener("abort", () => reject());
                xhr.addEventListener("load", (ev) => {
                    result.uploading = false;
                    result.success = true;
                    result.progress = 100;
                });
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        resolve(xhr.responseText);
                    }
                };
                xhr.send(formData);
            } else {
                reject()
            }
        })
    }
}