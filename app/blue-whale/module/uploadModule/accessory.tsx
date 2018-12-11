/// <amd-module name="Accessory"/>

import {FormCom} from "../../../global/components/form/basic";
import tools = G.tools;
import d = G.d;
import {AccessoryItem, IAccessoryItem} from "./accessoryItem";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {BwRule} from "../../common/rule/BwRule";
import {BwUploader, IBwUploaderPara} from "./bwUploader";

export interface IFileInfo {
    unique?: string;
    filesize?: number;
    filename?: string;
    addr?: string;
}

export interface IAccessory extends IBwUploaderPara {
    uniques?: string;

    onComplete?(...any); // 上传完成回调
    onError?(file: obj); // 上传失败回调
    onChange?: Function; // 上传成功回调
    field?: R_Field; //文件字段
    onDelete?();// 删除回调
    pageData?: obj; //页面默认数据
}

export class Accessory extends FormCom {

    public uploader: BwUploader;
    private fileType: string = '';
    private typeUnique: string = '';

    set(data: string): void {
        this.value = data || '';
    }

    get() {
        let value = this.files || [],
            trueVal = [];
        if (this.fileType === '43') {
            value.forEach(v => {
                v.filename && trueVal.push(v.filename);
            });
        } else {
            value.forEach(v => {
                v.unique && trueVal.push(v.unique);
            });
        }
        return trueVal.join(',');
    }

    set value(value: string) {
        this._value = value || '';
        if (tools.isNotEmpty(value)) {
            switch (this.fileType) {
                case '47':
                case '48': {
                    let fileInfo = this.para.field.fileInfo;
                    if (tools.isNotEmpty(fileInfo)) {
                        let obj: obj = {};
                        obj[this.para.nameField] = value;
                        let fileInfoAddr = BW.CONF.siteUrl + BwRule.reqAddr(fileInfo, Object.assign({}, this.para.pageData, obj));
                        BwRule.Ajax.fetch(fileInfoAddr).then(({response}) => {
                            this.files = response.dataArr || [];
                        })
                    }
                }
                    break;
                // case '40':
                case '43': {
                    this.files = [{
                        unique: value,
                        filename: this.para.pageData[this.para.nameField],
                        filesize: 0,
                        addr: ''
                    }];
                }
                    break;
            }
        } else {
            this.files = [];
        }
    }

    get value() {
        let value = this.files || [],
            trueVal = [];
        value.forEach(v => {
            trueVal.push(v.unique);
        });
        return trueVal.join(',');
    }

    private _files: IFileInfo[];
    set files(files: IFileInfo[]) {
        this._files = files || [];
        this.render(this._files);
    }

    get files() {
        return this._files;
    }

    private accessoryBodyWrapper: HTMLElement;

    protected wrapperInit(para: IAccessory): HTMLElement {
        let wrapper = tools.isMb ? <div className="accessory-wrapper">
            <div className="accessory-title">{para.field.caption || '附件'}</div>
            {
                this.accessoryBodyWrapper = <div className="accessory-body">
                    <div c-var="uploader" className="upload"><i className="appcommon app-jia"/>添加附件</div>
                </div>
            }
        </div> : <div className="accessory-wrapper">
            <div className="accessory-title">{para.field.caption || '附件'}</div>
            {
                this.accessoryBodyWrapper = <div className="accessory-body">
                    <div className="accessory-content-wrapper"/>
                    <div c-var="uploader" className="upload"><i className="iconfont icon-annex"/>添加附件</div>
                </div>
            }
        </div>;
        return wrapper;
    }

    constructor(private para: IAccessory) {
        super(para);
        this.typeUnique = new Date().getTime() + para.field.name;
        this.fileType = para.field.dataType || para.field.atrrs.dataType;
        this.value = para.uniques || '';
        this.createUploader();
        this.initEvent.on();
    }

    private createUploader() {
        if (tools.isEmpty(this.para.uploadUrl)) {
            Modal.alert('附件上传地址不能为空!');
            return;
        }
        this.uploader = new BwUploader({
            loading: {
                msg: '上传中',
                container: document.body,
                disableEl: document.body
            },
            container: this.innerEl.uploader,
            uploadUrl: this.para.uploadUrl || BW.CONF.ajaxUrl.fileUpload,
            accept: this.para.accept,
            nameField: this.para.nameField || 'FILE_ID',
            thumbField: this.para.thumbField,
            text: '',
            onSuccess: (res, file, type) => {
                if (res.code == 200 || res.errorCode === 0) {
                    if (tools.isNotEmpty(res.ifExist)) {
                        Modal.toast('附件已存在!');
                    } else {
                        Modal.toast('上传成功!');
                    }
                    switch (this.fileType) {
                        case '43': {
                            this.files = [{
                                unique: file.name,
                                filename: file.name,
                                filesize: file.size,
                                addr: ''
                            }];
                            this.para.onComplete && this.para.onComplete(res, file);
                        }
                            break;
                        case '47': {
                            this.value = res.data.unique;
                        }
                            break;
                        case '48': {
                            let v = this.get() || '',
                                unique = res.data.unique;
                            if (tools.isNotEmpty(res.ifExist)) {
                                let files = this._files.filter(file => file.unique === unique);
                                if (tools.isEmpty(files)) {
                                    this.value = tools.isNotEmpty(v) ? v + ',' + unique : unique;
                                }
                            } else {
                                this.value = tools.isNotEmpty(v) ? v + ',' + unique : unique;
                            }
                        }
                            break;
                    }
                } else {
                    this.para.onError && this.para.onError(file);
                    Modal.alert(res.msg || res.errorMsg);
                }
            }
        });

        // 有文件被选中时
        this.uploader.on(BwUploader.EVT_FILE_JOIN_QUEUE, (files: File[]) => {
            if ((this.fileType === '43' || this.fileType === '47') && files.length > 1) {
                Modal.alert('一次只能上传一个附件!');
            } else {
                if (files.length > 0) {
                    this.para.onChange && this.para.onChange();
                    //开始上传
                    this.uploader.upload();
                }
            }
        });

        // this.uploader.on("error", (type) => {
        //     const msg = {
        //         'Q_TYPE_DENIED': '文件类型有误',
        //         'F_EXCEED_SIZE': '文件大小不能超过4M',
        //     };
        //     Modal.alert(msg[type] ? msg[type] : '文件出错, 类型:' + type)
        // });
    }

    protected _listItems: AccessoryItem[] = [];
    get listItems() {
        return this._listItems.slice();
    }

    // 渲染附件列表
    render(data: IFileInfo[]) {
        if (tools.isEmpty(data)) {
            this.listItems.forEach(item => {
                item.destroy();
            });
            this._listItems = [];
            this._files = [];
            return;
        }
        d.diff(data, this.listItems, {
            create: (n: IFileInfo) => {
                this._listItems.push(this.createListItem({file: n}));
            },
            replace: (n: IFileInfo, o: AccessoryItem) => {
                o.render(n || {});
            },
            destroy: (o: AccessoryItem) => {
                o.destroy();
                let index = this._listItems.indexOf(o);
                if (index > -1)
                    delete this._listItems[index]
            }
        });
        this._listItems = this._listItems.filter((item) => item);
        this.refreshIndex();
    }

    refreshIndex() {
        this._listItems.forEach((item, index) => {
            item.index = index;
        });
    }

    protected createListItem(para: IAccessoryItem) {
        let container = tools.isMb ? this.accessoryBodyWrapper : d.query('.accessory-content-wrapper', this.accessoryBodyWrapper);
        para = Object.assign({}, para, {
            container: container,
            index: this.files.length
        });
        return new AccessoryItem(para);
    }

    private initEvent = (() => {
        let deleteEt = (e) => {
            let indexEl = d.closest(e.target, '.accessory-item'),
                index = parseInt(indexEl.dataset.index);
            if (this.fileType === '43') {
                this.para.onDelete && this.para.onDelete();
            }
            // 删除
            this.deleteAccessoryItem(index);
        };

        return {
            on: () => {
                d.on(this.wrapper, 'click', '.deleteBtn', deleteEt);
            },
            off: () => {
                d.off(this.wrapper, 'click', '.deleteBtn', deleteEt);
            }
        }
    })();

    private deleteAccessoryItem(index) {
        let i = index;
        let item = this._listItems[i];
        if (item) {
            item.destroy();
            this._listItems.splice(i, 1);
            this._files.splice(i, 1);
            this.refreshIndex();
        }
    }

    destroy() {
        super.destroy();
        this.initEvent.off();
    }

}