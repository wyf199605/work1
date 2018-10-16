///<amd-module name="CustomPromise" />

export type PromiseHandler = (resolve?: Function, reject?: Function) => void;

export class CustomPromise {
    static PENDING = 'PENDING'; // 进行中
    static FULFILLED = 'FULFILLED'; // 已成功
    static REJECTED = 'REJECTED'; // 已失败

    constructor(handler: PromiseHandler) {
        if (typeof handler !== 'function') {
            throw new Error('promise handler is not defined');
        }

        try{
            handler(this._resolve.bind(this), this._reject.bind(this));
        }catch (err) {
            this._reject(err);
        }
    }

    protected _status = CustomPromise.PENDING;
    protected _arg;

    protected fulfilledHandlers = [];
    protected rejectedHandlers = [];

    protected _resolve(arg) {
        if (this._status !== CustomPromise.PENDING)
            return;
        let run = () => {
            this._status = CustomPromise.FULFILLED;
            this._arg = arg;
            let handler;
            while (handler = this.fulfilledHandlers.shift()) {
                handler(arg);
            }
        };
        run();
    }

    protected _reject(arg) {
        if (this._status !== CustomPromise.PENDING)
            return;
        let run = () => {
            this._status = CustomPromise.REJECTED;
            this._arg = arg;
            let handler;
            while (handler = this.rejectedHandlers.shift()) {
                handler(arg);
            }
        };
        run();
    }

    public then(onFulfilled?: Function, onRejected?: Function) {
        return new CustomPromise((onFulfilledNext, onRejectedNext) => {
            let fulfilledHandler = (value) => {
                try {
                    if (typeof onFulfilled === 'function') {
                        let res = onFulfilled(value);
                        if (res instanceof CustomPromise) {
                            res.then(onFulfilledNext, onRejectedNext);
                        } else {
                            onFulfilledNext(value);
                        }
                    } else {
                        onFulfilledNext(value);
                    }
                } catch (err) {
                    onRejectedNext(err);
                }
            };

            let rejectedHandler = (error) => {
                try {
                    if (typeof onRejected === 'function') {
                        let res = onRejected(error);
                        if (res instanceof CustomPromise) {
                            res.then(onFulfilledNext, onRejectedNext)
                        } else {
                            onFulfilledNext(res)
                        }
                    } else {
                        onRejectedNext(error);
                    }
                } catch (err) {
                    onRejectedNext(err);
                }
            };

            switch (this._status) {
                case CustomPromise.PENDING :
                    this.fulfilledHandlers.push(onFulfilled);
                    this.rejectedHandlers.push(onRejected);
                    break;
                case CustomPromise.FULFILLED:
                    fulfilledHandler(this._arg);
                    break;
                case CustomPromise.REJECTED:
                    rejectedHandler(this._arg);
                    break;
            }
        });
    }

    public catch(onRejected){
        return this.then(undefined, onRejected);
    }

}