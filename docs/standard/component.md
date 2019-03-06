# 前端组件化

## 数据流

 * 组件单向数据流，父组件状态单向传输子组件

 ![avatar](https://user-gold-cdn.xitu.io/2018/10/22/1669b12d8989a79b?imageslim)

 * 状态提升，我们需要把子组件间共享的状态，提升到容器组件进行管理，并有容器组件下发到子组件

 ![avatar](https://user-gold-cdn.xitu.io/2018/10/22/1669b1326603fa79?imageslim)

 * 模块分层越来越多，跨多层组件状态共享越来越复杂
  ![avatar](https://user-gold-cdn.xitu.io/2018/10/22/1669b139cf391391?imageslim)
 
  状态管理redux、vuex就是为了解决此类问题而出现。
  ![avatar](https://user-gold-cdn.xitu.io/2018/10/22/1669b13cf7bb8e3a?imageslim)

---

## 优化DOM操作

### 1.状态改变(state) -> 构建新的 DOM 元素更新页面

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

### 2.配置改变（prop） -> 构建新的 DOM 元素更新页面

在开发当中，可能需要给组件传入一些自定义的配置数据。例如说想配置一下点赞按钮的背景颜色，如果我给它传入一个参数，告诉它怎么设置自己的颜色。那么这个按钮的定制性就更强了在实际开发当中，你可能需要给组件传入一些自定义的配置数据。例如说想配置一下点赞按钮的背景颜色，如果我给它传入一个参数，告诉它怎么设置自己的颜色。那么这个按钮的定制性就更强了

```
...
    constructor (props = {}) {
      this.props = props
    }
...

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


---

## 抽象出公共组件类

为了让代码更灵活，可以写更多的组件，我们把这种模式抽象出来，放到一个 Component 类当中：

```
   class Component {
      constructor (props = {}) {
        this.props = props
      }
      setState (state) {
        const oldEl = this.el
        this.state = state
        this.el = this.renderDOM()
        if (this.onStateChange) this.onStateChange(oldEl, this.el)
      }
      renderDOM () {
        this.el = createDOMFromString(this.render())
        if (this.onClick) {
          this.el.addEventListener('click', this.onClick.bind(this), false)
        }
        return this.el
      }
    }

```

这个是一个组件父类 Component，所有的组件都可以继承这个父类来构建。它主要定义两个方法，一个是 setState；一个是私有方法 _renderDOM。_renderDOM 方法会调用 this.render 来构建 DOM 元素并且监听 onClick 事件。所以，组件子类继承的时候只需要实现一个返回 HTML 字符串的 render 方法就可以了。


还有一个额外的 mount 的方法，其实就是把组件的 DOM 元素插入页面，并且在 setState 的时候更新页面：
 
 ```
  const mount = (component, wrapper) => {
    wrapper.appendChild(component._renderDOM())
    component.onStateChange = (oldEl, newEl) => {
      wrapper.insertBefore(newEl, oldEl)
      wrapper.removeChild(oldEl)
    }
  }
  ```

  只要有了上面那个 Component 类和 mount 方法就可以做到组件化。如果我们需要写另外一个组件，只需要像上面那样，简单地继承一下 Component 类就好了：

  ```
   class RedBlueButton extends Component {
    constructor (props) {
      super(props)
      this.state = {
        color: 'red'
      }
    }

    onClick () {
      this.setState({
        color: 'blue'
      })
    }

    render () {
      return `
        <div style='color: ${this.state.color};'>${this.state.color}</div>
      `
    }
  }

  ```