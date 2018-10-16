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
                tableExport: ['../plugin/tableExport.min'],
                JsBarcode: ['../plugin/qrcode/JsBarcode.all.min'],
                QRCode: ['../plugin/qrcode/qrcode.min'],
                echarts: ['../plugin/echarts/echarts.min'],

                photoSwipe: ['../plugin/photoswipe/photoswipe.min'],
                photoSwipeUi: ['../plugin/photoswipe/photoswipe-ui-default.min'],
                webUpLoader: ['../plugin/webupload/webuploader'],
                md5: ['../plugin/webupload/md5'],
                tagsInput: ['../plugin/bootstrap/bootstrap-tagsinput/bootstrap-tagsinput'],
                froalaEditor : ['../plugin/js/froala_editor.min'],
                summernote : ['../plugin/bootstrap/summernote/summernote'],
                reconnectingWebscoket : ['../plugin/reconnecting-websocket-1.0.1'],
                flatpickr: ['../plugin/flatpickr/flatpickr.min.1'],
                AceEditor: ['../plugin/aceEditor/ace'],
                // picker: ['../web/plugin/mui/js/mui.picker.min']
            }, config.paths),

            bundles: tools.obj.merge({
                // 'utils' : ['Validate','Draw','BarCode','QrCode','Statistic','Echart','DrawSvg']
            }, config.bundles),
            shim: {
                AceEditor:{
                    exports: 'AceEditor'
                },
                JsBarcode:{
                    exports: 'JsBarcode'
                },
                QRCode:{
                    exports: 'QRCode'
                },
                echarts:{
                    exports: 'echarts'
                },
                webUpLoader:{
                    exports: 'webUpLoader'
                },
                tagsInput:{
                    exports: 'tagsInput'
                },
                md5: {
                    exports: 'md5'
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