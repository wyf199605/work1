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
  </template>

  <script>
      //逻辑
      export default {
          
      }
  </script>

  <style lang="css" scoped>
      // 样式
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
      }

      render(){      
          return  <div> 
            //页面视图层
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



