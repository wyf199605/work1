/// <amd-module name="GlobalTestModule"/>
/// <amd-dependency path="raphael" name="Raphael"/>

declare const Raphael;

export class GlobalTestModule{
    constructor(){
        console.log(Raphael)
    }
}
