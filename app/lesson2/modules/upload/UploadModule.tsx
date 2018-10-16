/// <amd-module name="LeUploadModule"/>

import {IUploaderPara, NewUploader} from "../../../global/components/form/newUploader/newUploader";
import {LeRule} from "../../common/rule/LeRule";
import {Utils} from "../../common/utils";
import tools = G.tools;
import d = G.d;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Loading} from "../../../global/components/ui/loading/loading";

export interface ILeUploadModulePara extends IUploaderPara {
    nameField?: string;
    isExcel?: boolean;
}

export class LeUploadModule extends NewUploader {
    private para: ILeUploadModulePara;

    constructor(para: ILeUploadModulePara) {
        super(Object.assign({}, para, {
            beforeSendFile: (file) => {
                return new Promise((resolve) => {
                    this.getFileMd5(file).then((md5) => {
                        let ajaxData:obj = {
                            status: "md5Check"
                            , md5: md5.toUpperCase()
                            , nameField: para.nameField
                        };
                        LeRule.Ajax.fetch(this.url, {
                            type: "POST",
                            traditional: true,
                            data: ajaxData,
                            timeout: 2000, // 超时的话，只能认为该文件不曾上传过
                            dataType: "json"
                        }).then(({response}) => {
                            resolve(response);
                        }).catch((e) => {
                            // ajax请求失败则只能认为该文件不曾上传过
                            resolve({
                                ifExist: 0,
                            });
                        })
                    }).catch((e) => {
                        // 获取md5值失败则只能认为该文件不曾上传过
                        resolve({
                            ifExist: 0,
                        });
                    });
                })
            }
        }));
        this.para = para;
    }

    getFileMd5(file: File): Promise<string>{
        return new Promise((resolve, reject) => {
            let reader = new FileReader(),
                md5Mark = '';
            reader.onload = (event) => {
                let binary = (event.target as any).result;
                let md5 = Utils.md5(binary).toString();
                md5Mark = md5;
                this.formData = () => {
                    return {
                        md5: md5
                    }
                };
                resolve(md5);
            };
            reader.onerror = (e) => {
                reject(e);
            };
            reader.readAsBinaryString(file);
        });
    }

    upload(): Promise<Array<{data: any, file: File}>>{
        let promises = [];
        this.temporaryFile.forEach((file) => {
            promises.push(this.getFileMd5(file));
        });
        return Promise.all(promises).then((md5s: string[]) => {
            let loading = new Loading({
                msg: '上传中...',
            });
            loading.show();
            return super.upload().then((res) => {
                let promises = [];

                res.forEach((data, index) => {
                    let file = data.file;
                    let uniqueFileName = Utils.md5('' + file.name + file.type + file.lastModifiedDate + file.size),
                        chunksTotal = 0,
                        chunkSize = 5000 * 1024;
                    promises.push(new Promise((resolve, reject) => {
                        if ((chunksTotal = Math.ceil(file.size / chunkSize)) >= 1) {
                            let data = {
                                status: "chunksMerge"
                                , name: uniqueFileName
                                , chunks: chunksTotal
                                , md5: md5s[index].toUpperCase()
                                , file_name: file.name,
                                nameField: this.para.nameField
                            };
                            // let newData = {};
                            // if (this.para.isExcel === false) {
                            //     newData = Object.assign(data, {nameField: this.para.nameField});
                            // } else {
                            //     newData = data;
                            // }
                            LeRule.Ajax.fetch(this.url, {
                                type: 'POST',
                                data: data,
                                traditional: true,
                                // loading: {
                                //     msg: '下载中...'
                                // }
                            }).then(({response}) => {
                                resolve({
                                    data: response,
                                    file
                                });
                            }).catch((err) => {
                                reject(err);
                            })
                        }
                    }));
                });
                return new Promise((resolve, reject) => {
                    Promise.all(promises).then((res) =>{
                        resolve(res);
                    }).catch((e) => {
                        reject(e);
                    }).finally(() => {
                        loading.hide();
                    })
                }) as Promise<Array<{data: any, file: File}>>;
            })
        })
    }
}


export interface IImgUploaderPara extends IComponentPara {
    isMulti?: boolean;
    remark?: string;
    nameField?: string;
    field?: string;
    size?: number;
}

export class ImgUploader extends Component {
    protected upload: LeUploadModule;
    protected isMulti: boolean;
    // protected button: Button;
    protected imgWrapper: HTMLElement;
    protected field: string;

    protected wrapperInit(para: IImgUploaderPara): HTMLElement {
        let accept = {extensions: 'jpg,png'};
        this.isMulti = para.isMulti || false;
        return <div className="img-uploader-wrapper">
            {/*<div className="btn-wrapper">*/}
            {/*{this.button = <Button content={'点击上传'}/>}*/}
            {/*{tools.isEmpty(para.remark) ? null : <div className="uploader-tip">{para.remark}</div>}*/}
            {/*</div>*/}
            <div className="btn-wrapper">
                {this.upload = <LeUploadModule nameField={para.nameField} isAutoUpload={true} text={'选择图片'}
                                               url={LE.CONF.ajaxUrl.fileUpload} accept={accept} fileSingleSizeLimit={para.size}
                                               successHandler={(data) => {
                                                   this.changePictures(data);
                                               }} isChangeText={false} isMulti={this.isMulti}/>}
                {tools.isEmpty(para.remark) ? null : <span className="uploader-tip">{para.remark}</span>}
            </div>
            {this.imgWrapper = <div className="pictures-wrapper"/>}
        </div>;
    }

    constructor(para: IImgUploaderPara) {
        super(para);
        this.field = para.field;
        this.closeEvent.on();
        this.enlEvent.on();
    }

    protected closeEvent = (() => {
        let handler = null;
        return {
            on: () => {
                d.on(this.imgWrapper, 'click', '.pic-close', handler = (ev) => {
                    let picEl = d.closest(ev.target as HTMLElement, '.pic-item');
                    if(picEl){
                        let data = picEl.dataset.data,
                            index = this.fileNameMd5.indexOf(data);
                        this.fileNameMd5.splice(index, 1);
                        this.upload.delFile(index);
                        d.remove(picEl);
                    }
                })
            },
            off: () => {
                d.off(this.imgWrapper, 'click', '.pic-close', handler);
            }
        }
    })();

    protected enlEvent = (() => {
        let handler = null,
            imgEl: HTMLImageElement = null,
            index: number = 0;
        let showImg = (src) => {
            if (tools.isNotEmpty(src)) {
                let arrowLeft = null,
                    arrowRight = null,
                    body = <div className="picture-modal-body" style="height: 100%; width: 100%; text-align: center;">
                        {this.isMulti ? arrowLeft = <a className="arrow arrow-left">
                            <i className="sec seclesson-zuojiantou"/>
                        </a> : null}
                        {this.isMulti ? arrowRight = <a className="arrow arrow-right">
                            <i className="sec seclesson-youjiantou"/>
                        </a>: null}
                    </div>;

                if(this.isMulti){
                    d.on(arrowLeft, 'click', () => {
                        changeImg(-1);
                    });
                    d.on(arrowRight, 'click', () => {
                        changeImg(1);
                    });
                }

                new Modal({
                    header: {
                        title: '查看大图',
                        isFullScreen: true,
                    },
                    width: '800px',
                    height: '600px',
                    body: body,
                    isOnceDestroy: true
                });

                d.append(body, imgEl = <img style="max-height: 100%; max-width: 100%;" src={src} alt=""/>)
            }
        };

        let changeImg = (flag: number) => {
            index += flag;
            index = index < 0 ? this.fileNameMd5.length - 1 : index;
            index = index >= this.fileNameMd5.length ? 0 : index;

            imgEl.src = LeRule.fileUrlGet(this.fileNameMd5[index], this.field);
        };
        return {
            on: () => {
                d.on(this.imgWrapper, 'click', '.pic', handler = (ev) => {
                    let picEl = d.closest(ev.target as HTMLElement, '.pic-item');
                    if(picEl){
                        let data = picEl.dataset.data;
                        index = this.fileNameMd5.indexOf(data);
                        showImg(LeRule.fileUrlGet(data, this.field));
                    }
                })
            },
            off: () => {
                d.off(this.imgWrapper, 'click', '.pic', handler)
            }
        }
    })();

    changePictures(data: Array<{ data: any, file: File }>) {
        let md5s = [];
        data && data.forEach((item) => {
            let res = item.data;
            md5s.push(res.data[this.field]);
        });
        md5s.length > 0 && (this.value = md5s.join(','));
    }

    protected fileNameMd5: string[] = [];

    set(value) {
        this.value = value;
    }

    get() {
        return this.value;
    }

    set value(md5s: string) {
        if(typeof md5s === 'string'){
            let res = [];
            if(!this.isMulti){
                this.fileNameMd5 = [];
                this.imgWrapper.innerHTML = '';
                res = [md5s].filter((md5) => tools.isNotEmpty(md5));
            }else{
                res = md5s.split(',').filter((md5) => tools.isNotEmpty(md5));
            }

            res.forEach((md5) => {
                // let img = this.innerEl.img as HTMLMediaElement,
                //     placehold = this.innerEl.placehold;
                // img.classList.remove('hide');
                // placehold.classList.add('hide');
                // img.setAttribute('src', LeRule.fileUrlGet(md5, this.field));
                d.append(this.imgWrapper, ImgUploader.initPicItem(LeRule.fileUrlGet(md5, this.field), md5, this.isMulti && !this.disabled));
            });
            this.fileNameMd5 = this.fileNameMd5.concat(res);
        }

    }

    get value() {
        return this.fileNameMd5.join(',');
    }

    protected static initPicItem(url: string, data: string, isClose = false): HTMLElement{
        return <div className="pic-item" data-data={data}>
            <div className="pic">
                <img src={url} alt="图片"/>
            </div>
            {isClose ? <a className="pic-close">
                <i className="sec seclesson-guanbi"/>
            </a> : null}
        </div>
    }

    destroy(){
        this.closeEvent.off();
        this.enlEvent.off();
        super.destroy()
    }
}