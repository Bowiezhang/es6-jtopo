require('./utils')
require('./jtopo-0.4.8-dev')
const TopoPanel = require('./topo-panel')

class TopoEditor extends TopoPanel {
  constructor(container, config = {}, data) {
    super()

    this.config = Object.assign({
      // Stage属性
      stageFrames: 60, // 舞台播放的帧数/秒
      defaultScal: 0.95, // 鼠标滚轮缩放比例
      eagleEyeVsibleDefault: false, // 是否显示鹰眼对象
      // Scene属性
      sceneAlpha: 0,
      // Node属性
      nodeAlpha: 1, // 节点透明度,取值范围[0-1]
      nodeStrokeColor: '22,124,255', // 节点描边的颜色
      nodeFillColor: '22,124,255', // 节点填充颜色
      nodeShadow: false, // 节点是否显示阴影
      nodeShadowColor: 'rgba(0,0,0,0.5)', // 节点阴影的颜色
      nodeFont: '12px Consolas', // 节点字体
      nodeFontColor: '', // 节点文字颜色,如"255,255,0"
      nodeDefaultWidth: 32, // 新建节点默认宽
      nodeDefaultHeight: 32, // 新建节点默认高
      nodeBorderColor: 'black', // 节点容器边框颜色,如"255,255,0"
      nodeBorderRadius: 30, // 节点半径，非圆节点有此属性会变形
      nodeRotateValue: 0.5, // 节点旋转的角度(弧度)
      nodeScale: 0.2, // 节点缩放幅度(此处保证X和Y均等缩放)
      // Link属性
      linkAlpha: 1, // 连线透明度,取值范围[0-1]
      linkStrokeColor: '', // 连线的颜色
      linkFillColor: '123,165,241',
      linkShadow: false, // 是否显示连线阴影
      linkShadowColor: 'rgba(0,0,0,0.5)',
      linkFont: '12px Consolas', // 节点字体
      linkFontColor: 'black', // 连线文字颜色,如"255,255,0"
      linkArrowsRadius: 0, // 线条箭头半径
      linkDefaultWidth: 1, // 连线宽度
      linkOffsetGap: 40, // 折线拐角处的长度
      linkPointPathColor: 'rgb(255,255,0)', // 连线动画颜色
      // Container属性
      containerAlpha: 1,
      containerStrokeColor: '22,124,255',
      containerFillColor: '22,124,255',
      containerShadow: false,
      containerShadowColor: 'rgba(0,0,0,0.5)',
      containerFont: '12px Consolas',
      containerFontColor: 'black',
      containerBorderColor: 'black',
      containerBorderRadius: 30,
      // 参数命名
      dragImage: 'image',
      dragText: 'text',
      dragTextPosition: 'textPosition'
    }, config)
    // 绘图区属性
    this.stage = null
    this.scene = null
    // 当前模式
    this.stageMode = 'edit'
    // 默认连线类型
    this.lineType = null
    // 折线的方向
    this.linkDirection = null
    // 当前选择的节点对象
    this.currentNode = null
    // 当前选择的连线对象
    this.currentLink = null
    // 拖拽图标时候的临时数据
    this.dragData = null

    const dom = this._initDom(container)
    this.mainContent = dom.main
    this.canvas = dom.canvas

    if (!data) {
      data = {
        version: '0.4.8',
        wheelZoom: 0.95,
        childs: [
          {
            elementType: 'scene',
            translateX: 0,
            translateY: 0,
            scaleX: 1,
            scaleY: 1,
            backgroundColor: '35,40,58',
            childs: [],
          },
        ],
      }
    }

    this._init(data, this.canvas)
  }

  // 初始化dom元素
  _initDom(container) {
    const main = document.createElement('div')
    main.setAttribute('style', 'height:100%;width:100%;position:relative')
    container.appendChild(main)
  
    const canvas = document.createElement('canvas')
    canvas.style.height = '100%'
    canvas.style.width = '100%'
    canvas.ondragover	= handlerDragOver
    canvas.ondrop = (event) => { this._handlerDrop(event) }
    main.appendChild(canvas)
  
    canvas.height = canvas.offsetHeight
    canvas.width = canvas.offsetWidth
    return { canvas, main }
  }

  /**
   * 编辑器初始化方法,根据请求返回结果加载空白的或者指定结构的拓扑编辑器
   * @param topologyJson    拓扑JSON结构
   */
  _init(topologyJson, canvas) {
    // 加载空白的编辑器
    if (topologyJson === '-1') {
      this.stage = new JTopo.Stage(canvas) // 定义舞台对象
      this.scene = new JTopo.Scene(this.stage) // 定义场景对象
    } else {
      this.stage = JTopo.createStageFromJson(topologyJson, canvas, this.config) // 根据保存好的jsonStr(拓扑结构)创建舞台对象
      this.scene = this.stage.childs[0] // 场景对象列表,childs是舞台的属性
    }

    // 滚轮缩放
    this.stage.frames = this.config.stageFrames // 设置当前舞台播放的帧数/秒
    this.stage.wheelZoom = this.config.defaultScal // 鼠标滚轮缩放操作比例
    this.stage.eagleEye.visible = this.config.eagleEyeVsibleDefault // 是否开启鹰眼
    this.stage.mode = this.stageMode
    this.scene.alpha = this.config.sceneAlpha
    // 用来连线的两个节点
    this.tempNodeA = new JTopo.Node('tempA')
    this.tempNodeA.setSize(1, 1)
    this.tempNodeZ = new JTopo.Node('tempZ')
    this.tempNodeZ.setSize(1, 1)
    this.beginNode = null
    this.link = null

    /**
     * 监听鼠标松开事件
     * 处理右键菜单、左键连线
     * event.button: 0-左键 1-中键 2-右键
    */
    this.scene.mouseup((event) => {
      if (!event.target) {
        this.currentLink = null
        this.currentNode = null
      }
  
      if (event.target && event.target instanceof JTopo.Node) {
        this.currentNode = event.target
        this.currentLink = null
      } else if (event.target && event.target instanceof JTopo.Link) {
        this.currentLink = event.target
        this.currentNode = null
      }
  
      if (this.stageMode !== 'edit') return

      this.closeMenu()
  
      if (event.button === 0) {
        this._handlerLeftButton(event)
      } else if (event.button === 2) {
        this._handlerRightButton(event)
      }
    })

    // 动态更新连线坐标(创建连线时的临时节点A-Z)
    this.scene.mousemove((event) => {
      if (this.beginNode) {
        this.tempNodeZ.setLocation(event.x, event.y)
      }
    })

    // 清除起始节点不完整的拖放线
    this.scene.mousedown((event) => {
      if (this.link && (event.target == null || event.target === this.beginNode || event.target === this.link)) {
        this.scene.remove(this.link)
      }
    })

    // 鼠标移出舞台
    this.stage.mouseout((event) => {
      // 删掉节点带出来的连线
      if (this.link && (event.target == null || event.target === this.beginNode || event.target === this.link)) {
        if (this.beginNode && this.beginNode.onlyConnect) this.scene.remove(this.beginNode)
        this.scene.remove(this.link)
        this.beginNode = null
      }
    })
  }

  /**
   * 处理鼠标左键松开
   */
  _handlerLeftButton(event) {
    if ((event.target != null && event.target instanceof JTopo.Node && this.lineType) || this.linkDirection === 'simple') {
      if (this.beginNode === null) {
        // 如果连线还未开始，选择初始点

        if (this.linkDirection === 'simple' && (!event.target || event.target instanceof JTopo.Link)) {
          // 创建母线的初始点
          const node = new JTopo.Node()
          node.setSize(1, 1)
          node.setBound(event.x, event.y, 1, 1)
          node.nodeId = generateUUID()
          node.onlyConnect = true
          this.scene.add(node)
          this.beginNode = node
        } else {
          // 选择连线的初始点
          this.beginNode = event.target
        }

        switch(this.lineType) {
          case 'line':
            // 直线
            this.link = new JTopo.Link(this.tempNodeA, this.tempNodeZ)
            this.link.lineType = 'line'
            break
          case 'foldLine':
            // 折线
            this.link = new JTopo.FoldLink(this.tempNodeA, this.tempNodeZ)
            this.link.lineType = 'foldLine'
            this.link.direction = this.linkDirection
            break
          case 'flexLine':
            // 二次折线
            this.link = new JTopo.FlexionalLink(
              this.tempNodeA,
              this.tempNodeZ,
            )
            this.link.direction = this.linkDirection
            this.link.lineType = 'flexLine'
        }

        this.link.dashedPattern = 2
        this.link.lineWidth = this.config.linkDefaultWidth
        this.link.shadow = this.config.linkShadow
        this.link.strokeColor = JTopo.util.randomColor()
        this.scene.add(this.link)
        this.tempNodeA.setLocation(event.x, event.y)
        this.tempNodeZ.setLocation(event.x, event.y)
      } else if (event.target && this.beginNode !== event.target && event.target instanceof JTopo.Node) {
        // 普通点作为终点
        let endNode = event.target
        let link = null
        switch(this.lineType) {
          case 'line':
            // 直线
            link = new JTopo.Link(this.beginNode, endNode)
            link.lineType = 'line'
            break
          case 'foldLine':
            // 折线
            link = new JTopo.FoldLink(this.beginNode, endNode)
            link.direction = this.linkDirection
            link.bundleOffset = this.config.linkOffsetGap // 折线拐角处的长度
            link.lineType = 'foldLine'
            break
          case 'flexLine':
            // 二次折线
            link = new JTopo.FlexionalLink(this.beginNode, endNode)
            link.direction = this.linkDirection
            link.lineType = 'flexLine'
            link.offsetGap = this.config.linkOffsetGap
        }
        link.strokeColor = this.config.linkStrokeColor
        link.lineWidth = this.config.linkDefaultWidth
        link.nodeSrc = this.beginNode.nodeId
        link.nodeDst = endNode.nodeId

        this.scene.add(link)
        this.beginNode = null
        this.scene.remove(this.link)
        this.link = null
      } else if (this.beginNode && this.linkDirection === 'simple') {
        // 母线点作为终点
        const node = new JTopo.Node()
        node.setSize(1, 1)
        node.setBound(event.x, event.y, 1, 1)
        node.nodeId = generateUUID()
        node.onlyConnect = true
        this.scene.add(node)
        const link = new JTopo.Link(this.beginNode, node)
        link.lineType = 'line'
        link.strokeColor = this.config.linkStrokeColor
        link.lineWidth = this.config.linkDefaultWidth
        link.nodeSrc = this.beginNode.nodeId
        link.nodeDst = node.nodeId

        this.scene.add(link)
        this.beginNode = null
        this.scene.remove(this.link)
        this.link = null
      }
    } else {
      this.link && this.scene.remove(this.link)
      this.beginNode = null
    }
  }

  /**
   * 处理右键点击
   */
  _handlerRightButton(event) {
    // 加一位置是为了避免打开菜单鼠标位置就在菜单第一项
    const top = `${(event.layerY ? event.layerY : event.offsetY) + 1}px`
    const left = `${(event.layerX ? event.layerX : event.offsetX) + 1}px`
    if (this.nodeMenu && event.target != null && event.target instanceof JTopo.Node) {
      // 点
      this.nodeMenu.style.top = top
      this.nodeMenu.style.left = left
      this.nodeMenu.style.display = ''
    } else if (this.linkMenu && event.target != null && event.target instanceof JTopo.Link) {
      // 线
      this.linkMenu.style.top = top
      this.linkMenu.style.left = left
      this.linkMenu.style.display = ''
    } else if (this.stageMenu) {
      // 编辑器空白处
      this.stageMenu.style.top = top
      this.stageMenu.style.left = left
      this.stageMenu.style.display = ''
    }
  }

  /**
  * 拖拽结束事件，将拖拽的图标放入编辑器中
  * 通过dragData[config]获取点的配置
  */
  _handlerDrop(event) {
    const node = new JTopo.Node()
    node.fontColor = this.config.nodeFontColor
    // 节点坐标
    node.setBound(
      (event.layerX ? event.layerX : event.offsetX) - this.scene.translateX - this.config.nodeDefaultWidth / 2,
      (event.layerY ? event.layerY : event.offsetY) - this.scene.translateY - this.config.nodeDefaultHeight / 2,
      this.config.nodeDefaultWidth,
      this.config.nodeDefaultHeight,
    )
    // 节点图片
    node.setImage(this.dragData[this.config.dragImage])
    // 节点数据
    node.nodeId = generateUUID()
    node.text = this.dragData[this.config.dragText]
    node.nodeImage = this.dragData[this.config.dragImage]
    node.textPosition = this.dragData[this.config.dragTextPosition] || 'Bottom_Center'
    node.extData = this.dragData.extData

    this.scene.add(node)
    this.dragData = null
  }
}





function handlerDragOver(event) {
  event.preventDefault()
  return false
}

/*
 * 生成uuid算法
 */
function generateUUID() {
  var d = new Date().getTime()
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

module.exports = TopoEditor