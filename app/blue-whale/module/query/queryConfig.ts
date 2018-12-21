/// <amd-module name="QueryConfig"/>
import tools = G.tools;
import d = G.d;
import {NumInput} from "../../../global/components/form/numInput/numInput";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {SelectBox} from "../../../global/components/form/selectBox/selectBox";
import {DropDown} from "../../../global/components/ui/dropdown/dropdown";
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {BwRule} from "../../common/rule/BwRule";

export class QueryConfig {
    private dom : QueryConfigDom;
    private p : QueryConfigPara = {
        showFields : [],
        sectionParams : {
            leftOpenRightClose : false,
            sectionField : '',
            sectionNorm : '',
            avgSection : true,
            sections : [1]
        }
    };

    private isNorm : boolean = false;
    private topN : NumInput;
    private avgSectionTrue : NumInput;
    private avgSectionFalse : NumInput;

    private itemRepeat : CheckBox;
    private restrictionFirst : CheckBox;
    private section : CheckBox;
    private leftOpenRightClose : CheckBox;
    private itemCount : CheckBox;
    private itemSumCount : CheckBox;

    private avgSection : SelectBox;

    private showFields : DropDown;
    private sortFields : DropDown;
    private groupByFields : DropDown;
    private fieldCol : DropDown;

    private sectionField : SelectInput;
    private sectionNorm : SelectInput;

    private caption : ListItem[] = [];
    private numbers  : number[] = [];
    private hasNumber : boolean = true;
    private normField = [{
        text : '年',
        value : 'year'
    },{
        text : '季度',
        value : 'quarter'
    },{
        text : '月',
        value : 'month'
    },{
        text : '周',
        value : 'week'
    },{
        text : '日',
        value : 'day'
    },{
        text : '天',
        value : 'dayofyear'
    },{
        text : '时',
        value : 'hour'
    },{
        text : '分',
        value : 'minute'
    },{
        text : '秒',
        value : 'second'
    },];

    constructor(protected para : QueryConfigDom) {

        this.dom = para;
        this.initLimit();
        this.initSort();
        this.initSection();

        //默认全选
        this.showFields.setAll();
        this.para.setting && this.setting();
    }

    private initSection() {
        let self = this,
            dom = self.dom.limitDom,
            optionSection = d.query('.option-section', dom),
            leftOpenRightClose = query('[data-name="leftOpenRightClose"]'),
            sectionQuery = query('[data-name="sectionQuery"]'),
            sectionField = query('[data-name="sectionField"]'),
            sectionNorm = query('[data-name="sectionNorm"]'),
            avgSection = query('[data-name="avgSection"]'),
            numSection = query('[data-name="numSection"]'),
            fieldCol = query('[data-name="fieldCol"]'),
            section = query('.section'),
            customGrading = query('.customGrading'),
            rightCol = query( '.icon-arrow-right-2.col'),
            closeCol = query( '.icon-close.col'),

            sortRightIcon = d.query('.icon-arrow-right-2.sort', dom),
            sortCloseIcon = d.query('.icon-close.sort', dom);

        function query(name : string){
            return d.query(name, optionSection)
        }

        self.para.cols.forEach(function (col, i) {
            //只显示时间，数值类型
            let dataType = col.atrrs.dataType;
            if(BwRule.isTime(dataType) || BwRule.isNumber(dataType) || dataType === BwRule.DT_BOOL){
                self.caption.push({
                    text: col.caption,
                    value: col.name,
                    dataType: dataType,
                    noSum: col.noSum
                });

                if(BwRule.isNumber(dataType) && col.noSum !== 1) {
                    self.numbers.push(i);
                }
            }

        });

        //无number字段时
        if(!self.caption[0]) {
            self.caption.push({
                text : '',
                value : '',
                dataType : ''
            });
            self.hasNumber = false;
        }

        self.section = new CheckBox({
            container : sectionQuery,
            text : '分段查询',
            onSet : function(isChecked){
                let disData = [leftOpenRightClose, section],
                    disIcon = [sortRightIcon, sortCloseIcon];

                self.sortFields.dataDelAll();
                //勾选设置
                if( isChecked ){
                    self.delDisabled(disData);
                    if(!self.itemCount.get()){
                        self.setDisabled(disIcon);
                    }

                    self.showNumField();
                    //取消勾选分段字段的选中字段
                    self.showFields.unSet(self.showFields.transIndex([self.sectionField.get()]));
                }else {
                    self.setDisabled(disData);
                    if(!self.itemCount.get()){
                        self.delDisabled(disIcon);
                    }
                }
            }
        });

        self.leftOpenRightClose = new CheckBox({
            container : leftOpenRightClose,
            text : '区间左开右闭'
        });

        //分段字段
        self.sectionField = new SelectInput({
            container : sectionField,
            data : self.caption,
            readonly : true,
            clickType : 0,
            onSet : function(item){
                self.toggleNorm(item.dataType);

                //控制勾选
                self.showNumField();
                self.showFields.unSet(self.showFields.transIndex([item.value]));
            }
        });

        //分段标准
        self.sectionNorm = new SelectInput({
            container : sectionNorm,
            readonly : true,
            clickType : 0,
            data : self.normField
        });

        //宽度
        self.avgSectionTrue = new NumInput({
            container : numSection,
            className : 'average',
            defaultNum : 1,
            min : 1,
        });

        //段位
        self.avgSectionFalse = new NumInput({
            container : numSection,
            className : 'customize',
            defaultNum : 0
        });

        //平均，自定义
        self.avgSection = new SelectBox({
            select : {
                multi : false,
                callback : function () {
                    self.toggleAvg();
                }
            },
            container : avgSection,
            data : [{
                value : '1',
                text : '平均段位'
            }, {
                value : '2',
                text : '自定义段位'
            }]
        });

        //段位列表
        self.fieldCol = new DropDown({
            el : fieldCol,
            inline : true,
            className : 'field-col'
        });

        //list
        self.listSelect(self.fieldCol.getUlDom());

        //rightBtn
        d.on(rightCol, 'click', function () {
            let num = self.avgSectionFalse.get(),
                colData = self.fieldCol.getData(),
                isExist = false;
            colData.forEach(function (e) {
                if(num === e.value){
                    isExist = true;
                }
            });
            if(!isExist){
                self.fieldCol.dataAdd([{
                    text : num.toString(),
                    value : num
                }]);
            }

        });

        //close
        self.deleteField(closeCol, fieldCol, self.fieldCol);

        //分段字段
        self.sectionField.set(self.caption[0].value);
        //分段标准
        self.sectionNorm.set('dayofyear');
        self.setDisabled([leftOpenRightClose,section]);

        let  customize = d.query( '.customize', dom);
        customize.classList.add('hide');

        if(!self.hasNumber){
            self.setDisabled([sectionQuery]);
        }
    }

    private initLimit() {
        let self = this,
            dom = self.dom.limitDom,
            optionLimit = query('.option-limit'),
            itemRepeat = limitQuery( '[data-name="itemRepeat"]'),
            itemCount = limitQuery('[data-name="itemCount"]'),
            itemSumCount = limitQuery('[data-name="itemSumCount"]'),
            topN = limitQuery('[data-name="topN"] .topN'),
            restrictionFirst = limitQuery('[data-name="restrictionFirst"]'),
            sectionQuery = query('[data-name="sectionQuery"]'),
            sortRightIcon = query('.icon-arrow-right-2.sort'),
            groupRightIcon = query('.icon-arrow-right-2.group'),
            sortCloseIcon = query('.icon-close.sort'),
            optionSection = query('.option-section'),
            groupCloseIcon = query('.icon-close.group');

        function limitQuery(name : string){
            return d.query(name,optionLimit);
        }
        function query(name : string){
            return d.query(name, dom);
        }
        //topN
        self.topN = new NumInput({
            container : topN,
            min : 0,
            className : 'topN-input',
            callback  : function () {
                if(self.topN && self.topN.get() >= 0){
                    self.delDisabled([restrictionFirst])
                }else {
                    self.setDisabled([restrictionFirst])
                }
            }
        });

        //项不重复
        self.itemRepeat = new CheckBox({
            container : itemRepeat,
            text : '项不重复'
        });

        //仅查项数
        self.itemCount = new CheckBox({
            container : itemCount,
            text : '仅查项数',
            onSet : function(isChecked){
                let disData = [itemSumCount, sortRightIcon, sortCloseIcon];
                if(isChecked){
                    if(self.section.get()){
                        self.setDisabled([itemSumCount]);
                    }else {
                        self.setDisabled(disData);
                    }
                    self.sortFields.dataDelAll();
                    self.showFields.set([]);
                }else {
                    if(self.section.get()){
                        self.delDisabled([itemSumCount]);
                    }else {
                        self.delDisabled(disData);
                    }
                }
            }
        });

        //仅查总数
        self.itemSumCount = new CheckBox({
            container : itemSumCount,
            text : '仅查总数',
            onSet : function (isChecked) {

                let disData = [itemCount, sortRightIcon, sortCloseIcon, groupCloseIcon, groupRightIcon];
                self.sortFields.dataDelAll();
                self.groupByFields.dataDelAll();

                if(isChecked){
                    // if(self.section.get() === 1) {
                    //     self.section.checked = true
                    // }
                    self.setDisabled(disData);
                    self.showNumField();
                }else {
                    self.delDisabled(disData);
                }
                if(self.hasNumber){
                    self.toggleDisabled([optionSection])
                }

            }
        });

        //限制在先
        self.restrictionFirst = new CheckBox({
            container : restrictionFirst,
            text : '限制在先'
        });


        restrictionFirst.classList.add('disabled');
    }

    private initSort(){
        let self = this,
            dom = d.query('.multi-select', self.para.limitDom),
            leftDom = d.query('.select-left', dom),
            rightDom = d.query('.select-right', dom),
            iconDom = d.query('.icon-box', dom),
            allSelect = d.query('.all-select', dom),
            allDec = d.query('.all-dec', dom),
            caption = [];

        self.para.cols.forEach(function (e) {
            caption.push({
                text : e.caption,
                value : e.name,
                dataType : e.dataType,
                noSum : e.noSum
            })
        });

        //显示字段
        this.showFields = new DropDown({
            el  : leftDom,
            data  : caption,
            multi  : true,
            inline  : true,
            className : 'show-field'
        });

        //排序字段
        this.sortFields = new DropDown({
            el : rightDom,
            multi : true,
            inline : true,
            className : 'sort-field'
        });

        //分组字段
        this.groupByFields = new DropDown({
            el : rightDom,
            inline : true,
            className : 'group-field'
        });

        //list
        this.listSelect(self.showFields.getUlDom());
        this.listSelect(self.groupByFields.getUlDom());
        this.listSelect(self.sortFields.getUlDom());

        //right
        self.rightBtnEven(d.query('.icon-arrow-right-2.sort', iconDom), self.sortFields);
        self.rightBtnEven(d.query('.icon-arrow-right-2.group', iconDom), self.groupByFields);
        d.on(d.query('.icon-arrow-right-2.group', iconDom), 'click', function () {

            if(d.query('li.select', leftDom)){
                let groupData = self.groupByFields.getData(),
                    fieldData = self.showFields.getData(),
                    nums = self.numbers.slice(0);
                //显示字段默认勾选存在分组中的字段
                groupData.forEach(function (e) {
                    fieldData.forEach((f, i) => {
                        if(e.value === f.value){
                            let hasNum = false;
                            nums.forEach((n) => {
                                if(n === i){
                                    hasNum = true;
                                }
                            });
                            if(!hasNum){
                                nums.push(i);
                                hasNum = false;
                            }
                        }
                    })
                });
                self.showFields.set([]);
                self.showFields.addSelected(nums);


                let num = self.showFields.get(),
                    index = d.query('li.select', dom) ? parseInt(d.query('li.select', dom).dataset.index): null,
                    isExist = false;

                if(index){
                    num.forEach(function (e) {
                        if(e === index){
                            isExist = true;
                        }
                    });
                    if(!isExist) {
                        self.showFields.addSelected([index]);
                    }
                }
            }
        });

        //close
        self.deleteField(d.query( '.icon-close.sort', iconDom), d.query('.sort-field', rightDom), self.sortFields);
        self.deleteField(d.query('.icon-close.group', iconDom), d.query('.group-field', rightDom),self.groupByFields);

        d.on(allDec, 'click', function () {
            self.showFields.set([]);
            self.showFields.transIndex(['1'])

        });
        d.on(allSelect, 'click', function () {
            self.showFields.setAll()
        });
    }

    /**
     * 获取参数
     * @param save 是否保存
     * @returns {dataConfigPara}
     */
    getPara(save : boolean = false) {
        let self = this,
            p : QueryConfigPara = self.p;

        // 项不重复
        p.itemRepeat = self.itemRepeat.get();

        //仅查项数
        if (self.itemCount.get()) {
            p.itemCount = true;
            p.itemSumCount = false;
            //仅查总数
        } else if (self.itemSumCount.get()) {
            p.itemCount = false;
            p.itemSumCount = true;
        } else {
            p.itemCount = false;
            p.itemSumCount = false;
        }

        //topN
        if(self.topN.get() || self.topN.get() === 0){
            self.p.topN = self.topN.get();
        }else {
            self.p.topN = null;
        }

        //限制在先
        p.restrictionFirst = (self.p.topN >= 0 && self.restrictionFirst.get());
        if(self.p.topN === null){
            p.restrictionFirst = false;
        }
        //分段查询--与仅查总数不同时为true
        if (self.section.get() && !self.itemSumCount.get() || save) {
            p.section = self.section.get();
            //区间左开右闭
            p.sectionParams.leftOpenRightClose = self.leftOpenRightClose.get();
            //分段字段
            p.sectionParams.sectionField = self.sectionField.get();
            //分段标准
            if(self.isNorm) {
                p.sectionParams.sectionNorm = self.sectionNorm.get();
            }else {
                p.sectionParams.sectionNorm = '';
            }


            //宽度，段位列表
            if (self.avgSection.get()[0] === 0) {
                p.sectionParams.avgSection = true;
                p.sectionParams.sections = [self.avgSectionTrue.get()];
            } else {
                p.sectionParams.avgSection = false;
                let data = self.fieldCol.getData(),
                    values = [];

                data.forEach(function (d) {
                    values.push(d.value);
                });
                p.sectionParams.sections = values;
            }

        } else {
            p.section = false;
            // p.sectionParams = null;
        }

        //获取分组字段
        let groupData = self.groupByFields.getData(),
            values = [];
        if(groupData){
            groupData.forEach(function (d) {
                values.push(d.value);
            });
        }
        p.groupByFields = values;

        //获取显示字段
        let showFieldData = self.showFields.getData(),
            showSelect = self.showFields.get() || [],
            showValues = [];

        if(showSelect && showSelect[0]){
            showSelect.forEach(function (s) {
                // showFieldData.forEach(function (d, i) {
                    // if(s === i){
                        showValues.push(s.value)
                    // }
                // })
            });
        }

        //分组字段必定要显示
        values.forEach(v => {
            let isExist = false;
            showValues.forEach( s => {
                if(v === s){
                    isExist = true;
                }
            });
            if(!isExist){
                showValues.push(v);
            }
        });

        //全选默认不传
        if(showFieldData.length === showSelect.length){
            showValues = null;
        }
        p.showFields = showValues;

        //获取排序字段
        let sortData = self.sortFields.getData(),
            select = self.sortFields.get(),
            sortValues = [];
        if(sortData){
            sortData.forEach(function (d,i) {
                let para = d.value;
                select.forEach(function (e) {
                    if(d === e){
                        para = d.value + ',desc'
                    }
                });
                if(typeof para !== 'undefined'){
                    sortValues.push(para);
                }
            });
        }
        p.sortFields = sortValues;

        //剔除空数据
        // console.log(p,'before');

        let data : saveConfigPara = {};
        if(p.section === true || save){
            data = {sectionParams:{}}
        }
        for (let key in p) {
            let d = p[key];
            if (d === false || d === null) {

            } else if( (key === 'sortFields' && !d[0]) || (key === 'groupByFields' && !d[0]) ){

            } else if (key === 'sectionParams') {
                if (p.section === true || save) {
                    for(let item in p.sectionParams){
                        if(!tools.isEmpty(d[item])){
                            data.sectionParams[item] = d[item];
                        }
                    }
                }
            } else if (!tools.isEmpty(p)) {
                data[key] = d;
            }
        }
        if(save){
            data.sectionNumber = self.avgSectionFalse.get();
        }
        // console.log(data,'after');
        return data;
    }




    /**
     * 从cols中取caption或者其他
     * @param name 索引名
     * @param type 要获取的属性
     * @returns {Array}
     */
    public getColCaption(name : string[], type : string){
        let cols = this.para.cols,
            caption = [];
        name.forEach((n) => {
            cols.forEach((c)=> {
                if(c.name === n){
                    caption.push(c[type]);
                }
            });
        });
        return caption;
    }

    /**
     * 保存
     */
    private setting(){
        let self = this,
            data = self.para.setting;
// console.log(data,'setting');
        //分段字段set值
        let sectionField = data.sectionParams;
        if(sectionField){
            //先开启分段查询
            self.section.checked = true;
            //左开右闭
            data.sectionParams.leftOpenRightClose && (self.leftOpenRightClose.checked = true);

            //分段字段
            self.sectionField.set(sectionField.sectionField);
            //分段标准
            self.sectionNorm && self.normField.forEach((n) => {
                if (n.value === sectionField.sectionNorm) {
                    self.sectionNorm.set(n.value);
                }
            });

            //自定义
            if (sectionField.avgSection === false) {
                self.avgSection.addSelected([1]);
                self.toggleAvg();
                //段位
                self.avgSectionFalse.set(data.sectionNumber);
                //段位列表
                sectionField.sections && sectionField.sections.forEach((s) => {
                    self.fieldCol.dataAdd([{
                        text : s.toString(),
                        value : s
                    }]);
                })
            }else {
                //平均段位
                self.avgSectionTrue.set(sectionField.sections[0]);
            }

            //若无分段，关闭分段
            !data.section && (self.section.checked = false);
        }

        //限制字段checkbox
        for(let key in data){
            let d = data[key];
            if(d === true && key !== 'section' && key !== 'restrictionFirst'){
                //按钮命名与字段名相同
                self[key].checked = true;
            }else if( key === 'topN'){
                self.topN.set(d);
                //限制在先
                if(data.restrictionFirst){
                    self.restrictionFirst.checked = true;
                }
            }
        }

        //显示字段dropDown set值操作
        for(let key in data){
            let d = data[key];
            if(!data.showFields){
                this.showFields.setAll();
            }
            if( key === 'showFields'){
                //显示字段不为空
                if(d[0]){
                    self.showFields.set(self.showFields.transIndex(d))
                }
            }else if(key === 'sortFields' || key === 'groupByFields'){
                //排序,分组
                d.forEach((sort) => {
                    let sortValue =  sort.replace(',desc',''),
                        text = self.getColCaption([sortValue], 'caption')[0];

                    if(tools.isNotEmpty(text)){
                        self[key].dataAdd([{
                            text : text,
                            value : sort.replace(',desc','')
                        }]);
                        //降序时
                        if(sort.indexOf(',desc') >= 0){
                            self.sortFields.addSelected(self.sortFields.transIndex([sortValue]));
                        }
                    }
                })
            }
        }
    }

    /**
     * list选中事件
     * @param dom  ul dom
     */
    private listSelect(dom : HTMLElement){
        d.on(dom, 'click', 'li.drop-item', function(){
            let selectDom = d.query('li.select', dom);
            if(selectDom){
                selectDom.classList.remove('select')
            }
            this.classList.add('select');

        });
    }

    /**
     * 字段删除
     * @param icon 按钮dom
     * @param dom  要索引的dom
     * @param dropDown
     */
    private deleteField(icon : HTMLElement, dom : HTMLElement, dropDown : DropDown){
        d.on(icon, 'click', function () {
            let selectDom = d.query( 'li.select', dom);
            if(selectDom){
                let index = parseInt(selectDom.dataset.index);
                dropDown.dataDel(index);
            }
        });
    }

    /**
     * 字段添加
     * @param dom 容器
     * @param dropDown
     */
    private rightBtnEven(dom : HTMLElement, dropDown : DropDown){
        let self = this,
            leftDom = d.query('.select-left', self.para.limitDom);

        d.on(dom,'click',function(){

            let selectDom = d.query('li.select', leftDom),
                isExist : boolean = false;
            if(selectDom){
                let index = parseInt(selectDom.dataset.index);


                if(dropDown === self.sortFields){
                    judgeExist(self.sortFields);
                }else {
                    judgeExist(self.groupByFields);
                }

                if(!isExist){
                    dropDown.dataAdd([{
                        text : self.dom.cols[index].caption,
                        value : self.dom.cols[index].name
                    }]);
                }

            }

            function judgeExist(dropDom){
                if(dropDom.getData()){
                    dropDom.getData().forEach(function (k : ListItem) {
                        if(k.text === selectDom.textContent){
                            isExist = true;
                        }
                    });
                }
            }
        });
    }

    /**
     * 控制显示字段只显示number字段
     */
    private showNumField(){
        this.showFields.set(this.numbers);
    }

    /**
     * 平均，自定义
     */
    private toggleAvg(){
        let  self = this,
            dom = self.dom.limitDom,
            section = d.query('.option-section .section', dom),
            widthInput = query( '.average'),
            spanSegment = query('.segment'),
            spanWidth = query('.width'),
            customGrading = query('.customGrading'),
            iconDom = query('.icon-box-2'),
            fieldCol = query('[data-name="fieldCol"]'),
            customInput = d.query( '.customize', section);

        function query(name : string){
            return d.query(name, section)
        }

        if(self.avgSection.get()[0] === 0){
            self.addHide([iconDom, fieldCol, spanSegment, customInput]);
            self.removeHide([spanWidth,widthInput]);
        }else if(self.avgSection.get()[0] === 1){
            self.removeHide([iconDom, fieldCol, spanSegment, customInput]);
            self.addHide([spanWidth,widthInput]);
        }
    }

    /**
     * 显示或隐藏分段标准
     * @param dataType
     */
    private toggleNorm(dataType : string){
        let sectionNorm = d.query('[data-name="sectionNorm"]', this.para.limitDom);
        if(BwRule.isTime(dataType)){
            this.isNorm = true;
            sectionNorm.classList.remove('hide');
        }else {
            this.isNorm = false;
            sectionNorm.classList.add('hide');
        }
    }

    /**
     * disabled
     * @param dom
     */
    private toggleDisabled(dom : HTMLElement[]){
        dom.forEach(function (d) {
            if(d.classList.contains('disabled')){
                d.classList.remove('disabled')
            }else {
                d.classList.add('disabled')
            }
        });

    }

    private setDisabled(dom : HTMLElement[]){
        dom.forEach(function (d) {
            d.classList.add('disabled');
        });
    }

    private delDisabled(dom : HTMLElement[]){
        dom.forEach(function (d) {
            d.classList.remove('disabled');
        });
    }

    private addHide(dom : HTMLElement[]){
        dom.forEach(function (d) {
            d.classList.add('hide');
        });
    }

    private removeHide(dom : HTMLElement[]){
        dom.forEach(function (d) {
            d.classList.remove('hide');
        });
    }

    /**
     * 获取分段名
     * @returns {string}
     */
    public getSection() : string {
        let section = <HTMLInputElement>d.query('[data-name="sectionField"] input', this.dom.limitDom);
        return section.value;
    }


}