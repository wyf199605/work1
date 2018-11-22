/// <amd-module name="Validate"/>
export interface ValidateRule {
    rule: string; // maxLength, maxValue, minLength, minValue, requieredFlag, regExp
    errMsg?: string;
    title?: string,
    value?: any
}

export interface ValidateResult {
    // 数据键值
    [dataName: string]: {
        errMsg: string; // 错误信息
        rule: keyof typeof errMsgs; // 规则名称
    }
}

let errMsgs = {
    number: '{{title}}必须是数字',
    maxLength: '{{title}}的最大长度不超过{{value}}',
    maxValue: '{{title}}超过最大值{{value}}或者为非数字',
    minLength: '{{title}}小于最小长度{{value}}或者为非字符串',
    minValue: '{{title}}小于最小值{{value}}或者为非数字',
    requieredFlag: '{{title}}为空',
    regExp: '{{title}}匹配正则规则{{value}}'
};

const strategies = {
    maxLength: function (data, value) {
        if (value === 0) {
            return true;
        }
        return tools.isEmpty(data) ? true : (typeof data == "string" ? !(data.length > value) : true);
    },

    maxValue: function (data, value) {
        return tools.isEmpty(data) ? true : (typeof data == "number" ? data < value : true);
    },

    minLength: function (data, value) {
        if (value === 0) {
            return true;
        }
        return tools.isEmpty(data) ? true : (typeof data == "string" ? !(data.length < value) : true);
    },

    minValue: function (data, value) {
        return tools.isEmpty(data) ? true : (typeof data == "number" ? !(data < value) : true);
    },

    requieredFlag: function (data, value) {
        return value ? (data !== null && data !== undefined && data !== "") : true;
    },

    regExp: function (data, value) {
        return data.match(new RegExp(value)) != null;
    },

    number: function (data, value) {
        if (tools.isEmpty(data)) {
            return true;
        } else {
            return !isNaN(data);
        }
    }
};


export class Validate {
    private name2Rules: objOf<ValidateRule[]> = {};

    add(dataName: string, rules: ValidateRule[]) {
        this.name2Rules[dataName] = rules;
    }

    get(dataName) {
        return this.name2Rules[dataName];
    }

    start(data: obj) {
        let result: ValidateResult = null;
        for (let name in this.name2Rules) {
            let rules = this.name2Rules[name];
            for (let r of rules) {
                if (data[name] !== undefined || r.rule === 'requieredFlag') {
                    if (!strategies[r.rule](data[name], r.value)) {
                        let err = r.errMsg ? r.errMsg : errMsgs[r.rule];

                        err = G.tools.str.parseTpl(err, {
                            title: r.title,
                            value: r.value
                        });

                        if (result === null) {
                            result = {};
                        }

                        result[name] = {
                            errMsg: err,
                            rule: <keyof typeof errMsgs>r.rule
                        };

                        break;
                    }
                }
            }
        }
        return result;
    }
}

