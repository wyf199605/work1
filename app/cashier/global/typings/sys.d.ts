interface SYS_Type {
    window : SYS_Window;
    ui :SYS_UI;
    os : string;
    isMb: boolean;
}
interface SYS_Window{
    open( obj:winOpen, refer? : string) :void;
    close( event?:string, data?:obj, url? : string) :void;
    load( url:string, data?:obj) :void;
    back( event:string, data?:obj) :void;
    logout(url?:string) :void;

    copy( text:string) :void;
    getGps(callback:Function) :void;
    openGps(): void;
    update() :void;
    getDevice( key?:string) :any;
    openImg( url:string) :void;
    download( url:string) :void;
    opentab(userid?:string, accessToken?:string) :void;
    firePreviousPage(event : string , data? : obj, url? : string) : void;
    fire(event :string, data? : obj, url? : string);

    refresh?(url:string);
    wake?( event:string, data:obj) :void;
    setTitle?(url:string, title:string):void;
    quit?() :void;
    clear?() :void;
    touchid?(callback:Function) :void;
    wechatin?(callback:Function) :void;
    closeAll?(); // 关闭所有窗口 - pc
    closeOther? (); // 关闭除当前窗口外的其他窗口
    winClose?( event?:string, data?:obj):void;

    powerManager?();
    whiteBat?();
}

interface SYS_UI{
    // alert( msg:string) :void;
    // confirm( msg:string, title:string, btn : string[], callback?:Function) :void;
    // toast( msg:string) :void;
    notice(obj : {msg :string, url?:string, position?:string, time?:number, title?:string, type?:string}) :void;
}

    
    
    