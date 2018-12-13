namespace Form {
    export let Cols = {
        colTransfor: function (uiType: string, cols: R_Field[]) {
            let colsData = [];
            cols.forEach(col => {
                let colD: obj = {
                    caption: col.caption,
                    title: col.caption,
                    name: col.name,
                    link: col.link,
                    noAdd: col.noAdd,
                    noShow: col.noShow,
                    noEdit: col.noEdit,
                    noModify: col.noModify,
                    elementType: col.elementType,
                    dataAddr: G.tools.isNotEmpty(col.dataAddr) ? col.dataAddr : null,
                    valueLists: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.valueLists) : "",
                    noSum: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.noSum) : "", //是否记录总数
                    multiPick: G.tools.isNotEmpty(col.multiPick) ? G.tools.str.toEmpty(col.multiPick) : null,
                    dataType: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.dataType) : "", //数据类型
                    displayFormat: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.displayFormat) : "", //展示格式
                    trueExpr: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.trueExpr) : "", //数据为真的值
                    displayWidth: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.displayWidth) : "", //显示长度
                    chkAddr: G.tools.isNotEmpty(col.chkAddr) ? col.chkAddr : "",

                    assignSelectFields: G.tools.isNotEmpty(col.assignSelectFields) ? col.assignSelectFields : null, //关联的其他输入控件名称
                    assignAddr: G.tools.isNotEmpty(col.assignAddr) ? col.assignAddr : null, //查询assign数据的地址，用此地址查询用户输入的数据，得到返回在界面上的数据, name属性为参数
                    atrrs: {
                        maxLength: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.maxLength) : "",
                        maxValue: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.maxValue) : "",
                        minLength: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.minLength) : "",
                        minValue: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.minValue) : "",
                        requieredFlag: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.requieredFlag) : "",
                        defaultValue: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.defaultValue) : "",
                        dataType: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.dataType) : "", //数据类型
                        displayFormat: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.displayFormat) : "", //展示格式,
                        trueExpr: G.tools.isNotEmpty(col.atrrs) ? G.tools.str.toEmpty(col.atrrs.trueExpr) : "" //数据为真的值
                    },
                    lookUpKeyField: col.lookUpKeyField,
                    fileInfo: G.tools.isNotEmpty(col.fileInfo) ? col.fileInfo : null
                };

                // 下钻地址
                if (uiType == 'drill') {
                    colD.drillAddr = col.drillAddr;
                    // fixedNum = 1; // 下钻时锁列数固定为1
                }
                // 自定义钻取地址
                else if (uiType == 'web' || uiType == 'webdrill') {
                    colD.webDrillAddr = col.webDrillAddr;
                    colD.webDrillAddrWithNull = col.webDrillAddrWithNull;
                    // fixedNum = 1; //下钻时锁列数固定为1
                }
                if (G.tools.isNotEmpty(col.elementType) && col.elementType == 'lookup') {

                    //look up
                    colD.comType = 'selectInput';

                    colD.lookUpFieldName = col.lookUpFieldName;

                } else if (G.tools.isNotEmpty(col.elementType) && (col.elementType == 'treepick' || col.elementType == 'pick')) {

                    //PICK UP
                    colD.comType = 'tagsInput';
                    colD.multiValue = col.atrrs.multValue; //单选或多选
                    colD.relateFields = col.assignSelectFields;

                } else if (G.tools.isNotEmpty(col.atrrs.dataType) && (col.atrrs.dataType == '43' || col.atrrs.dataType == '40' || col.atrrs.dataType == '47' || col.atrrs.dataType == '48')) {
                    //文件上传
                    colD.comType = 'file';
                    colD.relateFields = ['FILE_ID'];

                } else if (G.tools.isNotEmpty(col.atrrs.dataType) && (col.atrrs.dataType == '20' || col.atrrs.dataType == '27' || col.atrrs.dataType == '28')) {
                    //图片
                    colD.comType = 'img';
                } else if (G.tools.isNotEmpty(col.atrrs.dataType) && col.atrrs.dataType == '30') {
                    //富文本
                    colD.comType = 'richText';
                } else if (G.tools.isNotEmpty(col.atrrs.dataType) && col.atrrs.dataType == '17') {
                    //toggle
                    colD.comType = 'toggle';
                } else if (G.tools.isNotEmpty(col.atrrs.dataType) && col.atrrs.dataType == '12') {
                    //日期时间控件
                    colD.comType = 'datetime';
                } else if (G.tools.isNotEmpty(col.atrrs.valueLists)) {
                    colD.comType = 'selectInput';
                } else {
                    colD.comType = 'input';
                }
                colsData.push(colD);
            });
            return colsData;
        }
    }
}