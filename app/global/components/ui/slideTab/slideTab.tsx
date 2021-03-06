/// <amd-module name="SlideTab"/>

import {ITab, Tab, TabPara} from "../tab/tab";
import d = G.d;
import tools = G.tools;
import {DataManager, IDataManagerAjaxStatus, IDataManagerPara} from "../../DataManager/DataManager";

export interface ISlideTabPara extends TabPara{
    tabs?: ISlideTab[];
}
export interface ISlideTab extends ITab{
    dataManager?: {
        pageSize?: number;
        render: (start: number, length: number, data: obj[], isRefresh: boolean) => void;
        ajaxFun?: (status: IDataManagerAjaxStatus) => Promise<{ data: obj[]; total: number; }>,
        isPulldownRefresh?: boolean,
        ajaxData?: obj[];
    };
}


export class SlideTab extends Tab{
    constructor(para: ISlideTabPara){
        super(para);
        this.panelContainer.classList.add('slide-tab-wrapper');

        this.width = this.panelContainer.offsetWidth;

        this.slideEvent.on();
    }

    protected width: number;

    protected slideEvent = (() => {
        let translate = 0,
            moveHandler = null,
            endHandler = null;

        let startHandler = (e: TouchEvent) => {
            translate = -this.current * this.width;
            this.panelContainer.style.removeProperty('transition');
            let panel = d.closest(e.target as HTMLElement, '.tab-pane'),
                disX = e.changedTouches[0].clientX,
                disY = e.changedTouches[0].clientY,
                direction,
                scale = 1,
                isFirst = true;
            // console.log(panel);

            d.on(this.panelContainer, 'touchmove', moveHandler = (e) => {
                let currentX = e.changedTouches[0].clientX,
                    currentY = e.changedTouches[0].clientY;
                if(isFirst){
                    isFirst = false;
                    let angle = Math.atan2(disY - currentY, disX - currentX) / Math.PI * 180;
                    direction = getDirection(angle);

                }

                if(panel.scrollTop === 0 && direction !== 'down'){
                    e.preventDefault();
                }

                if(direction === 'left' || direction === 'right'){
                    panel && (panel.style.overflow = 'hidden');
                    let deltaX = currentX - disX;
                    disX = currentX;
                    if((this.current === 0 && e.direction === 'right')
                        || (this.current === this.len - 1 && e.direction === 'left')){
                        scale *= .96;
                        deltaX *= scale;
                    }else{
                        deltaX = deltaX * 1.15;
                    }
                    translate += deltaX;
                    // this.panelContainer.style.transform = 'translateX(' + translate + 'px)';
                    this.change(translate);
                }
            });

            d.on(document, 'touchend', endHandler = () => {
                this.current = Math.round(-translate / this.width);
                d.off(document, 'touchend', endHandler);
                d.off(this.panelContainer, 'touchmove', moveHandler);
                panel && (panel.style.overflow = 'auto');
            })
        };

        let getDirection = (angle: number) : 'up' | 'down' | 'left' | 'right' =>{
            if (angle <= 45 && angle > -45){
                return 'right';
            }else if(angle <= 135 && angle > 45){
                return 'down';
            }else if(angle <= -45 && angle > -135){
                return 'up';
            }else if(angle > 135 || angle <= -135){
                return 'left';
            }else{
                return null
            }
        };
        return {
            on: () => {
                d.on(this.panelContainer, 'touchstart', startHandler);
                // d.on(this.panelContainer, 'panleft panright panstart panend', handler = (e: any) => {
                //     // e.srcEvent.preventDefault && e.srcEvent.preventDefault();
                //     if(e.isFirst){
                //         translate = -this.current * this.width;
                //         this.panelContainer.style.removeProperty('transition');
                //         scale = 1;
                //     }
                //     let deltaX = e.deltaX * 1.15;
                //
                //     if((this.current === 0 && e.direction === 'right')
                //         || (this.current === this.len - 1 && e.direction === 'left')){
                //         scale *= .96;
                //         deltaX *= scale;
                //     }
                //     translate += deltaX;
                //     // this.panelContainer.style.transform = 'translateX(' + translate + 'px)';
                //     this.change(translate);
                //     if(e.isFinal){
                //         this.current = Math.round(-translate / this.width);
                //     }
                // });
            },
            off: () => {
                // d.off(this.panelContainer, 'panleft panright panstart panend', handler);
                d.off(this.panelContainer, 'touchstart', startHandler);
            }
        }
    })();

    protected change(translate: number){
        this.panelContainer.style.webkitTransform = 'translateX(' + translate + 'px)';
        this.panelContainer.style.transform = 'translateX(' + translate + 'px)';
    }

    protected _current: number = 0;
    get current(){
        return this._current;
    }
    set current(index: number){
        index = Math.max(0, index);
        index = Math.min(this.len - 1, index);
        this._current = index;
        this.selected(index);
    }

    protected refreshData(index: number){
        let dataManager = this.dataManagers[index],
            num = this.temDataManagers.indexOf(dataManager);

        if(num > -1){
            dataManager.refresh();
            this.temDataManagers.splice(num, 1);
        }
    }

    selected(index: number){
        let translate = -index * this.width;
        this.panelContainer.style.transition = 'all 500ms';
        // this.panelContainer.style.transform = 'translateX(' + translate + 'px)';
        this.change(translate);
        super.active(index);
        this.refreshData(index);
    }

    active(index: number){
        super.active(index);
        let translate = -index * this.width;
        this._current = index;
        this.panelContainer.style.removeProperty('transition');
        this.change(translate);
        this.refreshData(index);
    }

    addTab(tabs : ISlideTab[]){
        super.addTab(tabs);
        Array.isArray(tabs) && tabs.forEach((tab) => {
            this.initDataManager(tab);
        })
    }

    deleteTab(index :number){
        if(index in this.dataManagers){
            this.dataManagers.splice(index, 1);
            // console.log(this.para.tabs[index]);
            super.deleteTab(index);
        }
    }

    dataManagers: DataManager[];
    temDataManagers: DataManager[];
    protected initDataManager(tab: ISlideTab){
        if(!Array.isArray(this.dataManagers)){
            this.dataManagers = [];
        }
        if(!Array.isArray(this.temDataManagers)){
            this.temDataManagers = [];
        }
        if(tab.dataManager){
            let len = this.dataManagers.length,
                page = tab.dataManager,
                dataManager = new DataManager({
                    page: {
                        size: page.pageSize || 50,
                        container: d.query(`div.tab-pane[data-index="${len}"]`, this.panelContainer),
                        isPulldownRefresh: page.isPulldownRefresh || false,
                    },
                    render: (start, length, isRefresh) => {
                        typeof page.render === 'function' && page.render(start, length, dataManager.data, isRefresh);
                    },
                    ajax: {
                        fun: page.ajaxFun,
                        ajaxData: page.ajaxData
                    }
                });
            this.dataManagers.push(dataManager);
            this.temDataManagers.push(dataManager);
        }else{
            this.dataManagers.push(null);
        }
    }
}