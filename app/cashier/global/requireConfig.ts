namespace C{
    export let requireBaseUrl:string = '';

    export function setRequire(config: RequireConfig, urlArg:string){
        if(typeof config.bundles === 'object'){
            for(let key in config.bundles){
                config.bundles[config.baseUrl + key] = config.bundles[key];
                delete config.bundles[key];
            }
        }
        requireBaseUrl = config.baseUrl;
        require.config({
            baseUrl : config.baseUrl,
            paths: tools.obj.merge({
                JsBarcode: ['../plugin/qrcode/JsBarcode.all.min'],
                QRCode: ['../plugin/qrcode/qrcode.min'],
            }, config.paths),

            bundles: tools.obj.merge({
                // 'utils' : ['Validate','Draw','BarCode','QrCode','Statistic','Echart','DrawSvg']
            }, config.bundles),
            shim: {

                JsBarcode:{
                    exports: 'JsBarcode'
                },
                QRCode:{
                    exports: 'QRCode'
                },
            },
            map: {
                '*': {
                    'css': 'require.css'
                }
            }
        });
    }
}