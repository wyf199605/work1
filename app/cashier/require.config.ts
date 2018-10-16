function __setRequireBase(baseUrl:string, urlArg:string) {
    let modulePath = 'cashier/module/',
        pagePath = 'cashier/';
    function module(filename:string):string{
        return modulePath + filename;
    }
    C.setRequire({
        baseUrl: baseUrl,
    }, urlArg);
}
