namespace G{
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
            paths: Object.assign({
                tableExport: ['../plugin/tableExport.min'],
                JsBarcode: ['../plugin/qrcode/JsBarcode.all.min'],
                QRCode: ['../plugin/qrcode/qrcode.min'],
                echarts: ['../plugin/echarts/echarts.min'],
                BMap : ['http://api.map.baidu.com/api?v=3.0&ak=yiZoX1KkdlpwcGmfSt276NN5gkniefGc'],
                async: ['../plugin/requirejs/async'],
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
                raphael:['../plugin/raphael/raphael.min'],
                D3: ['../plugin/d3/d3.v4.min'],
                // picker: ['../web/plugin/mui/js/mui.picker.min']
            }, config.paths),

            bundles: Object.assign({
                // 'utils' : ['Validate','Draw','BarCode','QrCode','Statistic','Echart','DrawSvg']
            }, config.bundles),
            shim: {
                BMap : {
                    exports : 'BMap',
                },
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