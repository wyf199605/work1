/// <amd-module name="GlobalTestModule"/>

import {RingProgress} from "./components/ui/progress/ringProgress";
import {Progress} from "./components/ui/progress/progress";
import {Modal} from "./components/feedback/modal/Modal";

window['p'] = new Progress({
    container: document.body
});
let body = <div style="padding: 4px 15px;"/>;
new Modal({
    isMb: false,
    isBackground: false,
    body: body,
    className: 'modal-toast'
});

let progress = new RingProgress({
    container: body,
    msg: '按时大大撒撒大大大所大所',
    textColor: '#fff'
});


progress.format(10);

window['progress'] = progress;