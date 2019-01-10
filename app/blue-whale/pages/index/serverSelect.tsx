/// <amd name="ServerSelect"/>

import BasicPage from "../basicPage";
import d = G.d;
import tools = G.tools;
import sys = BW.sys;

export class ServerSelect extends BasicPage {
    constructor(para){
        super(para);
        d.append(para.dom, ServerSelect.initDOM());
        let text = d.query('#serverText') as HTMLTextAreaElement,
            select = d.query('#sel') as HTMLSelectElement,
            uuid = '';

        d.on(select, 'change', () => {
            text.value = select.value;
        });
        d.on(d.query('#login'), 'click', function(){
            sys.window.load(tools.url.addObj(text.value, {uuid: uuid}));
        });
        sys.window.close = function(){
            sys.window.back('');
        };
        if(sys.os==='ip'){
            sys.window.getDevice("uuid");
        }else{
            if(sys.os==='ad'){
                uuid = sys.window.getDevice("uuid").msg;
            }
        }
        window.addEventListener('getDevice', function (e: CustomEvent) {
            let json = JSON.parse(e.detail);
            if(json.success){
                uuid = json.msg.uuid;
            }
        });

        if(sys.window.clientCode){
            sys.window.clientCode((html) => {
                if(html){
                    select.innerHTML = html;
                }
            })
        }
    }

    static initDOM(){
        let options = ServerSelect.initOption();

        return <div class="mui-row">
            <ul class="mui-table-view">
                <li class="mui-table-view-cell">
                    <label>服务器：</label>
                    <select id="sel">
                        {options}
                    </select>
                </li>
                <li class="mui-table-view-cell" >
                    <div class="mui-input-row">
                        <textarea class="mui-input-clear" id="serverText" style="border: none;height: 80px "></textarea>
                    </div>
                </li>
                <div class="mui-content-padded">
                    <button id="login" type="button" data-loading-icon="mui-spinner mui-spinner-custom" class="mui-btn mui-btn-primary mui-btn-block">前往</button>
                </div>
            </ul>
        </div>
    }

    static initOption(){
        return [
            <option value="">-select-</option>,
            <option value="https://bw.sanfu.com/sf/index">三福生产环境</option>,
            <option value="https://bwt.sanfu.com/pesf/index">三福准生产环境</option>,
            <option value="https://bwt.sanfu.com/sf/index">三福测试环境</option>,
            <option value="https://bwd.sanfu.com/sf/index">三福开发环境</option>,
            <option value="http://172.28.6.191/sf/index">三福验证环境</option>,
            <option value="http://bwt.fastlion.cn:7777/sf/app_fastlion_retail/v1/index">速狮测试环境</option>,
            <option value="http://bwd.fastlion.cn:7776/sf/app_sanfu_retail/v1/index">速狮开发环境</option>,
            <option value="http://t.hengyusy.cn:7777/lion/hydc/null/index?page=login">恒裕测试环境</option>,
            <option value="http://bwt.fastlion.cn:7777/sf/hydc/v1/index?page=login">恒裕开发环境</option>,
            <option value="https://www.hengyusy.cn/lion/hydc/v1/index?page=login">恒裕生产环境</option>
        ]
    }
}