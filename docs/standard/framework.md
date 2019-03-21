# 架构

 ## 1.DOM驱动

```
  if (app.hasClass('app-sidebar-closed')) {
    elem.find('.sub-menu').each(function () {
        if ($(this).find('li.active').length > 0 && !$(this).parent().hasClass('open')) {
            $(this).parent().addClass('active');
        }
    });
    let mainThis = $id.children('a');
    mainThis.parents('li.active').removeClass('active').addClass('open').children('.sub-menu').show();
    if (_this.next().length > 0) {
        if (_this.closest("ul").find(".open").not(".active").children("ul").css('display') == undefined) {
            mainThis.next().hide().parent().removeClass('open');
            if (mainThis.next().find('li.active').length > 0) {
                mainThis.next().parent().addClass('active');
            }
        } else {
            mainThis.next().show().parent().addClass('open');
            if (mainThis.next().find('li.active').length > 0) {
                mainThis.next().parent().removeClass('active');
            }
        }
    } else {
        return;
    }
}

```

 ## 2.MVVM

> Vue 写法

 ```
  <template lang="html">
      // 组件中的html结构
      <div v-bind:class="{ active: isActive }"></div>
  </template>

  <script>
      //逻辑
      export default {
          data(){
             return {
                isActive:false
             }
          },
          mehtods:{
            change(){
               this.isActive=!this.isActive
            }
          }
      }
  </script>

  <style lang="css" scoped>
      // 样式
      .active{
        ...
      }
  </style>

 ```

 > react 写法

 ```
  import React  from 'react';
  import "style.scss";//引入css
  class AppComponent extends  React.Component {   
      //逻辑
      constructor(props){
          super(props)      
          this.state={
             isActive:false
          } 
      }
      change=()=>{
         this.setState({
           isActive:!this.state.isActive
         })
      }
      render(){      
          return  <div> 
            //页面视图层
               <div className={ this.state.isActive?'active':null}></div>
          </div>
      }
  }

 ```

 **选用MVVM模式，分离视图（View）和模型（Model），减少低耦合**

 # 组件化

 ![avator](https://cn.vuejs.org/images/components.png)

  

## 1.状态改变(state) -> 构建新的 DOM 元素更新页面

一个组件的显示形态由多个状态决定的情况非常常见。代码中混杂着对 DOM 的操作其实是一种不好的实践，手动管理数据和 DOM 之间的关系会导致代码可维护性变差、容易出错。所以我们的例子这里还有优化的空间：如何尽量减少这种手动 DOM 操作？


这里要提出的一种解决方案：一旦状态发生改变，就重新调用 render 方法，构建一个新的 DOM 元素。这样做的好处是什么呢？好处就是你可以在 render 方法里面使用最新的 this.state 来构造不同 HTML 结构的字符串，并且通过这个字符串构造不同的 DOM 元素。页面就更新了,比如：

```
  class LikeButton {
    constructor () {
      this.state = { isLiked: false }
    }

    setState (state) {
      const oldEl = this.el
      this.state = state
      this.el = this.render()
      if (this.onStateChange) this.onStateChange(oldEl, this.el)
    }

    changeLikeText () {
      this.setState({
        isLiked: !this.state.isLiked
      })
    }

    render () {
      this.el = d.create(`
        <button class='like-btn'>
          <span class='like-text'>${this.state.isLiked ? '取消' : '点赞'}</span>
        </button>
      `)
      this.el.addEventListener('click', this.changeLikeText.bind(this), false)
      return this.el
    }
  }

```

使用这个组件的时候


```

const likeButton = new LikeButton()
wrapper.appendChild(likeButton.render()) // 第一次插入 DOM 元素
likeButton.onStateChange = (oldEl, newEl) => {
  wrapper.insertBefore(newEl, oldEl) // 插入新的元素
  wrapper.removeChild(oldEl) // 删除旧的元素
}

```

* render 函数里面的 HTML 字符串会根据 this.state 不同而不同

* 新增一个 setState 函数，这个函数接受一个对象作为参数；它会设置实例的 state，然后重新调用一下 render 方法。

* 每当 setState 中构造完新的 DOM 元素以后，就会通过 onStateChange 告知外部插入新的 DOM 元素，然后删除旧的元素，页面就更新了

* 当点击按钮的时候， changeLikeText 会构建新的 state 对象，这个新的 state ，传入 setState 函数当中。

## 2.配置改变（prop） -> 构建新的 DOM 元素更新页面

在开发当中，可能需要给组件传入一些自定义的配置数据。例如说想配置一下点赞按钮的背景颜色，如果我给它传入一个参数，告诉它怎么设置自己的颜色。那么这个按钮的定制性就更强了在实际开发当中，你可能需要给组件传入一些自定义的配置数据。例如说想配置一下点赞按钮的背景颜色，如果我给它传入一个参数，告诉它怎么设置自己的颜色。那么这个按钮的定制性就更强了

```
    constructor (props = {}) {
      this.props = props
    }

```

继承的时候通过 super(props) 把 props 传给父类，这样就可以通过 this.props 获取到配置参数：


```
  class LikeButton extends Component {
    constructor (props) {
      super(props)
      this.state = { isLiked: false }
    }

    onClick () {
      this.setState({
        isLiked: !this.state.isLiked
      })
    }

    render () {
      return `
        <button class='like-btn' style="background-color: ${this.props.bgColor}">
          <span class='like-text'>
            ${this.state.isLiked ? '取消' : '点赞'}
          </span>
        </button>
      `
    }
  }

  new LikeButton({ bgColor: 'red' })

```




## 3.通信
单向数据流 从父节点传递到子节点。如果顶层的某个数据改变了，重渲染对应的子节点
* 父 → 子  prop
* 子 → 父  事件
* 兄弟组件  发布订阅  状态提升
* 无关组件 全局状态

# 全局状态管理

## 1.改变数据--dispatch函数
一个可以被不同模块/组件任意修改共享的数据状态就是魔鬼，一旦数据可以任意修改，出现问题的时候 debug 起来就非常困难，这就是老生常谈的尽量避免全局变量。

模块（组件）之间可以共享数据，也可以改数据。但是我们约定，这个数据并不能直接改，你只能执行某些我允许的某些修改，而且你修改的必须显示的调用dispatch函数。

```
//全局数据
const appState = {
  title: {
    text: 'React.js 小书',
    color: 'red',
  },
  content: {
    text: 'React.js 小书内容',
    color: 'blue'
  }
}

//dispatc函数
function dispatch (action) {
  switch (action.type) {
    case 'UPDATE_TITLE_TEXT':
      appState.title.text = action.text
      break
    case 'UPDATE_TITLE_COLOR':
      appState.title.color = action.color
      break
    default:
      break
  }
}

//调用方式
dispatch({ type: 'UPDATE_TITLE_TEXT', text: '《React.js 小书》' }) // 修改标题文本
dispatch({ type: 'UPDATE_TITLE_COLOR', color: 'blue' }) // 修改标题颜色

```

![avator](http://huzidaha.github.io/static/assets/img/posts/7536BBF9-6563-4FD5-8359-28D3A5254EE7.png)

## 2.创建store && 监听数据

>  监听数据:全局修改数据也要去刷新组件

```
function createStore (state, stateChanger) {
  const listeners = []
  const subscribe = (listener) => listeners.push(listener)
  const getState = () => state
  const dispatch = (action) => {
    stateChanger(state, action)
    listeners.forEach((listener) => listener())
  }
  return { getState, dispatch, subscribe }
}

let appState = {
  title: {
    text: 'React.js 小书',
    color: 'red',
  },
  content: {
    text: 'React.js 小书内容',
    color: 'blue'
  }
}

function stateChanger (state, action) {
  switch (action.type) {
    case 'UPDATE_TITLE_TEXT':
      state.title.text = action.text
      break
    case 'UPDATE_TITLE_COLOR':
      state.title.color = action.color
      break
    default:
      break
  }
}

const store = createStore(appState, stateChanger)

store.dispatch({ type: 'UPDATE_TITLE_TEXT', text: '《React.js 小书》' }) //修改数据 
store.dispatch({ type: 'UPDATE_TITLE_COLOR', color: 'blue' }) // 修改数据

```

# 前端路由

## 1.切换页面
  
  前端路由通过 # 号，捕获到具体的hash值进行刷新页面

  ```
    //路由切换
    window.addEventListener('hashchange',function(){
        //do something 
        this.hashChange()
    })

  ```

## 2.注册路由

```
  //注册函数
  map:function(path,callback){
   path = path.replace(/\s*/g,"");//过滤空格
   //在有回调，且回调是一个正确的函数的情况下进行存储 以 /name 为key的对象 {callback:xx}
   if(callback && Object.prototype.toString.call(callback) === '[object Function]' ){
       this.routers[path] ={
            callback:callback,//回调
            fn:null //存储异步文件状态，用来记录异步的js文件是否下载，下文有提及
        } 
    }else{
    //打印出错的堆栈信息
        console.trace('注册'+path+'地址需要提供正确的的注册回调')
    }
  }
 
   //调用方式
   map('/detail',function(transition){
  ...
  })

```

## 3.页面传参

页面与页面之前可能需要参数传递

