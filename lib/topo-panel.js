class TopoPanel {
  /**
  * 往编辑器内移动图标时暂存图标数据，在拖拽的onDragstart事件中调用该方法
  * @param data   图标数据,必填值 { image: image }
  * 数据的key可以通过初始化时候在config中传入dragImage,dragText,dragTextPosition进行修改
  */
  handlerDragStart(data) {
    this.dragData = data
  }

  /**
   * 替换当前舞台,用于重新加载
   */
  replaceStage(canvas, data) {
    canvas.height = canvas.offsetHeight
    canvas.width = canvas.offsetWidth
    const topologyJSON = data ? data : this.stage.toJson()
    JTopo.replaceStageWithJson(JSON.parse(topologyJSON), this.stage, this.scene, this.config)
  }

  /**
   * 切换点击/连线类型
   * @param type
   * 连线类型：default, line, simpleLine, horizontalFoldLine, verticalFoldLine, horizontalFlexLine, verticalFlexLine
  */
  switchLineType(type) {
    switch(type) {
      case 'default':
        this.lineType = null
        this.linkDirection = ''
        break
      case 'line':
        this.lineType = 'line'
        this.linkDirection = ''
        break
      case 'simpleLine':
        this.lineType = 'line'
        this.linkDirection = 'simple'
        break
      case 'horizontalFoldLine':
        this.lineType = 'foldLine'
        this.linkDirection = 'horizontal'
        break
      case 'verticalFoldLine':
        this.lineType = 'foldLine'
        this.linkDirection = 'vertical'
        break
      case 'horizontalFlexLine':
        this.lineType = 'flexLine'
        this.linkDirection = 'horizontal'
        break
      case 'verticalFlexLine':
        this.lineType = 'flexLine'
        this.linkDirection = 'vertical'
    }
  }

  /** 删除节点或连线 */
  deleteEl() {
    let n = null
    if (this.currentNode) n = this.currentNode
    if (this.currentLink) n = this.currentLink
    // 删除线的时候判断是否有节点是画线节点，有则删除
    if (n.elementType === 'link') {
      n.nodeA.onlyConnect && this.scene.remove(n.nodeA)
      n.nodeZ.onlyConnect && this.scene.remove(n.nodeZ)
    }
    // 删除节点的时候判断是否有连线另一个节点为画线节点，有则删除
    if (n.elementType === 'node') {
      const linkList = this.scene.childs.filter(item => item.elementType === 'link' && (item.nodeA === n || item.nodeZ === n))
      linkList.forEach((item) => {
        item.nodeA !== n && item.nodeA.onlyConnect && this.scene.remove(item.nodeA)
        item.nodeZ !== n && item.nodeZ.onlyConnect && this.scene.remove(item.nodeZ)
      })
    }
    this.scene.remove(n)
    this.currentNode = null
    this.currentLink = null
    // 连线重置
    this.beginNode = null
    this.link && this.scene.remove(this.link)
    this.link = null
  }

  // 给线添加动画效果
  addLinkAnimation() {
    if (!this.currentLink) throw new Error('currentLink参数为空！未选择连线')
    this.currentLink.PointPathColor = this.config.linkPointPathColor
  }

  // 反转动画方向
  reverseLinkAnimation() {
    if (!this.currentLink) throw new Error('currentLink参数为空！未选择连线')
    const nodeA = this.currentLink.nodeA
    this.currentLink.nodeA = this.currentLink.nodeZ
    this.currentLink.nodeZ = nodeA
  }

  /**
   * 注册右键菜单
   * @param container  右键菜单Dom，必填
   * @param obj 菜单类型，node、link、stage代表右键点击何种目标时出现菜单
   */
  registeredMenu(container, obj) {
    container.setAttribute('style', 'position:absolute;top:0;left:0;display:none')
    if (obj === 'node') {
      this.nodeMenu = container
    } else if (obj === 'link') {
      this.linkMenu = container
    } else if (obj === 'stage') {
      this.stageMenu = container
    }
    this.mainContent.appendChild(container)
  }

  // 关闭菜单
  closeMenu() {
    if (this.nodeMenu) this.nodeMenu.style.display = 'none'
    if (this.linkMenu) this.linkMenu.style.display = 'none'
    if (this.stageMenu) this.stageMenu.style.display = 'none'
  }
}

module.exports = TopoPanel