interface SYSInitPara{
    pageContainer:HTMLDivElement;
    navBar:HTMLDivElement;
}

namespace BW{

    export let sys : SYS_Type = null;

    export function __initSys(type : string, extra?:SYSInitPara){
        switch (type){
            case 'pc':
                sys = new SYSPC(extra);
                break;
            case 'ad':
                sys = new SYSAD();
                break;
            case 'ip':
                sys = new SYSIP();
                break;
            case 'h5':
                sys = new SYSH5();
        }
        sys.os = type;
        sys.isMb = type !== 'pc';
    }

    export function toast(msg){
        require(['Modal'], function (m) {
            m.Modal.toast(msg);
        });
    }
}
