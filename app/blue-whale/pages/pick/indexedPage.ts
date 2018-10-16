import tools = G.tools;
declare const list : any;

class indexedPage{
    // multiValue = ${table.multiValue}
    constructor(multiValue){

        let multValue = multiValue;//单选 or 多选

        let done = document.getElementById('done');

        (function(){
            let lastCheckbox = null;
            G.d.on(G.d.query('#list'), 'change', 'input[type=checkbox]', function() {
                let checkbox = this;

                //控制单选多选
                if(!multValue && lastCheckbox !== null && !lastCheckbox.isEqualNode(this)) {
                    lastCheckbox.checked = false;
                }

                let count = list.querySelectorAll('input[type="checkbox"]:checked').length;
                done.innerHTML = count ? "完成(" + count + ")" : "完成";
                if (count) {
                    if (done.classList.contains("mui-disabled")) {
                        done.classList.remove("mui-disabled");
                    }
                } else {
                    if (!done.classList.contains("mui-disabled")) {
                        done.classList.add("mui-disabled");
                    }
                }

                lastCheckbox = this;
            });
        }());
        // mui.back = function () {
        //     window.parent.document.getElementById('iframe_'+localStorage.getItem('fromPickCaption')).style.right = '-100%';
        // };
        done.addEventListener('tap', function() {
            let checkboxArray = [].slice.call(list.querySelectorAll('input[type="checkbox"]:checked'));
            let checkedValues = [];
            checkboxArray.forEach(function(box) {
                checkedValues.push(box.value);
            });
            //    console.log(checkedValues);
            let caption = localStorage.getItem('fromPickCaption');
            let passData = {
                caption : caption,
                data : checkedValues.join(';')
            };
            if (checkedValues.length > 0) {
                setTimeout(function () {
                    checkboxArray.forEach(function (box) {
                        box.checked = false;
                    });
                    done.innerHTML = "完成";
                    done.classList.add("mui-disabled");
                },  400);

                tools.event.fire('selectContact', passData, window.parent);
                window.parent.document.getElementById('iframe_'+caption).style.right = '-100%';
                window.parent.document.getElementById('hideContact').style.display='none';
                window.parent.document.getElementById('contactPicker').style.display='block';
            }
        }, false);
    }
    public fieldPage(){
        //传给后台参数
        let levelField = '${table.levelField}'.split(',').map(function (v, i, a) {
            return v.toUpperCase();
        });
        //树等级
        let treeField = '${table.treeField}'.split(',').map(function (v, i, a) {
            return v.toUpperCase();
        });
        //
        let fromField = '${table.fromField}';
    }
}