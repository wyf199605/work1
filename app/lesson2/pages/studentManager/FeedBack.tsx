/// <amd-module name="FeedBack"/>
import d = G.d;
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {LeRule} from "../../common/rule/LeRule";
import {LeBasicPage} from "../LeBasicPage";
interface IFeedBackDataPara {
    TITLE : string,
    CONTENT : string,
    QUESTIONER : string,
    QUESTIONTIME : string,
    RESPONDER : string
    RESPONSETIME : string
    QUESTION_TYPE: string
    QUESTION_TYPE_NAME: string
    ANSWERSTATUS : string
}
export class FeedBack extends LeBasicPage {
    private select : SelectInput;
    protected init(para: Primitive[], data?) {
        this.title = '问题反馈';
    }

    protected bodyInit() : HTMLElement{
        let select, query, content,
            tpl = <div className="student-feedback-page">
            <div className="student-feedback-body">
                <div className="student-feedback-item">
                    {select = <div className="select"></div>}
                    {query = <div className="btn btn-blue query">查询</div>}
                </div>
                {content = <div className="student-feedback-content"></div>}
            </div>
        </div>;

        d.on(query, 'click', () => {
            this.search(content);
        });
        LeRule.Ajax.fetch(LE.CONF.ajaxUrl.feedBackSelect,{
            dataType : 'json'
        }).then(({response}) => {
            let data = [];
            response.data.data.forEach(obj => {
                data.push({
                    value : obj.QUESTION_TYPE,
                    text : obj.QUESTION_TYPE_NAME,
                })
            });
            this.select = new SelectInput({
                container : select,
                readonly : true,
                data
            });
            if(data[0]){
                this.select.set(data[0].value);
                this.search(content);
            }

        });

        return tpl;
    }

    private search(content : HTMLElement){
        LeRule.Ajax.fetch(LE.CONF.ajaxUrl.feedBackQuery + '?question_type=' + this.select.get(),{
            type : 'get',
        }).then(({response}) => {
            content.innerHTML = null;
            d.append(content, this.createItem(response.data.data));
        });
    }

    private createItem(data : IFeedBackDataPara[]){
        let fragment = document.createDocumentFragment();
        Array.isArray(data) && data.forEach(obj => {
            fragment.appendChild(<div className="student-feedback-item">
                <p className="item-title">
                    <span>【{obj.QUESTION_TYPE_NAME}】</span>
                    <span>{obj.TITLE}</span>
                </p>
                <div className="item-content">
                    {obj.CONTENT}
                </div>
                <div className="item-footer">
                    <div className="item-row">
                        <div>
                            <span className="item-name">提问人：</span>
                            <span className="item-value">{obj.QUESTIONER}</span>
                        </div>
                        <div>
                            <span className="item-name">提交时间：</span>
                            <span className="item-value">{obj.QUESTIONTIME}</span>
                        </div>
                    </div>
                    <div className="item-row">
                        <div>
                            <span className="item-name">回复人：</span>
                            <span className="item-value">{obj.RESPONDER}</span>
                        </div>
                        <div>
                            <span className="item-name">回复时间：</span>
                            <span className="item-value">{obj.RESPONSETIME}</span>
                        </div>
                        <div>
                            <span className="item-name">回复状态：</span>
                            <span className="item-value">{obj.ANSWERSTATUS}</span>
                        </div>
                    </div>
                </div>
            </div>)
        });
        return fragment;
    }

    protected destroy(){
        this.basicPageEl.remove();
        this.basicPageEl = null;
        this.select.destroy();
        this.select = null;
    }
}
