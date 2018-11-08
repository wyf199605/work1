/// <amd-module name="BarCode" />
/// <amd-dependency path="JsBarcode" name="JsBarcode"/>
declare const JsBarcode;
interface locPara{
    x:number,//横坐标
    y:number,//纵坐标
    w?:number,
    h?:number
}
interface codePara{
    alignment?:number,
    codeData?:string,
    codeType?:number
}
export class BarCode{
    private svg:SVGSVGElement;
        constructor(svgDom,loc:locPara,sty:codePara){
            this.init();
            this.draw(svgDom,loc,sty);
        }
        private init(){
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.id = 'tempSvg';
            document.body.appendChild(this.svg);
        }
        private draw(svgDom:SVGSVGElement,loc:locPara,sty:codePara){
            JsBarcode("#tempSvg", sty.codeData,{
                lineColor: "#000000",
                // width: (loc.w-88)/68+1,
                width: sty.codeType === 3 ? 2 : 1,
                height: loc.h,
                margin: 0,
                displayValue: false,
                format: BarCode.CodeType[sty.codeType]
            });
            let width = this.svg.width.animVal.value,
                scale = (loc.w - 20) / width;
            console.log(scale);
            Array.prototype.forEach.call(this.svg.children, (el) => {
                el.setAttribute('transform', `scale(${scale}, 1)`);
            });
            this.svg.setAttribute('width', `${loc.w}`);
            // this.svg.setAttribute('height', `${loc.h}`);
            this.svg.setAttribute('x', `${loc.x}`);
            this.svg.setAttribute('y', `${loc.y}`);
            this.svg.setAttribute("viewBox", `0 0 ${loc.w} ${loc.h}`);

            svgDom.appendChild(this.svg);
        }
        static CodeType = {
            0:'ITF',
            3:'CODE39',
            4:'CODE39',
            5:'CODE128A',
            6:'CODE128B',
            7:'CODE128C',
        }
}

