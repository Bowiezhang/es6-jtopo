<template>
  <div id="app">
    <div class="left-content">
      <div class="line-group">
        <div v-for="(item, index) in imgList" :key="index" class="line-image" :class="{'active': activeType === item.type}" @click="switchLineType(item.type)">
          <img :src="item.img" draggable="false">
          <div>{{ item.name }}</div>
        </div>
      </div>
      <div class="image-group">
        <img v-for="(item, index) in imageList" :key="index" :src="item.src" alt="" @dragstart="dragStart(item)">
      </div>
    </div>
    <div class="right-content">
      <div class="operation-bar">
        <button @click="topoEdit.scene.clear()">清空编辑器</button>
        <button @click="topoEdit.replaceStage($refs.canvas)">重新加载</button>
        <button @click="toJson">序列化</button>
        <button @click="topoEdit.stage.centerAndZoom()">居中</button>
      </div>
      <div ref="canvas" class="canvas"></div>
    </div>

    <ul ref="node-menu">
      <li v-for="(item, index) in textPositionList" :key="index" @click="changeTextPostion(item.value)">{{ item.name }}</li>
      <li @click="deleteElement">删除</li>
    </ul>
    <ul ref="stage-menu">
      <li>编辑器右键</li>
    </ul>
    <ul ref="link-menu">
      <li @click="addLinkAnimation">添加动画</li>
      <li @click="reverseLinkAnimation">改变动画方向</li>
      <li @click="deleteElement">删除</li>
    </ul>
  </div>
</template>

<script>
import Topo from 'topo'
import { data } from './json'

export default {
  name: 'App',

  data() {
    return {
      topoEdit: null,
      imgList: [
        {img: require('@/assets/mouse.png'), type: 'default', name: '点击'},
        {img: require('@/assets/line.png'), type: 'line', name: '连线'},
        {img: require('@/assets/line.png'), type: 'simpleLine', name: '普通画线'},
        {img: require('@/assets/line_foldline_horizontal.png'), type: 'horizontalFoldLine', name: '折线(横向)'},
        {img: require('@/assets/line_foldline_vertical.png'), type: 'verticalFoldLine', name: '折线(纵向)'},
        {img: require('@/assets/line_flexline_horizontal.png'), type: 'horizontalFlexLine', name: '二次折线(横向)'},
        {img: require('@/assets/line_flexline_vertical.png'), type: 'verticalFlexLine', name: '二次折线(纵向)'},
      ],
      textPositionList: [
        { name: '顶部居左', value: 'Top_Left' },
        { name: '顶部居中', value: 'Top_Center' },
        { name: '顶部居右', value: 'Top_Right' },
        { name: '中间居左', value: 'Middle_Left' },
        { name: '居中', value: 'Middle_Center' },
        { name: '中间居右', value: 'Middle_Right' },
        { name: '底部居左', value: 'Bottom_Left' },
        { name: '底部居中', value: 'Bottom_Center' },
        { name: '底部居右', value: 'Bottom_Right' },
      ],
      imageList: [
        { src: 'http://www.jtopo.com/demo/img/statistics/host.png' },
        { src: 'http://www.jtopo.com/demo/img/statistics/cloud.png', text: '云端', textPosition: 'Top_Center' }
      ],
      activeType: 'default'
    }
  },

  methods: {
    init() {
      this.topoEdit = new Topo(this.$refs.canvas, {
        nodeFontColor: '255, 255, 255',
        linkStrokeColor: '255, 255, 255',
        linkPointPathColor: 'rgb(11, 234, 18)'
      }, data)

      this.topoEdit.registeredMenu(this.$refs['node-menu'], 'node')
      this.topoEdit.registeredMenu(this.$refs['link-menu'], 'link')
      this.topoEdit.registeredMenu(this.$refs['stage-menu'], 'stage')
    },

    dragStart(item) {
      this.topoEdit.handlerDragStart({ image: item.src, text: item.text,textPosition: item.textPosition })
    },

    switchLineType(type) {
      this.activeType = type
      this.topoEdit.switchLineType(type)
    },

    changeTextPostion(value) {
      this.topoEdit.currentNode.textPosition = value
      this.topoEdit.closeMenu()
    },

    addLinkAnimation() {
      this.topoEdit.addLinkAnimation()
      this.topoEdit.closeMenu()
    },

    reverseLinkAnimation() {
      this.topoEdit.reverseLinkAnimation()
      this.topoEdit.closeMenu()
    },

    deleteElement() {
      this.topoEdit.deleteEl()
      this.topoEdit.closeMenu()
    },

    toJson() {
      console.log(this.topoEdit.stage.toJson())
      alert(this.topoEdit.stage.toJson())
    }
  },

  mounted() {
    this.init()
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: absolute;
  top: 0;
  left: 0;
  height: calc(100% - 100px);
  width: calc(100% - 100px);
  padding: 50px;
}

.left-content {
  float: left;
  width: 300px;
  height: 100%;
  background: rgb(48, 53, 70);
}

.line-group {
  display: flex;
  flex-wrap: wrap;
}

.line-image {
  width: 87px;
  margin-right: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  padding: 10px 0;
}

.line-image:nth-child(3n + 3) {
  margin-right: 0;
}

.image-group {
  display: flex;
  margin: 20px 10px;
}

.image-group img {
  margin-right: 10px;
  width: 32px;
  height: 32px;
}

.active {
  background:rgba(0,0,0,0.2);
}

.right-content {
  margin-left: 300px;
  width: calc(100% - 300px);
  height: 100%;
  background: #23283A;
}

.canvas {
  height: calc(100% - 30px);
  width: 100%;
}

.operation-bar {
  height: 30px;
  display: flex;
  align-items: center;
  background: rgb(48, 53, 70);
  padding: 0 10px;
}

ul{
  width: 120px;
  text-align: center;
  list-style: none;
  border: 1px solid #aaa;
  border-bottom: 0;
  background: #eee;
  padding: 0;
  margin: 0;
  cursor: pointer;
}
</style>
