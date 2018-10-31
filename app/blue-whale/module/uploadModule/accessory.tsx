/// <amd-module name="Accessory"/>

import {FormCom} from "../../../global/components/form/basic";
import tools = G.tools;
import d = G.d;
import {AccessoryItem, IAccessoryItem} from "./accessoryItem";
import {IUploaderPara, Uploader} from "../../../global/components/form/upload/uploader";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import UploadModule from "./uploadModule";
import {Loading} from "../../../global/components/ui/loading/loading";
import {BwRule} from "../../common/rule/BwRule";

export interface IFileInfo {
    unique?: string;
    fileSize?: number;
    fileName?: string;
    addr?: string;
}

export interface IAccessory extends IUploaderPara {
    caption?: string;
    uniques?: string;
    fileInfoAddr?: R_ReqAddr;//文件信息获取地址
    onComplete?(this: UploadModule, ...any); // 上传完成回调
    onError?(file: obj); // 上传失败回调
    onChange?: Function; // 上传成功回调
    field?: R_Field; //文件字段
    onDelete?();// 删除回调
    pageData?: obj; //页面默认数据
}

export class Accessory extends FormCom {

    public uploader: Uploader;
    private fileType: string = '';

    set(data: string): void {
        this.value = data || '';
    }

    set value(value: string) {
        this._value = value || '';
        if (tools.isNotEmpty(value)) {
            switch (this.fileType) {
                case '47':
                case '48': {
                    BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule.reqAddr(this.para.fileInfoAddr, this.para.pageData)).then(({response}) => {
                        this.files = response.dataArr || [];
                    })
                }
                    break;
                // case '40':
                case '43': {
                    this.files = [{
                        unique: value,
                        fileName: this.para.pageData[this.para.nameField],
                        fileSize: 0,
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

    get() {
        let value = this.files || [],
            trueVal = [];
        if (this.fileType === '43') {
            value.forEach(v => {
                trueVal.push(v.fileName);
            });
        } else {
            value.forEach(v => {
                trueVal.push(v.unique);
            });
        }
        return trueVal.join(',');
    }

    private accessoryBodyWrapper: HTMLElement = null;

    protected wrapperInit(para: IAccessory): HTMLElement {
        return <div className="accessory-wrapper">
            <div className="accessory-title">{para.caption || '附件'}</div>
            {
                this.accessoryBodyWrapper = <div className="accessory-body">
                    <div c-var="uploader" className="upload"><i className="appcommon app-jia"/>添加附件</div>
                </div>
            }
        </div>;
    }

    constructor(private para: IAccessory) {
        super(para);
        this.fileType = para.field.dataType || para.field.atrrs.dataType;
        this.value = para.uniques || '';
        this.createUploader();
        this.initEvent.on();
    }

    private loading: Loading = null;

    private createUploader() {
        if (tools.isEmpty(this.para.uploadUrl)) {
            Modal.alert('附件上传地址不能为空!');
            return;
        }
        this.uploader = new Uploader({
            container: this.innerEl.uploader,
            uploadUrl: this.para.uploadUrl || BW.CONF.ajaxUrl.fileUpload,
            accept: this.para.accept,
            nameField: this.para.nameField || 'FILE_ID',
            thumbField: this.para.thumbField,
            onComplete: (res, file, type) => {
                if (type === 1) {
                    if (this.loading) {
                        this.loading.hide();
                        this.loading.destroy();
                        this.loading = null;
                        document.body.classList.remove('up-disabled');
                    }
                    if (res.code == 200 || res.errorCode === 0) {
                        Modal.toast('上传成功!');
                        if (this.fileType === '43'){
                            this.para.onComplete && this.para.onComplete.call(this, res, file);
                            this.files =[{
                                unique:res.data.blobField.value,
                                fileName:file.name,
                                fileSize:file.size,
                                addr: ''
                            }] ;
                        }else if(this.fileType === '47'){
                            this.value = res.data.unique;
                        }else{
                            let v = this.get();
                            this.value = tools.isNotEmpty(v) ? v + ',' + res.data.unique : res.data.unique;
                        }
                    } else {
                        this.para.onError && this.para.onError.call(this, file);
                        Modal.alert(res.msg || res.errorMsg);
                    }
                }
            }
        });

        // 有文件被选中时
        this.uploader.on('filesQueued', (files: File[]) => {
            if ((this.fileType === '43' || this.fileType === '47') && files.length > 1) {
                Modal.alert('一次只能上传一个附件!');
            } else {
                this.para.onChange && this.para.onChange();
                //开始上传
                if (!this.loading) {
                    this.loading = new Loading({
                        msg: '上传中...',
                        container: document.body
                    });
                    document.body.classList.add('up-disabled');
                }
                this.uploader.upload(1);
            }
        });

        this.uploader.on("error", (type) => {
            const msg = {
                'Q_TYPE_DENIED': '文件类型有误',
                'F_EXCEED_SIZE': '文件大小不能超过4M',
            };
            if (this.loading) {
                this.loading.hide();
                this.loading.destroy();
                this.loading = null;
                document.body.classList.remove('up-disabled');
            }
            Modal.alert(msg[type] ? msg[type] : '文件出错, 类型:' + type)
        });
    }

    protected _listItems: AccessoryItem[] = [];
    get listItems() {
        return this._listItems.slice();
    }

    // 渲染附件列表
    render(data: IFileInfo[]) {
        if (tools.isEmpty(data)) {
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
        para = Object.assign({}, para, {
            container: this.accessoryBodyWrapper,
            index: this.files.length
        });
        return new AccessoryItem(para);
    }

    private initEvent = (() => {
        let deleteEt = (e) => {
            let indexEl = d.closest(e.target, '.accessory-item'),
                index = parseInt(indexEl.dataset.index);
            if (this.fileType === '43'){
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
        let i = index - 1;
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