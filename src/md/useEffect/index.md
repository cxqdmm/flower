# useEffect、useLayoutEffect

---

useEffect 的作用和 componentDidMount 以及 componentDidUpdate 有点类似，只不过 useEffect 的粒度更细，可以在 useEffect 中控制一个流程的发起和销毁。具体用法可以查看[官网](https://zh-hans.reactjs.org/docs/hooks-effect.html),这里主要讨论下 useEffect 和 componentDidMount/componentDidUpdate 的区别 以及 useEffect 和 useLayoutEffect 的区别。

## useEffect vs componentDidMount/componentDidUpdate

componentDidMount 是 class 组件初次渲染结束时执行的生命周期函数，是在 react 的 commit 阶段，紧接着组件渲染完后执行的，会阻塞浏览器的渲染，如果在其中执行耗时的任务，那在耗时任务结束前，页面是看不到更新的，componentDidUpdate 和 componentDidMount 的行为差不多，只是执行的时机不是初次渲染。

useEffect 有三个重要的组成，处理函数、依赖、销毁函数（处理函数返回的函数），每当依赖发生变化都会先执行上一次生成的销毁函数再执行新的处理函数。

**useEffect 不会阻塞浏览器的渲染**，因为 useEffect 是等到 commit 完成后，再在另一个宏任务中执行的，这个宏任务是通过 messageChannel 的 postMessage 触发的 j 具体细节可查看 react schedule 模块的实现。

## useEffect vs useLayoutEffect

事实上百分之 99%的场景使用 useEffect 和 useLayoutEffect 的效果是一样的, 不同点是，useLayoutEffect 的表现和 componentDidUpdate 一样，会阻塞浏览器的渲染,具体可参考[useEffect](https://codesandbox.io/s/useeffect-vs-uselayouteffect-gtvim),可以发现使用 useEffect 时红色数字 1 会一闪而过，useLayoutEffect 不会出现这种现象。

<img src="/react-markdown/assets/useEffect.png" alt="github" width="80%" style="margin: auto;display: block;">
