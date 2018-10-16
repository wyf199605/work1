/// <amd-module name="Print"/>
import Shell = C.Shell;
import {Draw} from "../../global/utils/draw";
import {QrCode} from "../../global/utils/QRCode";
import {Com} from "../../com";
interface IFooter {
    caption: string,
    value?: string,
}
interface IPrintDataPara {
    header?: IFooter[],
    detail?: obj[],
    footer?: IFooter[],
    ChkUser? : IFooter
    PrintNote?: string,
    HotLineNumber?: string
    coupon?: ICoupon
    voucher?: obj[]
}
interface ICoupon {
    config: {
        fieldName: string,
        type: string
    }[],
    value: obj[]
}
interface IPrintPara {
    data?: IPrintDataPara,
    afterPrint?(),
    isTest?: boolean  // 是否为测试打印
}
interface IVoucherArr {
    name: string,
    num: number,
    arr: obj[]
}

let fontSize = 22, Y = fontSize * 6 / 5;  // 一个文字高度差
let x0 = 0,   // 起始位置
    x1 = 300, // head 右边x位置
    x2 = 360, // detail，foot 右边x位置
    x3 = 170, // foot 中间位置
    x4 = 140, // 热线、退换货校验位置
    x5 = 450; // 优惠券张数位置

/**
 * 使用画布需事先计算好所有字段的位置及高度
 * @param {IPrintPara} print
 */
export function cashReceiptPrint(print: IPrintPara) {
    let conf = window.localStorage.getItem('printerConf'),
        printerConf: IPrintConfPara = JSON.parse(conf),
        text = printerConf.text;

    let para = Object.assign({}, print),
        tableData =  Com.countItemList && Com.countItemList.getData() && Com.countItemList.getData()[0];

    let isExist = false;
    para && para.data && Array.isArray(para.data.footer) && para.data.footer.forEach((obj, index) => {
        if(obj.caption === '收款'){
            isExist = true;
        }
        if(obj.caption === 'PAYMODE'){
            para.data.footer[index] = {
                caption : '收款',
                value : obj.value + tableData.RECEIVABLES
            }
        }
    });

    if(!isExist){
        para && para.data && para.data.footer.push({
            caption : '找零',
            value : tableData.CHANGE + ''
        });
    }

    printReceipt(para, text);
    if (printerConf.check) {
        printReceipt(para, '本条仅用于促销，不作为退换货凭据！');
    }

}

function printReceipt(print: IPrintPara, printText: string) {
    let para = print.data;
    if (print.isTest) {
        let test = new Draw({
            width: 800,
            height: 200,
        });
        text(test, '打印机打印测试成功。', 150, 130, 2);
        test.insertImg({x: 150, y: 0, w: 250, h: 100}, "img/sanfu1.png", labelPrintMethod);
        // document.body.appendChild(
        //     test.getCanvas()
        // );
        return;
    }

    let noteArr = strSub(para.PrintNote, 27);  // 每28个字符就换行
    let textArr = strSub(printText, 27);
    let voucherNum = 0, voucherArr: IVoucherArr[] = [], voucherH = 0;

    if (para.voucher) {
        voucherH = Y;
        para.voucher.forEach((v: obj) => {
            voucherNum += (v[2] ? v[2] : 0);
            let arr = strSub(v[1], 24), len = arr.length;
            voucherArr.push({
                name: v[0],
                num: v[2],
                arr: arr,
            });
            voucherH = voucherH + (len + 1) * Y;
        });
    }

    let hData = para.header,
        dData = para.detail,
        fData = para.footer,
        cData = para.coupon && para.coupon.value;

    let ruleLen = 0,
        cTotalLen = 0;
    Array.isArray(cData) && cData.forEach((val) => {
        let keys = Object.keys(val),
            couponRule = val[keys[2]],
            arr = couponRule && couponRule.split('；') || [],
            len = 0;

        Array.isArray(arr) && arr.forEach((obj) => {
            let arr = strSub(obj, 28);
            len += arr.length;
        });
        ruleLen = (len - 1) * Y;
        cTotalLen += ruleLen;
    });

    let hLen = (hData && hData.length) ? hData.length : 0,
        dLen = (dData && dData.length) ? dData.length : 0,
        fLen = (fData && fData.length) ? fData.length : 0,
        cLen = (cData && cData.length) ? cData.length : 0,
        dLong = dLen * (4 * fontSize),         // 详情总长度
        f = Math.ceil(fLen / 3) + 1,
        logoH = 100,                          // logo高度100
        headY = logoH + 10,                   // 头部位置 = logo高度 + 10
        headH = Math.ceil(hLen / 2) * Y,  // 头部高度
        detailY = headY + headH + Y,          // 详情位置 = head高度 + head位置 + 2Y
        footY = detailY + dLong,              // foot位置 = 详情位置 + 详情高度
        checkY = footY + f * Y,               // 退换货校验 = foot位置 + foot高度
        giftY = checkY + (C.tools.isNotEmpty(para.ChkUser) ? Y : 0),  // 赠送优惠券 = 退换货校验 + Y
        noteY = giftY + (cLen === 0 ? 0 : Y), // 提示位置 = 赠送优惠券位置 + (Y 如果有赠送优惠券多一行赠送优惠券提示)
        // noteH = 2 * fontSize + 10,         // 提示高度100
        lineY = noteY + noteArr.length * Y,   // 热线位置 = 提示位置 + 提示高度
        textY = lineY + 2 * Y,                // text位置 = 热线位置 + 2Y
        textH = textArr.length * Y,           // text高度
        voucherY = textH + textY,             // 已使用优惠券位置 = text高度 + 热线高度 + Y
        codeY = voucherH + voucherY + Y,      // 优惠券位置 = voucher高度 + voucher位置
        cHeight = cLen * 230 + cTotalLen + Y,
        height = codeY + cHeight + 50;     // 凭条总长度 ，50为底部预留高度,totalLen优惠券使用说明

    let canvas = new Draw({
        width: 800,
        height: height,
    });
    if(!CA.Config.isProduct){
        // document.body.innerHTML = '';
        // document.body.appendChild(
        //     canvas.getCanvas()
        // );
        // console.log(para);
        // document.body.style.overflow = 'auto';
    }


    canvasConfig(canvas);

    let prints = () => {
        header(canvas, para.header, headY);
        detail(canvas, para.detail, detailY);
        if(C.tools.isNotEmpty(para.ChkUser)){
            text(canvas, para.ChkUser.caption + ':' + para.ChkUser.value, x4, checkY, 2); // 退换货校验
        }
        footer(canvas, para.footer, footY);

        if (cLen > 0) {
            text(canvas, '本单赠送' + cLen + '张优惠券', x4, giftY, 2);
        }

        /*--note、hotLine--*/
        noteArr.forEach((obj, i) => {
            text(canvas, obj, 0, noteY + Y * i, 1);
        });

        text(canvas, para.HotLineNumber, x4, lineY, 2);

        textArr.forEach((obj, i) => {
            text(canvas, printText, 0, textY + i * Y, 2);
        });

        // 已使用优惠券
        voucher(canvas, voucherArr, voucherNum, voucherY);

        // 赠送优惠券
        coupon(canvas, para.coupon, codeY);

    };

    prints();
    prints();
    prints();

    /*--logo--*/
    canvas.insertImg({x: 150, y: 0, w: 250, h: logoH}, "img/sanfu1.png", labelPrintMethod);

}

function voucher(canvas: Draw, data: IVoucherArr[], voucherNum: number, voucherY: number) {
    if (C.tools.isEmpty(data)) {
        return;
    }
    let y = voucherY + Y;
    text(canvas, '------------------------------------------------------------------', 0, voucherY, 1);
    text(canvas, '本单使用' + voucherNum + '张优惠券', x4, y, 2);

    data.forEach((obj: IVoucherArr, i) => {
        if (i > 0) {
            y = y + (data[i - 1].arr.length + 1) * Y
        }

        text(canvas, obj.name, x0, y + Y, 1);
        text(canvas, obj.num + '', x5, y + Y, 1);
        obj.arr.forEach((arr, n) => {
            text(canvas, arr + '', x0, y + (2 + n) * Y, 1);
        });

    })

}

function strSub(str: string, num: number) {
    if (!str) {
        return [];
    }
    let strLen = str.length, data = [], i = 0, position = 0;
    while (position < strLen) {
        let sub = str.substr(position, num);
        data.push(sub);
        position += sub.length;
    }
    return data;
}

function canvasConfig(canvas: Draw) {
    // 修改背景，默认全黑
    canvas.getCanvasCt().fillStyle = 'rgb(255,255,255)';
    canvas.getCanvasCt().fillRect(0, 0, canvas.getCanvas().width, canvas.getCanvas().height);
    canvas.graph(3, {x: 0, y: 282}, {penStyle: 1});
    canvas.getCanvasCt().font = " BOLD 25px Courier New2";
    canvas.getCanvasCt().fillStyle = "black";
}

function coupon(canvas: Draw, coupon: ICoupon, codeY: number) {
    let data = coupon && coupon.value;
    if (C.tools.isEmpty(data)) {
        return;
    }

    let config = coupon.config,
        fieldName = null;

    config.forEach((conf) => {
        switch (conf.type) {
            case '15':
                fieldName = conf.fieldName;
                break;
        }
    });

    text(canvas, '------------------------------------------------------------------', 0, codeY, 1);

    let ruleLen = Y;
    data.forEach((val, i) => {
        let y = (i * 230) + codeY + ruleLen - Y;
        let keys = Object.keys(val);
        text(canvas, val[keys[0]], 0, y + Y, 0);
        text(canvas, val[keys[1]], x2, y + Y, 3);
        if (fieldName) {
            canvas.insertCanvas(QrCode.toCanvas(val[fieldName], 150, 150), x3, y + 70)
        }

        let couponRule = val[keys[2]],
            arr = couponRule && couponRule.split('\n'),
            len = 0;

        Array.isArray(arr) && arr.forEach((obj, n) => {
            let arr = strSub(obj, 28);
            arr.forEach((t, m) => {
                text(canvas, t, 0, y + 230 + (len + m) * Y, 3);
            });
            len += arr.length;
        });
        ruleLen += (len - 1) * Y;
    })

}

function text(canvas: Draw, content: string, x: number, y: number, alignment: number, w?: number, h?: number) {
    canvas.text(content, {x: x, y: y, w: w, h: h}, {
        font: {
            fontSize: fontSize,
            fontStyle: 2
        },
        wrapping: true,
        alignment: alignment
    });
}

function footer(canvas, data: IFooter[], y: number) {
    if (C.tools.isEmpty(data)) {
        return;
    }
    text(canvas, '------------------------------------------------------------------', 0, y, 1);
    data.forEach((foot: IFooter, i) => {
        let index = Math.floor(i / 3),
            footY = y + Y * (index + 1),
            footX = getFootX(i),
            value = foot.caption + ':' + foot.value;

        let position = 0;

        if ([2, 5].includes(i)) {
            position = 1;
        }
        text(canvas, value, footX, footY, position)
    });
}

function header(canvas, data: IFooter[], headY) {
    if (C.tools.isEmpty(data)) {
        return;
    }
    data.forEach((head, i) => {
        let value = head.caption + ':' + head.value;
        text(canvas, value, x1 * (i % 2 === 0 ? 0 : 1), headY + Math.floor(i / 2) * Y, 1);
    });

}

function detail(canvas, data, detailY) {
    if (C.tools.isEmpty(data)) {
        return;
    }
    text(canvas, '------------------------------------------------------------------', 0, detailY - Y, 1);
    let y = detailY;
    data.forEach((obj, i) => {
        let y0 = y + i * (3 * Y + 10),
            y1 = y0 + Y,
            y2 = y1 + Y;
        // 男装
        text(canvas, obj[0], 0, y0, 1);
        // 编码
        text(canvas, obj[1], x2, y0, 2);
        // 衬衫
        text(canvas, obj[2] + ' ' + obj[3], 0, y1, 1);
        // 3705的的面料
        text(canvas, obj[4] + ' ' + obj[5], x2, y1, 2);
        // 价格 X 件数
        text(canvas, obj[6] + 'X' + obj[7], 0, y2, 2);
        // 退货原因
        text(canvas, obj[8], x3, y2, 2);
        // 价格
        text(canvas, obj[9] + '', x2, y2, 2);
    })
}

function getFootX(i: number) {
    let x = 0;
    switch (i % 3) {
        case 1:
            x = x3;
            break;
        case 2:
            x = x2;
            break;
        case 0:
            x = x0;
            break;
    }
    return x;
}

function labelPrintMethod(sag) {
    let conf = window.localStorage.getItem('printerConf'),
        printerConf: IPrintConfPara = JSON.parse(conf),
        driveCode = 0;

    if (printerConf && printerConf.printer) {
        driveCode = printerConf.printer
    }
    Shell.printer.labelPrint(1, driveCode, sag, function (re) {});
}
