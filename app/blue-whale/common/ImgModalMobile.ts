/// <amd-module name="ImgModalMobile"/>

import {ImgModalPara} from "../../global/components/ui/img/img";
import CONF = BW.CONF;

export class ImgModalMobile {
    static show(imgData : ImgModalPara) {
        BW.sys.window.open({ url: CONF.url.imgRotate });
        window.localStorage.setItem('imgRotateData', JSON.stringify(imgData));
    }
}