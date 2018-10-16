/// <amd-module name="PrivilegeDefault"/>
import CONF = BW.CONF;
import d = G.d;
import {PrivilegeDP} from "./privilegeDP";
import {Modal} from "../../../global/components/feedback/modal/Modal";

export class PrivilegeDefault extends PrivilegeDP {
    private urls;
    constructor(protected dom,url?:string) {
        super(dom,url);
        this.pageType = 'DEFAULT';

        this.urls = [
            this.confUrl('/col/reset',url),
            this.confUrl('/col/save',url),
            this.confUrl('/col/del',url),
            this.confUrl('/level/reset',url),
            this.confUrl('/level/save',url),
            this.confUrl('/level/del',url)
        ];
        this.generate();
    }

    private generate() {
        let privGroup = d.create('<div class="priv-group"></div>'),
            confWrapper = d.create(`<div class="priv-wrapper"></div>`);
        this.dom.appendChild(privGroup);
        this.dom.appendChild(confWrapper);


        this.generatePrivGroup(privGroup);

        this.confSearchDom = d.create(`<div class="conf-search"></div>`);
        this.confSaveDom = d.create(`<div class="conf-save"></div>`);
        this.confContentDom = d.create(`<div class="conf-content"></div>`);
        confWrapper.appendChild(this.confSearchDom);
        confWrapper.appendChild(this.confSaveDom);
        confWrapper.appendChild(this.confContentDom);

        //构建保存模块
        this.generateSave();
        //默认构建属性搜索框
        this.generateFieldSearch();
        //构建属性、层级切换菜单模块
        this.generatePLSwitchMenu();
    }

    /**
     * 构造属性/层级菜单
     * */
    private generatePLSwitchMenu() {
        let navContent = d.create('<div class="nav-content"></div>'),
            plSwitchDom = d.create(`<div class="switch-menu"></div>`),
            plContent = d.create(`<div class="pl-content"></div>`),
            fieldLi = d.create(`<li class="li-select"><i class="iconfont icon-tongji"></i>属性</li>`),
            levelLi = d.create(`<li><i class="iconfont icon-function"></i>层级</li>`);

        plSwitchDom.appendChild(fieldLi);
        plSwitchDom.appendChild(levelLi);
        navContent.appendChild(plSwitchDom);
        this.confContentDom.appendChild(navContent);
        this.confContentDom.appendChild(plContent);

        this.generateConfSavaSelectBox(navContent);

        //【属性/层级】切换，默认显示为属性模块
        if (!this.fieldContentDom) {
            this.fieldContentDom = d.create(`<div class="field-content"></div>`);
            plContent.appendChild(this.fieldContentDom);
            this.switchType = 'FIELD';
        }
        this.generateFieldContent();

        d.on(fieldLi, 'click', () => {
            levelLi.classList.remove('li-select');
            fieldLi.classList.add('li-select');
            if (this.levelContentDom) {
                this.levelContentDom.style.display = 'none';
            }
            this.fieldContentDom.style.display = 'block';
            this.switchType = 'FIELD';
            this.generateFieldContent();
        });
        d.on(levelLi, 'click', () => {
            fieldLi.classList.remove('li-select');
            levelLi.classList.add('li-select');
            if (!this.levelContentDom) {
                this.levelContentDom = d.create(`<div class="level-content"></div>`);
                plContent.appendChild(this.levelContentDom);
            }
            this.generateLGContent();
            this.fieldContentDom.style.display = 'none';
            this.levelContentDom.style.display = 'block';
            this.switchType = 'LEVEL';
        });
    }

    judgeControl(){
        this.generateLGContent();
    }

    saveBtnCb() {
        let self = this;
        let privGroupData = self.privGroupTable.rowSelectDataGet(),
            privGroupLen = privGroupData.length,
            fieldRowData = self.fieldTable.rowSelectDataGet();
        //单选权限组
        if (privGroupLen === 1 && self.privGroudId) {
            let delData = [],
                addData = [];
            //属性模块
            if (self.switchType === 'FIELD') {
                if (fieldRowData.length < 1) {
                    Modal.alert('请选择要新增/删除的字段行');
                    return;
                } else {
                    fieldRowData.forEach((d) => {
                        if (d['IS_CHECKED'] && d['FIELD_NAME']) {
                            delData.push(d['FIELD_NAME']);
                        } else if (d['FIELD_NAME']) {
                            addData.push(d['FIELD_NAME']);
                        }
                    })
                }
                //删除属性行
                if (delData[0]) {
                    let json = [{
                        privGroupId: self.privGroudId,
                        operType: '1',
                        operId: '1',
                        fieldName: delData.join(',')
                    }];
                    self.saveResponse(self.urls[2], json, !addData[0]);
                }
                //添加属性行
                if (addData[0]) {
                    let json = [{
                        privGroupId: self.privGroudId,
                        operType: '1',
                        operId: '1',
                        fieldName: addData.join(',')
                    }];
                    self.saveResponse(self.urls[1], json);
                }
            }
            //层级模块
            else if (self.switchType === 'LEVEL') {
                if (!self.delLevelData[0] && !self.resLevelData[0]) {
                    Modal.alert('请对层级权限进行配置！');
                    return;
                }
                if (self.delLevelData[0]) {
                    let join = [];
                    console.log(self.delLevelData, 'delLevelData');
                    self.delLevelData.forEach((delData) => {
                        let obj = {
                            privGroupId: self.privGroudId,
                            operType: '1',
                            operId: '1',
                            levelId: delData['LEVEL_ID'],
                            insType: delData['INS_TYPE'],
                            insValue: delData['INS_VALUE']
                        };
                        join.push(obj);
                    });

                    let isAlert = !self.resLevelData[0];
                    self.saveResponse(self.urls[5], join, isAlert);
                }
                if (self.resLevelData[0]) {
                    let join = [];
                    console.log(self.resLevelData, 'resLevelData');
                    self.resLevelData.forEach((resData) => {
                        let obj = {
                            privGroupId: self.privGroudId,
                            operType: '1',
                            operId: '1',
                            levelId: resData['LEVEL_ID'],
                            insType: resData['INS_TYPE'],
                            insValue: resData['INS_VALUE'],

                        };
                        join.push(obj);
                    });
                    self.saveResponse(self.urls[4], join);
                }
            }
        }
        //多选权限组
        else if (privGroupLen > 1 && self.confSaveSelectBox) {
            let privIds = [];
            privGroupData.forEach((priv) => {
                privIds.push(priv['PRIV_GROUP_ID']);
            });

            //属性模块
            if (self.switchType === 'FIELD') {
                let json = [],
                    fieldNames = [];
                if (fieldRowData.length < 1) {
                    Modal.alert('请选择要新增/删除的字段行');
                    return;
                }
                fieldRowData.forEach((d) => {
                    fieldNames.push(d['FIELD_NAME']);
                });
                json = [{
                    privGroupId: privIds.join(','),
                    operType: '1',
                    operId: '1',
                    fieldName: fieldNames.join(',')
                }];
                self.saveResponse(self.urls[self.confSaveSelectBox.get()[0]], json);
            }
            //层级模块
            else if (self.switchType === 'LEVEL') {
                if (!self.delLevelData[0] && !self.resLevelData[0]) {
                    Modal.alert('请对层级权限进行配置！');
                    return;
                }
                let json = [];
                if (self.delLevelData[0]) {
                    self.delLevelData.forEach((delData) => {
                        let obj = {
                            privGroupId: privIds.join(','),
                            operType: '1',
                            operId: '1',
                            levelId: delData['LEVEL_ID'],
                            insType: delData['INS_TYPE'],
                            insValue: delData['INS_VALUE']
                        };
                        json.push(obj);
                    });
                }
                if (self.resLevelData[0]) {
                    self.resLevelData.forEach((resData) => {
                        let obj = {
                            privGroupId: privIds.join(','),
                            operType: '1',
                            operId: '1',
                            levelId: resData['LEVEL_ID'],
                            insType: resData['INS_TYPE'],
                            insValue: resData['INS_VALUE']
                        };
                        json.push(obj);
                    });
                }
                self.saveResponse(self.urls[self.confSaveSelectBox.get()[0] + 3], json);
            }
        } else {
            Modal.alert('请选择权限组！');
        }
    }
}