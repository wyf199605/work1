/// <amd-module name="EchartModule"/>

interface dataType {
    // 标题
    title?: {
        text: string, // 名称
        textStyle?: {
            fontFamily?: string, // 字体
            fontSize?: number, // 字体大小
            color?: string   // 字体颜色
            // fontWeight: 'bold',

        },
        padding?: string|number,   // 边距
    },
    grid?: {
        top?: string|number,
        left?: string|number,
        right?: string|number,
        bottom?: string|number,
        containLabel?: boolean // 区域是否包含坐标轴的刻度标签
    },
    // 鼠标移动提示内容
    tooltip: {
        show: boolean,
    },
    legend: {
        data: Array<string>,
        top?: string|number,
        left?: string|number,
        right?: string|number,
        bottom?: string|number,
        orient?: string, // 图例列表的布局朝向 'horizontal' || 'vertical'

    }
}
export class EchartModule {
    lineChartFn() {

    }
}