import BasicPage from "basicPage";
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";
import sys = BW.sys;
import d = G.d;
import {Modal} from "global/components/feedback/modal/Modal";
import {PopMenu} from "../../../global/components/ui/popMenu/PopMenu";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {TurnPage} from "../../module/turnPage/TurnPage";

export = class detailPage extends BasicPage {
    constructor(private para) {
        super(para);
        let detailData;
        let ajaxUrl = para.ajaxUrl;// + currentView.mailid;
        let self = this;

        getData(ajaxUrl, {});

        this.on('refreshData', function () {
            getData(ajaxUrl, {});
        });

        if (this.isMb) {
            // mui('.mui-scroll-wrapper').scroll();

            d.on(para.ulDom, 'click', '.mui-table-view-cell[data-href]:not([data-href=""])', function () {
                let innerDom = d.query('[data-col]', this);
                BwRule.link({
                    link: this.dataset.href,
                    varList: JSON.parse(this.dataset.varList),
                    data: detailData,
                    dataType: innerDom.dataset.dataType,
                    openUrl : self.url,
                });
            });

            //发件人
            d.on(para.ulDom, 'click', '.fold', function () {
                this.classList.toggle('ellipsis-row3');
            });

            let popMenu = new PopMenu({
                arr: ["复制"],
                callback: (target, str) => {
                    sys.window.copy(str);
                }
            });
            d.on(para.ulDom, 'longtap', '.mui-col-xs-8, [data-col=CONTENT]', function (e) {
                let position = this.getBoundingClientRect(),
                    x1 = this.offsetWidth / 2,
                    x2 = position.left,
                    left = x1 + x2,
                    top = position.top;

                popMenu.show(top, left, tools.str.removeHtmlTags(this.innerHTML));
            });

            d.on(para.btns, 'click', 'span[data-button-type]', function (e) {
                ButtonAction.get().clickHandle(ButtonAction.get().dom2Obj(this), detailData);
            });


            let locData = JSON.parse(window.localStorage.getItem('nextKeyField')),
                curIndex = window.localStorage.getItem('currentKeyField');

            if(tools.isNotEmpty(curIndex)){
                new TurnPage({
                    curIndex : parseInt(curIndex),
                    len : locData.length,
                    onChange : (index) => {
                        getData(ajaxUrl.substr(0, ajaxUrl.indexOf('?')), Object.assign({
                            nopage : true,
                        },locData[index]));
                    }
                });
            }


            let field = para.tableUi.scannableField;
            if(tools.isNotEmpty(field)){
                require(['MobileScan'],  (M) => {
                    let ui = para.tableUi;
                    new M.MobileScan({
                        scannableType : ui.scannableType,
                        scannableTime : ui.scannableTime,
                        callback: (ajaxData) => {
                            getData(ajaxUrl, {
                                [field] : ajaxData.mobilescan
                            });
                        }
                    });
                });
            }


        } else {

            d.on(para.btns, 'click', '[data-button-type]', function (e) {
                ButtonAction.get().clickHandle(ButtonAction.get().dom2Obj(this), detailData, () => {}, self.url);
            });

            d.on(para.list, 'click', '.list-group-item[data-href]:not([data-href=""])', function () {
                let innerDom = d.query('[data-col]', this);
                BwRule.link({
                    link: this.dataset.href,
                    varList: JSON.parse(this.dataset.varList),
                    data: detailData,
                    dataType: innerDom.dataset.dataType,
                });
            });
        }
        function getData(ajaxUrl, ajaxData) {
            BwRule.Ajax.fetch(ajaxUrl, {
                data: ajaxData
            }).then(({response}) => {
                if (response.data.length === 0) {
                    Modal.alert('数据为空');
                    return;
                }
                para.dataCols && para.dataCols.forEach(function (el) {
                    let html = response.data[0][el.dataset.col];
                    if (html === null || html === undefined) {
                        d.remove(el.parentNode);
                    } else {
                        el.innerHTML = BwRule.formatText(html, {
                            dataType: el.dataset.dataType,
                            displayFormat: el.dataset.displayFormat
                        });
                    }
                });
                detailData = response.data[0];
                let inputBox = new InputBox({
                    container: para.btns,
                    size: 'small',

                });
                Array.isArray(para.data) && para.data.forEach((d) => {
                    let button = new Button({
                        content: d.title,
                        icon: d.icon,
                        // type:'default',
                        onClick: () => {
                            ButtonAction.get().clickHandle(d, detailData);
                        }
                    });
                    inputBox.addItem(button);
                });
            });
                // Rule.ajax(ajaxUrl, {
            //     data: ajaxData,
            //     success: function (response) {
            //         if (response.data.length === 0) {
            //             Modal.alert('数据为空');
            //             return;
            //         }
            //         Array.prototype.forEach.call(para.dataCols, function (el) {
            //             let html = response.data[0][el.dataset.col];
            //             if (html === null || html === undefined) {
            //                 el.parentNode.parentNode.removeChild(el.parentNode);
            //             } else {
            //                 el.innerHTML = Rule.formatText(html, {
            //                     dataType: el.dataset.dataType,
            //                     displayFormat: el.dataset.displayFormat
            //                 });
            //             }
            //         });
            //         detailData = response.data[0];
            //         let inputBox = new InputBox({
            //             container: para.btns,
            //             size: 'small',
            //
            //         });
            //         para.data[0] && para.data.forEach((d) => {
            //             let button = new Button({
            //                 content: d.title,
            //                 icon: d.icon,
            //                 // type:'default',
            //                 onClick: () => {
            //                     ButtonAction.get().clickHandle(d, detailData);
            //                 }
            //             });
            //             inputBox.addItem(button);
            //         });
            //     }
            // });
        }
    }
}