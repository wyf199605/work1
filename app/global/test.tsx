/// <amd-module name="GlobalTestModule"/>

import d = G.d;
import tool = G.tools;
import {CheckBox} from "./components/form/checkbox/checkBox";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Modal} from "./components/feedback/modal/Modal";
import {Progress} from "./components/ui/progress/progress";
import {RingProgress} from "./components/ui/progress/ringProgress";

let checkbox = new CheckBox({status: 2});

let progress = new Progress({
    container: d.query('#main')
});

let ringProgress = new RingProgress({
    percent: 25,
    showInfo: true,
    position: {
        x: 100,
        y: 100
    },
    radius: 50,
    ringWidth: 10,
    color: {
      ring: 'red',
      out: 'white',
      // inner: 'blue',
      font: 'red'
    },
    font:{
        // style: 'normal',
        // variant: 'normal',
        // weight: 'normal',
        size: 15,
        family: 'Arial'
    },
    interval: 100,
    step: 2,
    container: d.query('#main')
});

