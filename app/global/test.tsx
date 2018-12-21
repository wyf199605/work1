/// <amd-module name="GlobalTestModule"/>

class Singleton {
    private static classKeys: Function[] = [];
    private static classValues: any[] = [];

    constructor() {
        let clazz: any = this['constructor'];
        // 为空时，表示浏览器不支持这样读取构造函数
        if (!clazz) {
            return;
        }
        if (~Singleton.classKeys.indexOf(clazz)) {
            throw new Error(this + '只允许实例化一次！');
        } else {
            Singleton.classKeys.push(clazz);
            Singleton.classValues.push(this);
        }
    }

    // 注意，Singleton是要替换成你自己实现的子类 这里没有实际的作用
    private static instance: Singleton;

    public static getInstance(): Singleton {
        if (!this.instance) {
            this.instance = new Singleton();
        }
        return this.instance;
    }

    /**
     * 销毁方法。事实上单例是很少进行销毁的
     */
    private destroy(o: any = null): void {
        this.onDestroy();
        Singleton.removeInstance(this["constructor"]);
    }

    /**
     * 子类重写的方法
     */
    protected onDestroy(): void {

    }

    /**
     * 删除单例的实例（不对单例本身做任何的销毁，只是删除他的引用）
     * @param clazz 单例的Class对象
     *
     */
    static removeInstance(clazz: Function): void {
        let index: number = this.classKeys.indexOf(clazz);
        if (index == -1) {
            return null;
        }
        this.classKeys.splice(index, 1);
        this.classValues.splice(index, 1);
    }

    /**
     * 是否存放有这个构造函数
     * @param clazz 构造函数
     * @return {boolean}
     */
    static getFunValue(clazz: Function): any {
        let funs: Function[] = this.classKeys;
        let length: number = funs.length;
        for (let i: number = 0; i < length; i++) {
            if (clazz == funs[i])
                return this.classValues[i];
        }
        return null;
    }

    /**
     * 获取单例类，若不存在则创建.所有的单例创建的时候，都必须使用这个方法来创建，这样可以做到统一管理单例
     * @param clazz 任意需要实现单例效果的类
     * @return
     *
     */
    static getInstanceOrCreate(clazz: any): any {
        let obj: any = this.getFunValue(clazz);
        if (obj) {
            return obj;
        }
        obj = new clazz();
        //不是Singleton的子类，则手动添加Singleton 构造器会自动添加到classMap
        if (!(obj instanceof Singleton)) {
            this.classKeys.push(clazz);
            this.classValues.push(obj);
        }
        return obj;
    }

}

let singleton1 = Singleton.getInstance();
console.log("通过Singleton.getInstance实例:" + singleton1);
let singleton2 = Singleton.getInstance();
console.log("singleton1 == singleton2:" + (singleton1 == singleton2));
// new Singleton();

// 获取运行时类型
class Types {
    static getType(inputClass: any) {
        let funcNameRegex = /function (.{1,})\(/,
            results = funcNameRegex.exec(inputClass.constructor.toString());
        return (results && results.length > 1) ? results[1] : '';
    }
}


class Example{

}

class AnotherClass extends Example{

}

let x = new Example();
let y = new AnotherClass();

console.log(Types.getType(x));
console.log(Types.getType(y));