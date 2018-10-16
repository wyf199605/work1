import BasicPage from "basicPage";
interface VersionPage extends BasicPagePara{
    version : obj
}
export = class versionPage extends BasicPage {
    constructor(private para:VersionPage) {
        super(para);

        let versionData = para.version, versionHTML = '';
        versionData.version_memo.split("<br>").forEach(function (row) {
            versionHTML += '<p>' + row + '</p>';
        });
        this.dom.querySelector('.versionNo').innerHTML = versionData.version_no;
        this.dom.querySelector('.versionMemo').innerHTML = versionHTML;

    }
}