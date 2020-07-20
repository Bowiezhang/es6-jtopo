# topo

## 运行测试环境
主目录为topo封装库，测试项目在tests目录中

```
npm link

cd tests

npm install

npm link es6-jtopo

npm run start
```


## 使用
```
import Topo from 'es6-jtopo'

new Topo()
```

## api

提供调用的api都写在/lib/topo-panel.js中，同时如果需要手动改参数的话，也可以直接对对象中的参数进行修改。
初始化topo图的时候可以对一些默认参数进行初始化设定，具体参数详见/lib/topo.js的构造函数。
需要初始化已有图谱的时候，在初始化的时候传入图谱的数据即可。