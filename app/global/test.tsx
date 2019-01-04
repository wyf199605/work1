/// <amd-module name="GlobalTestModule"/>

import {RingProgress} from "./components/ui/progress/ringProgress";
import {Progress} from "./components/ui/progress/progress";

window['p'] = new Progress({
    container: document.body
});

let progress = new RingProgress({
    container: document.body
});

progress.format(10);

window['progress'] = progress;