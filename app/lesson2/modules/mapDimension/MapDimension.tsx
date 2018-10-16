/// <amd-module name="MapDimension"/>
import {Modal} from "../../../global/components/feedback/modal/Modal";
import d = G.d;
import tools = G.tools;
import {NumInput} from "../../../global/components/form/numInput/numInput";
import {LeBasicPage} from "../../pages/LeBasicPage";
import {Button} from "../../../global/components/general/button/Button";
import SPA = G.SPA;
import {BDMap} from "../../../global/utils/BMap";
import {LeRule} from "../../common/rule/LeRule";
import {buttonAction} from "../LeButton/LeButtonGroup";

interface IMapDimensionPara {
    container?: HTMLElement
    address: string
    notNeedAddr?:boolean
    radius: number
    title: string,
    notRequest : boolean
    position?: number[],   // 默认[119.173392, 26.071787]，福州
    ajaxData? : string
}
interface ITableDataPara{
    activity_latitude : string,
    activity_location_name : string,
    activity_location_radius : number,
    activity_longitude : string,
}
interface IIMapDimensionData {
    onClose?: (longtitude: number, latitute: number, radius : number, caption : string) => void;
}


export class MapDimensionModal extends LeBasicPage {
    private mapDimension : MapDimension;
    private ajaxData : ITableDataPara;
    protected init(para : IMapDimensionPara, data : IIMapDimensionData){
        if(!para.position){
            para.position = [119.173392, 26.071787]
        }
        this.ajaxData = para && para.ajaxData && JSON.parse(para.ajaxData);

        if(G.tools.isNotEmpty(this.ajaxData)){
            para.position = [Number(this.ajaxData.activity_longitude), Number(this.ajaxData.activity_latitude)];
            para.radius = this.ajaxData.activity_location_radius;
            para.address = this.ajaxData.activity_location_name;
        }

        this.mapDimension = new MapDimension();
        this.mapDimension.init(para, this.modal.bodyWrapper, data, this.saveBtnHandle);

        this.modal.position = 'center';
    }

    modalParaGet(){
        return {
            header: {
                title: this.para.title
            },
            className : 'lesson-modal',
        }
    }

    saveBtnHandle(para, data, num){}
}

export class MapModalModify extends MapDimensionModal{
    saveBtnHandle(map, para, num){
        request(map, para,num, LE.CONF.ajaxUrl.mapSave, true);
    }
}
export class MapModalAdd extends MapDimensionModal {
    saveBtnHandle(map, data, num) {
        request(map, data, num, LE.CONF.ajaxUrl.mapAdd);
    }
}

function request(map : MapDimension, para, num, url, isAdd = false) {
    let position = map.position.value.split(','),
        ajaxData = isAdd && para.ajaxData && ('?activity_location_id='+ JSON.parse(para.ajaxData).activity_location_id) || '';

    LeRule.Ajax.fetch(url + ajaxData,{
        type : 'post',
        data : [{
            activity_location_name: map.address.value,
            activity_location_radius: num,
            activity_longitude: position[0],
            activity_latitude: position[1]
        }],
        dataType : 'json'
    }).then(() => {
        buttonAction.btnRefresh(3);
    })
}

export class MapDimension {
    position: HTMLInputElement;
    address: HTMLInputElement;
    numInput : NumInput;
    BDMap : BDMap;

    init(para: IMapDimensionPara , container : HTMLElement, data : IIMapDimensionData, saveBtnHandle) {
        let mapEL, reset,search, searchInput, radius,
            tpl = <div class="map-module">
                <div class="map-module-header">
                    {searchInput = <input className="default" data-name="search" type="text"></input>}
                    {search = <div className="btn btn-dark">搜索</div>}
                    {reset = <div className="btn btn-dark">重置</div>}
                </div>
                {mapEL = <div className="map-module-container"></div>}
                <div class="map-module-footer">
                    <div class="map-module-item">
                        <span>地点名称</span>
                        {this.address = <input placeholder="请输入地点名称" className="default" data-name="address" type="text">{para.address}</input>}
                    </div>
                    <div class="map-module-item">
                        <span className="left-20">半径</span>
                        {radius = <div data-name="radius"></div>}
                    </div>
                    <div class="map-module-item">
                        <span>位置</span>
                        {this.position = <input className="default position" data-name="position" type="text"></input>}
                    </div>
                </div>
                <div className="map-group-btns">
                    <div>
                        <Button content="取消" size="large" onClick={() => {
                            SPA.close();
                        }}/>
                        <Button className="save" content="保存" size="large" type="primary" onClick={() => {
                            let num = this.numInput.get();

                            if(tools.isEmpty(this.address.value)){
                                Modal.alert('地点不能为空');
                                return;
                            }
                            if(tools.isEmpty(this.numInput.value)){
                                Modal.alert('半径不能为空');
                                return;
                            }
                            if(num > 1000){
                                Modal.toast('请输入小于1000的半径');
                                return
                            }
                            let pos = this.BDMap.getPosition();
                            data && data.onClose && data.onClose(
                                tools.isNotEmpty(pos) ? pos.lng : null,
                                tools.isNotEmpty(pos) ? pos.lat : null,
                                num,
                                this.address.value,
                            );


                            if(!para.notRequest){
                                saveBtnHandle(this, para, num);
                            }else {
                                SPA.close();
                            }
                        }}/>
                    </div>
                </div>
            </div>;

        this.numInput = new NumInput({
            container: radius,
        });
        this.setValue(para);

        d.on(search, 'click',  () => {
            this.BDMap.search(searchInput.value);
        });

        d.on(reset, 'click',  () => {
            let point = {
                lat : para.position[1],
                lng : para.position[0]
            };
            this.BDMap.panTo(point);
            this.BDMap.clearOverlays();
            this.BDMap.addOverlay(point);
            this.setValue(para);
        });

        this.mapInit(mapEL, para.position);

        d.append(container, tpl);
    }

    setValue(para){
        this.address.value = para.address || '';
        this.position.value = para.position.join(',');
        this.numInput.set(para.radius);
    }

    private mapInit(container: HTMLElement, position : number[]) {
        // 延时操作，解决第二次打开地图，地图显示不全的bug
        setTimeout(() => {
            this.BDMap = new BDMap({
                container,
                position,
                scroll : true,
                mapClick : (e) => {
                    let point = e.point;

                    this.BDMap.clearOverlays();
                    this.BDMap.addOverlay(point);
                    this.position.value = point.lng + ',' + point.lat;
                    this.BDMap.surroundingPois(point).then(obj => {
                        this.address.value = obj && obj.address;
                    })
                }
            });
        });

    }

}
