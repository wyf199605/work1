/// <amd-module name="GlobalTestModule"/>

import {RingProgress} from "./components/ui/progress/ringProgress";
import {Progress} from "./components/ui/progress/progress";
import {Modal} from "./components/feedback/modal/Modal";
import {ImgModal} from "./components/ui/img/img";
import {PDFPreview} from "./components/view/pdfPreview/pdfPreview ";


new PDFPreview({
    url: 'http://192.168.10.220:8080/img/img/test.pdf'
});