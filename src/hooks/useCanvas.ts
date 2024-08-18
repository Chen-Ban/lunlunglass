import React from 'react'
import { useEffect, useCallback, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { useDispatch } from 'react-redux'
import { isEqual } from 'lodash'

import {
  computePathByEdgeOffset,
  throttle,
  convertLocation2Path,
  getResizeDirection,
  client2canvas,
  cursorInPath,
  cursorOnBoundingEdge,
  cursorInResizeBlock,
  computeLocAndSizeOffsetOnResizing,
  isSameLocation,
  getActiveNodes,
  mergeRange,
  selectionStr2Arr,
  toSortedSelection,
  getOverlapSelection,
  getDifferSelection,
  getCursorLocation,
  getRelativeLocBounding,
  computeMagnitude,
  hasOverlap,
  getCursorPIndex,
} from 'utils/utils'
import {
  patchTemplateNodeList,
  updateAllTextNodeSelection,
  updateNodeActivation,
  updateNodeStructure,
  updateTemplate,
  updateTextNodeSelection,
  updateTextNodeHeightAdoptive,
  updateTemplateData,
  updateNodeOptions,
} from 'store/Template'
import {
  Size,
  Point,
  Template,
  CanvasNode,
  NodeType,
  ResizeDirection,
  Vector,
  VerAlign,
  HorAlign,
  Box,
  RenderTextOptions,
  Range,
  FontOptions,
  Selection,
  RowOptions,
} from 'store/types/Template.type'
import selectionManage from 'models/SelectionManage/SelectionManage'
import { TemplateData } from 'store/types/TemplateData.type'
import usePrinter from './usePrinter'
import { BOXMARGIN, BOXPADDING, MOUSEMOVEPERIOD } from '../constants'
import { emptyBox } from 'components/PrintTemplate/TextTemplate/builtIn'
import { SelectionObj } from 'src/models/SelectionManage/ISelectionManage'

enum CanvasNodeMouseEventOperation {
  ISMOVING = 'isMoving', //移动位置
  ISRESIZING = 'isResizing', //调整尺寸
  ISSELECTION = 'isSelection', //文本框选择
  ISSELECTING = 'isSelecting', //节点选择
  CLICK = 'click',
  NONE = 'none',
}

const useCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>, template: Template | undefined) => {
  const dispatch = useDispatch()

  //根据鼠标位置定义的鼠标操作
  const mouseOperationRef = useRef<CanvasNodeMouseEventOperation>(CanvasNodeMouseEventOperation.NONE)
  //鼠标落下和松开时的位置
  const mousedownLocationRef = useRef<Point | null>(null)
  const mouseupLocationRef = useRef<Point | null>(null)
  //记录鼠标落下时的文本的索引，用于选择文本
  const mousedownCursorIndexRef = useRef<number | undefined>()
  //上一次鼠标位置
  const lastMousemoveLocationRef = useRef<Point | null>(null)
  //鼠标落下位置的节点
  const metaNodeRef = useRef<CanvasNode | null>(null)
  //键盘转发元素ref
  const canvasProxy = useRef<HTMLDivElement | null>(null)

  //画布上下文ref
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null)

  //经过画布操作调整后的模板数据
  const [adjustedTemplate, setAdjustedTemplate] = useState<Template | undefined>()

  //将画布引用和模板数据传入自定义hook，返回render，preview和print函数
  const { preview, print } = usePrinter(canvasContextRef.current, adjustedTemplate)

  const creatTextNode = useCallback(
    ({ x, y, height = 24, width = 250 }: Point & Partial<Size>) => {
      if (template) {
        //获取顶层layer
        const layer = template.nodeList.length + 1

        const path = convertLocation2Path({ x, y, w: 1 }, { height, width })
        return {
          componentId: '0001-002', //正文文本组件
          instanceId: uuid(),
          isActive: true,
          structure: {
            contentBox: {
              location: { x, y, w: 1 },
              size: { height: height * 1.2, width },
              path,
            },
          },
          layer,
          type: NodeType.TEXT,
          options: {
            paragrahsIndex: ['0-0'],
            rowsIndex: ['0-0'],
            paragrahs: {
              '0-0': {
                rows: {
                  '0-0': {
                    font: {
                      '0-0': {
                        fontFamily: 'Arial',
                        fontWeight: 'normal',
                        fontSize: height,
                        italicly: false,
                        underLine: false,
                        color: 0x000000,
                        characterWidth: 0,
                      },
                    },
                    contentBox: emptyBox(),
                    rowIndex: 0,
                  },
                },
                contentBox: emptyBox(),
                preGap: 0,
                paragrahIndex: 0,
                postGap: 0,
              },
            },
            isAdoptiveHeight: true,
            selection: '0-0',
            minContentWidth: Infinity,
            selectionBoxes: [],
            align: {
              vertical: VerAlign.MIDDLE,
              horizontal: HorAlign.LEFT,
            },
            contentBox: emptyBox(),
            Leading: 1,
          } as RenderTextOptions,
          propName: `prop${layer}`,
        }
      }
    },
    [template],
  )

  // 双击事件处理
  const handleCanvasDoubleClick = useCallback(
    (e: MouseEvent) => {
      if (template) {
        //获取鼠标点位
        const cursorLocation = client2canvas(e)
        if (!metaNodeRef.current) {
          //没有节点就创建文本节点,节点中数据使用模板默认（并且将当前文本节点放在最顶层）
          const textNode = creatTextNode(cursorLocation) as CanvasNode

          dispatch(
            patchTemplateNodeList({
              templateId: template.templateId,
              node: textNode,
              templateDataItem: '',
            }),
          )
        }
      }
    },
    [canvasRef.current, template],
  )

  // 单击事件处理
  const handleCanvasClick = useCallback(
    (e: MouseEvent) => {
      if (mouseOperationRef.current == CanvasNodeMouseEventOperation.CLICK && template) {
        let toActiveNodesId: CanvasNode['instanceId'][] = getActiveNodes(template).map((node) => node.instanceId)

        if (!metaNodeRef.current) {
          toActiveNodesId = []
        } else if (e.ctrlKey) {
          toActiveNodesId.push(metaNodeRef.current.instanceId)
          dispatch(
            updateAllTextNodeSelection({
              templateId: template.templateId,
            }),
          )
        } else if (!e.ctrlKey) {
          toActiveNodesId = [metaNodeRef.current.instanceId]
          if (metaNodeRef.current.type === NodeType.TEXT) {
            canvasProxy.current?.focus()
          }
        }

        //设置激活的节点
        dispatch(
          updateNodeActivation({
            templateId: template.templateId,
            toActiveNodesId,
          }),
        )
      }
    },
    [canvasRef.current, template, metaNodeRef.current],
  )

  // 鼠标按下事件处理
  const handleCanvasMouseDown = useCallback(
    (e: MouseEvent) => {
      //总共分三种情况
      //1.点击了空白:在后续移动过程中绘制选择区域(目前只考虑矩形框选,笔刷和套索后续实现)
      //2.点击了非激活元素
      //2.1.点击了非文本元素->移动
      //2.2.点击了文本元素->输入
      //3.点击了激活元素:
      //3.1.点击了激活元素的边框或者激活的非文本元素->移动
      //3.2.点击了缩放块->缩放
      //3.3.点击了激活的文本元素的内容区域->输入

      //将点击位置的元素按照层级从小到大排列
      if (template) {
        const cursorLocation = client2canvas(e)
        mousedownLocationRef.current = cursorLocation //存储跨跨函数贡献的点位数据
        lastMousemoveLocationRef.current = cursorLocation //存储跨跨函数贡献的点位数据
        const choosedNodes = template.nodeList // 寻找到点击位置所在的节点们（包括缩放块和外边距）
          .filter((node) => {
            const responseBoxPath = computePathByEdgeOffset(node.structure.contentBox.path, BOXPADDING + BOXMARGIN) //响应区域
            return (
              cursorInPath(cursorLocation, responseBoxPath) ||
              cursorInResizeBlock(cursorLocation, node.structure.contentBox.path)
            )
          })
          .sort((pre, cur) => pre.layer - cur.layer)
        const choosedNodesLength = choosedNodes.length

        //如果点击到了空白,将鼠标移动操作改为框选
        if (choosedNodesLength == 0) {
          metaNodeRef.current = null
          mouseOperationRef.current = CanvasNodeMouseEventOperation.ISSELECTING
          return
        }
        //找到最顶层的激活元素(如果元素未激活说明点击的地方没有激活元素)
        const topLayerChoosedNodeWithinActived = choosedNodes.reduce((pre, cur) => (cur.isActive ? cur : pre))

        //实际层级最高的节点
        const lastNode = choosedNodes[choosedNodesLength - 1]
        //点击了非激活元素,激活当前元素
        if (!topLayerChoosedNodeWithinActived.isActive) {
          //如果点击到了非激活文本元素元素
          if (lastNode.type == NodeType.TEXT) {
            const relativeTCLocation: Point = getRelativeLocBounding(cursorLocation, lastNode)
            //设置输入框选取状态
            const cursorIndex = getCursorLocation(lastNode, relativeTCLocation)
            mousedownCursorIndexRef.current = cursorIndex
            dispatch(
              updateTextNodeSelection({
                templateId: template.templateId,
                instanceId: lastNode.instanceId,
                selection: `${cursorIndex}-${cursorIndex}`,
              }),
            )
            //将最上层节点存储
            metaNodeRef.current = {
              ...lastNode,
              options: {
                ...lastNode.options,
                selection: `${cursorIndex}-${cursorIndex}`,
              },
            }
            mouseOperationRef.current = CanvasNodeMouseEventOperation.ISSELECTION
          } else {
            mouseOperationRef.current = CanvasNodeMouseEventOperation.ISMOVING
            metaNodeRef.current = lastNode
          }
        } else {
          //选中了激活的文本元素的内容区域
          if (
            topLayerChoosedNodeWithinActived.type == NodeType.TEXT &&
            cursorInPath(cursorLocation, topLayerChoosedNodeWithinActived.structure.contentBox.path)
          ) {
            //设置输入框选择状态
            mouseOperationRef.current = CanvasNodeMouseEventOperation.ISSELECTION
            //将光标移动到对应的位置（修改对应节点的options）参考微信输入框（鼠标落下时确认光标位置，移动过程中不显示）
            const relativeTCLocation: Point = getRelativeLocBounding(cursorLocation, topLayerChoosedNodeWithinActived)
            const cursorIndex = getCursorLocation(topLayerChoosedNodeWithinActived, relativeTCLocation)
            mousedownCursorIndexRef.current = cursorIndex
            dispatch(
              updateTextNodeSelection({
                templateId: template.templateId,
                instanceId: topLayerChoosedNodeWithinActived.instanceId,
                selection: `${cursorIndex}-${cursorIndex}`,
              }),
            )
            metaNodeRef.current = {
              ...topLayerChoosedNodeWithinActived,
              options: {
                ...topLayerChoosedNodeWithinActived.options,
                selection: `${cursorIndex}-${cursorIndex}`,
              },
            }
            return
          } else if (
            cursorOnBoundingEdge(cursorLocation, topLayerChoosedNodeWithinActived.structure.contentBox.path) ||
            (topLayerChoosedNodeWithinActived.type != NodeType.TEXT &&
              !cursorInResizeBlock(cursorLocation, topLayerChoosedNodeWithinActived.structure.contentBox.path))
          ) {
            //点击了激活元素的边框或者激活的非文本元素
            mouseOperationRef.current = CanvasNodeMouseEventOperation.ISMOVING
          } else if (cursorInResizeBlock(cursorLocation, topLayerChoosedNodeWithinActived.structure.contentBox.path)) {
            //点击了缩放块
            mouseOperationRef.current = CanvasNodeMouseEventOperation.ISRESIZING
          }
          metaNodeRef.current = topLayerChoosedNodeWithinActived
        }
      }
    },
    [
      template,
      canvasRef.current,
      mouseOperationRef.current,
      mousedownLocationRef.current,
      lastMousemoveLocationRef.current,
      metaNodeRef.current,
    ],
  )

  // 鼠标移动事件处理
  const handleCanvasMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      if (canvasRef.current && template) {
        const nodeList = template.nodeList
        //获取移动中的鼠标点位
        const cursorLocation = client2canvas(e)

        //如果是普通的移动,则不断更新鼠标样式,
        //如果是点击过后的移动则固定样式
        //鼠标松开后会清楚鼠标落下位置信息

        const movingWithoutMousedown = mousedownLocationRef.current === null

        if (movingWithoutMousedown) {
          canvasRef.current.style.cursor = 'default'
          for (const node of nodeList) {
            //在未激活的边界框中时
            if (cursorInPath(cursorLocation, computePathByEdgeOffset(node.structure.contentBox.path, BOXPADDING))) {
              switch (node.type) {
                case NodeType.TEXT:
                  canvasRef.current.style.cursor = 'text'
                  break
                case NodeType.TABLE:
                case NodeType.PICTURE:
                case NodeType.POLYGON:
                  canvasRef.current.style.cursor = 'move'
                  break
              }
            } else if (
              //只有在节点激活的时候才显示移动和缩放
              cursorInResizeBlock(cursorLocation, node.structure.contentBox.path) &&
              node.isActive
            ) {
              const direction = getResizeDirection(cursorLocation, node.structure.contentBox.path)
              switch (direction) {
                case ResizeDirection.VERTICAL_N:
                case ResizeDirection.VERTICAL_S:
                  canvasRef.current.style.cursor = 'ns-resize'
                  break
                case ResizeDirection.HORIZONTAL_E:
                case ResizeDirection.HORIZONTAL_W:
                  canvasRef.current.style.cursor = 'ew-resize'
                  break
                case ResizeDirection.SLASH_NE:
                case ResizeDirection.SLASH_SW:
                  canvasRef.current.style.cursor = 'nesw-resize'
                  break
                case ResizeDirection.BACKSLASH_NW:
                case ResizeDirection.BACKSLASH_SE:
                  canvasRef.current.style.cursor = 'nwse-resize'
                  break
                default:
                  canvasRef.current.style.cursor = 'move'
              }
            } else if (
              //只有在节点激活的时候才显示移动和缩放
              cursorOnBoundingEdge(cursorLocation, node.structure.contentBox.path) &&
              node.isActive
            ) {
              canvasRef.current.style.cursor = 'move'
            }
          }
        } else {
          const activeNodes = getActiveNodes(template)
          switch (mouseOperationRef.current) {
            case CanvasNodeMouseEventOperation.ISMOVING:
              if (lastMousemoveLocationRef.current) {
                const moveVec: Vector = {
                  x: cursorLocation.x - lastMousemoveLocationRef.current.x,
                  y: cursorLocation.y - lastMousemoveLocationRef.current.y,
                  w: 0,
                }
                dispatch(
                  updateNodeStructure({
                    templateId: template.templateId,
                    instanceIds: activeNodes.map((node) => node.instanceId),
                    structures: activeNodes.map((node) => {
                      let { location, path } = node.structure.contentBox
                      const { size } = node.structure.contentBox
                      location = {
                        w: 1,
                        x: location.x + moveVec.x,
                        y: location.y + moveVec.y,
                      }
                      path = convertLocation2Path(location, size)
                      return {
                        ...node.structure,
                        contentBox: {
                          location,
                          size,
                          path,
                        },
                      }
                    }),
                  }),
                )
                lastMousemoveLocationRef.current = cursorLocation
              }
              break
            case CanvasNodeMouseEventOperation.ISRESIZING:
              if (lastMousemoveLocationRef.current && metaNodeRef.current && mousedownLocationRef.current) {
                //计算每个元素的左上角坐标偏移和尺寸偏移
                const { locationOffset, sizeOffset } = computeLocAndSizeOffsetOnResizing({
                  cursorLocation,
                  lastMousemoveLocation: lastMousemoveLocationRef.current,
                  mousedownLocation: mousedownLocationRef.current,
                  path: metaNodeRef.current.structure.contentBox.path,
                })
                const activeTextNode = getActiveNodes(template).filter((node) => node.type === NodeType.TEXT)
                const activeTextNodeIds = activeNodes.map((node) => node.instanceId)
                //如果发生了高度的偏移，则取消所有激活的文本节点的高度适应
                if (sizeOffset.y != 0) {
                  dispatch(
                    updateTextNodeHeightAdoptive({
                      templateId: template.templateId,
                      instanceIds: activeTextNodeIds,
                      isAdoptive: false,
                    }),
                  )
                } else if (
                  sizeOffset.y === 0 &&
                  activeTextNode.some(
                    (node) =>
                      !(node.options as RenderTextOptions).isAdoptiveHeight &&
                      node.structure.contentBox.size.height >
                        (node.options as RenderTextOptions).contentBox.size.height,
                  )
                ) {
                  //如果高度没有偏移,但是不是自适应高度的情况下，文本区域还比节点区域小了，那么可以开启适应高度
                  //文本区域比节点区域大了就无所谓
                  // dispatch(
                  //   updateTextNodeHeightAdoptive({
                  //     templateId: template.templateId,
                  //     instanceIds: activeTextNode
                  //       .filter(
                  //         (node) =>
                  //           !(node.options as RenderTextOptions).isAdoptiveHeight &&
                  //           node.structure.contentBox.size.height >
                  //             (node.options as RenderTextOptions).contentBox.size.height,
                  //       )
                  //       .map((node) => node.instanceId),
                  //   }),
                  // )
                }

                //更新尺寸信息
                dispatch(
                  updateNodeStructure({
                    templateId: template.templateId,
                    instanceIds: activeNodes.map((node) => node.instanceId),
                    structures: activeNodes.map((node) => {
                      let { location, size, path } = node.structure.contentBox
                      location = {
                        w: 1,
                        x: location.x + locationOffset.x,
                        y: location.y + locationOffset.y,
                      }
                      //坐标会一直变，但是尺寸会有最小值，所以在尺寸最小值后会出现位移现象
                      size = {
                        width: Math.max(size.width + sizeOffset.x, node.options.minContentWidth, 5),
                        height: Math.max(size.height + sizeOffset.y, 5),
                      }
                      path = convertLocation2Path(location, size)
                      return {
                        ...node.structure,
                        contentBox: {
                          location,
                          size,
                          path,
                        },
                      }
                    }),
                  }),
                )
                lastMousemoveLocationRef.current = cursorLocation
              }
              break
            case CanvasNodeMouseEventOperation.ISSELECTING:
              //加入一个临时的空节点，并不断修改，空节点只有盒模型没有内容和装填数据

              //遍历判断所有节点是否和空节点盒模型相交（参考blender的框选工具）小票内容区域小，类似ppt要全部选中不好操作

              //将选中节点激活
              break
            case CanvasNodeMouseEventOperation.ISSELECTION:
              //鼠标落下时就已经将光标数据修改至对应character后
              if (lastMousemoveLocationRef.current && metaNodeRef.current && mousedownCursorIndexRef.current! >= 0) {
                //将鼠标坐标约束在文本框内
                //光标相对于节点框的位置
                const curRelativeTCLocation: Point = getRelativeLocBounding(cursorLocation, metaNodeRef.current)
                const moveVec: Vector = {
                  x: cursorLocation.x - lastMousemoveLocationRef.current.x,
                  y: cursorLocation.y - lastMousemoveLocationRef.current.y,
                  w: 0,
                }
                const moveLength = computeMagnitude(moveVec)
                if (moveLength < 10) {
                  return
                }
                const cursorIndex = getCursorLocation(metaNodeRef.current, curRelativeTCLocation)
                dispatch(
                  updateNodeActivation({
                    templateId: template.templateId,
                    toActiveNodesId: [metaNodeRef.current.instanceId],
                  }),
                )
                const selection = [
                  Math.min(mousedownCursorIndexRef.current!, cursorIndex),
                  Math.max(mousedownCursorIndexRef.current!, cursorIndex),
                ].join('-') as Selection
                dispatch(
                  updateTextNodeSelection({
                    templateId: template.templateId,
                    instanceId: metaNodeRef.current?.instanceId,
                    selection,
                  }),
                )
                metaNodeRef.current = {
                  ...metaNodeRef.current,
                  options: {
                    ...metaNodeRef.current.options,
                    selection,
                  } as RenderTextOptions,
                }
              }

              break
            case CanvasNodeMouseEventOperation.NONE:
          }
        }
      }
    }, MOUSEMOVEPERIOD),
    [
      template,
      canvasRef.current,
      mouseOperationRef.current,
      mousedownLocationRef.current,
      lastMousemoveLocationRef.current,
      metaNodeRef.current,
      mousedownCursorIndexRef.current,
    ],
  )

  // 鼠标松开事件处理
  const handleCanvasMouseUp = useCallback(
    (e: MouseEvent) => {
      const cursorLocation = client2canvas(e)
      if (mousedownLocationRef.current) {
        if (isSameLocation(cursorLocation, mousedownLocationRef.current)) {
          mouseOperationRef.current = CanvasNodeMouseEventOperation.CLICK
        } else {
          mouseOperationRef.current = CanvasNodeMouseEventOperation.NONE
        }
      }
      //将坐标恢复
      // mousedownLocationRef.current = null
      lastMousemoveLocationRef.current = null

      if (metaNodeRef.current?.type == NodeType.TEXT) {
        //将输入框状态和文本节点同步(setSelectionRange:要求元素聚焦且限制类型)
        canvasProxy.current?.focus()
      }

      mouseupLocationRef.current = cursorLocation
    },
    [
      template,
      mouseOperationRef.current,
      mousedownLocationRef.current,
      lastMousemoveLocationRef.current,
      metaNodeRef.current,
    ],
  )

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
  }, [])

  const onDrop = useCallback(
    (e: DragEvent) => {
      if (e.dataTransfer && template) {
        const cursorLocation = client2canvas(e)
        const node = JSON.parse(e.dataTransfer?.getData('application/json:node')) as CanvasNode
        //TODO:文字节点可根据文字内容自适应内容框
        switch (node.type) {
          case NodeType.TEXT:
            node.structure = {
              contentBox: {
                location: cursorLocation,
              } as Box,
            }
            canvasProxy.current?.focus()
        }

        node.layer = template.nodeList.length + 1
        const data = e.dataTransfer.getData('text/plain:name')
        metaNodeRef.current = node
        mousedownLocationRef.current = cursorLocation
        dispatch(
          patchTemplateNodeList({
            templateId: template.templateId,
            node,
            templateDataItem: data,
          }),
        )
        dispatch(
          updateNodeActivation({
            templateId: template.templateId,
            toActiveNodesId: [node.instanceId],
          }),
        )
      }
    },
    [template],
  )
  //输入法拦截合成输入后完成合成事件会同时触发两相同事件
  const inputWithouFocus = useCallback(
    throttle((e: Event) => {
      const { isComposing, inputCache } = (e as CustomEvent).detail

      if (template && metaNodeRef.current && mousedownLocationRef.current && mouseupLocationRef.current) {
        const activeNodes = getActiveNodes(template)

        if (activeNodes.length == 1 && activeNodes[0].type == NodeType.TEXT) {
          const activeNode = activeNodes[0]

          const options = structuredClone(activeNode.options) as RenderTextOptions
          const templateData = structuredClone(template.templateData)
          //初始选择的selection（一段或光标位置）和后续输入中的selection(光标位置)
          const oldSelection = selectionManage.parseSelection(
            (metaNodeRef.current.options as RenderTextOptions).selection,
          )
          //拼接字符串,修改所有的selection
          let composeData = templateData[activeNode.propName] as string
          const inputCacheLength = (inputCache as string).length
          const deleteLength = oldSelection.endIndex - oldSelection.startIndex
          //如果是合成事件（被输入法拦截了，每次的cache是这次输入的缓存）
          //如果是合成事件那么selection不能改成光标位置而是开始位置到开始位置加合成长度
          let newSelection = oldSelection
          if (isComposing) {
            newSelection = selectionManage.offsetSelection(oldSelection, [0, inputCacheLength - deleteLength])
          } else {
            newSelection = selectionManage.offsetSelection(oldSelection, [
              inputCacheLength,
              inputCacheLength - deleteLength,
            ])
          }
          console.log('原始装填数据', composeData)
          console.log(
            inputCache,
            inputCacheLength,
            composeData.slice(0, oldSelection.startIndex),
            inputCache,
            composeData.slice(oldSelection.endIndex),
          )
          //组装新的装填数据
          composeData =
            composeData.slice(0, oldSelection.startIndex) + inputCache + composeData.slice(oldSelection.endIndex)
          console.log('newSelection', newSelection)
          console.log('oldSelection', oldSelection)
          console.log('composeData', composeData)

          const mousedownPIndex = getCursorPIndex(
            activeNode,
            getRelativeLocBounding(mousedownLocationRef.current, metaNodeRef.current),
          )
          const mouseupPIndex = getCursorPIndex(
            activeNode,
            getRelativeLocBounding(mouseupLocationRef.current, metaNodeRef.current),
          )

          //删去选中区间
          const pSelectionMap: { [sel: Selection]: Selection[] } = {}
          const rSelectionMap: { [sel: Selection]: Selection[] } = {}
          let pCombinedSet: Selection[] = []

          for (const pSelection of options.paragrahsIndex.values()) {
            const psObj = selectionManage.parseSelection(pSelection)
            if (selectionManage.isOverlap(psObj, oldSelection)) {
              const differenceSelections = selectionManage.difference(psObj, oldSelection) || [
                {
                  startIndex: Infinity,
                  endIndex: Infinity,
                } as SelectionObj,
              ]

              pSelectionMap[pSelection] = differenceSelections.map((differenceSelection) =>
                selectionManage.stringifySelection(differenceSelection),
              )
            } else {
              pSelectionMap[pSelection] = [pSelection]
            }
            if (
              options.paragrahs[pSelection].paragrahIndex === mousedownPIndex ||
              options.paragrahs[pSelection].paragrahIndex === mouseupPIndex
            ) {
              pCombinedSet.push(pSelection)
            }
          }
          for (const rSelection of options.rowsIndex) {
            const rsObj = selectionManage.parseSelection(rSelection)
            if (selectionManage.isOverlap(rsObj, oldSelection)) {
              const differenceSelections = selectionManage.difference(rsObj, oldSelection) || [
                {
                  startIndex: Infinity,
                  endIndex: Infinity,
                } as SelectionObj,
              ]
              rSelectionMap[rSelection] = differenceSelections.map((differenceSelection) =>
                selectionManage.stringifySelection(differenceSelection),
              )
            } else {
              rSelectionMap[rSelection] = [rSelection]
            }
          }

          //只有跨段落才会发生合并（无论是外切还是相交）
          if (mousedownPIndex === mouseupPIndex) {
            pCombinedSet = []
          }
          //删除所有内容
          if (
            Object.keys(rSelectionMap).every(
              (p) => rSelectionMap[p as Selection][0] === (`${Infinity}-${Infinity}` as Selection),
            )
          ) {
            pSelectionMap[options.paragrahsIndex[0]] = ['0-0']
            rSelectionMap[options.rowsIndex[0]] = ['0-0']
          }
          //将输入序列加入
          for (const [i, pSelection] of options.paragrahsIndex.entries()) {
            const pSelObj = selectionManage.parseSelection(pSelection)
            pSelectionMap[pSelection] = [
              selectionManage.stringifySelection(
                selectionManage.merge(...pSelectionMap[pSelection].map((s) => selectionManage.parseSelection(s))),
              ),
            ]
            if (pSelObj.endIndex >= oldSelection.startIndex) {
              let offset = [0, inputCacheLength]
              if (selectionManage.isExterior(pSelObj, oldSelection) && pSelObj.startIndex === oldSelection.endIndex) {
                offset = [
                  oldSelection.startIndex === 0 ? -deleteLength : inputCacheLength - deleteLength,
                  inputCacheLength - deleteLength,
                ]
              } else if (
                selectionManage.isOverlap(pSelObj, oldSelection) &&
                !selectionManage.isContained(pSelObj, oldSelection) &&
                pSelObj.endIndex > oldSelection.endIndex &&
                oldSelection.startIndex <= pSelObj.startIndex
              ) {
                offset = [
                  oldSelection.startIndex === 0 ? -deleteLength : inputCacheLength - deleteLength,
                  inputCacheLength - deleteLength,
                ]
              } else if (pSelObj.startIndex > oldSelection.endIndex) {
                offset = [inputCacheLength - deleteLength, inputCacheLength - deleteLength]
              }
              pSelectionMap[pSelection] = [
                selectionManage.stringifySelection(
                  selectionManage.offsetSelection(selectionManage.parseSelection(pSelectionMap[pSelection][0]), offset),
                ),
              ]
            }
            options.paragrahsIndex[i] = pSelectionMap[pSelection][0]
          }

          for (const [i, rSelection] of options.rowsIndex.entries()) {
            const rSelObj = selectionManage.parseSelection(rSelection)
            rSelectionMap[rSelection] = [
              selectionManage.stringifySelection(
                selectionManage.merge(...rSelectionMap[rSelection].map((s) => selectionManage.parseSelection(s))),
              ),
            ]

            if (rSelObj.endIndex >= oldSelection.startIndex) {
              let offset = [0, inputCacheLength]
              if (selectionManage.isExterior(rSelObj, oldSelection) && rSelObj.startIndex === oldSelection.endIndex) {
                offset = [
                  oldSelection.startIndex === 0 ? -deleteLength : inputCacheLength - deleteLength,
                  inputCacheLength - deleteLength,
                ]
              } else if (
                selectionManage.isOverlap(rSelObj, oldSelection) &&
                !selectionManage.isContained(rSelObj, oldSelection) &&
                rSelObj.endIndex > oldSelection.endIndex &&
                oldSelection.startIndex <= rSelObj.startIndex
              ) {
                offset = [
                  oldSelection.startIndex === 0 ? -deleteLength : inputCacheLength - deleteLength,
                  inputCacheLength - deleteLength,
                ]
              } else if (rSelObj.startIndex > oldSelection.endIndex) {
                offset = [inputCacheLength - deleteLength, inputCacheLength - deleteLength]
              }
              rSelectionMap[rSelection] = [
                selectionManage.stringifySelection(
                  selectionManage.offsetSelection(selectionManage.parseSelection(rSelectionMap[rSelection][0]), offset),
                ),
              ]
            }
            options.rowsIndex[i] = rSelectionMap[rSelection][0]
          }

          options.paragrahsIndex = options.paragrahsIndex.filter((p) => p != (`${Infinity}-${Infinity}` as Selection))
          options.rowsIndex = options.rowsIndex.filter((r) => r != (`${Infinity}-${Infinity}` as Selection))

          //重新赋值段落序列
          for (const [pSelection, pOptions] of Object.entries(options.paragrahs)) {
            if (
              pSelectionMap[pSelection as Selection][0] != (`${Infinity}-${Infinity}` as Selection) &&
              !pCombinedSet.includes(pSelection as Selection)
            ) {
              options.paragrahs[pSelectionMap[pSelection as Selection][0] as Selection] = {
                ...pOptions,
                paragrahIndex: options.paragrahsIndex.findIndex((p) => p === pSelectionMap[pSelection as Selection][0]),
              }
            } else if (pCombinedSet.findIndex((p) => p === pSelection) === 1) {
              const curOption = pOptions
              const lastOption = options.paragrahs[pCombinedSet[0] as Selection]

              options.paragrahs[
                selectionManage.stringifySelection(
                  selectionManage.merge(
                    ...pCombinedSet.map((p) => pSelectionMap[p][0]).map((p) => selectionManage.parseSelection(p)),
                  ),
                )
              ] = {
                ...lastOption,
                rows: {
                  ...lastOption.rows,
                  ...curOption.rows,
                },
              }
            }
          }
          Object.keys(pSelectionMap).forEach((p) => {
            if (
              !selectionManage.isSameSelection(
                selectionManage.parseSelection(p as Selection),
                selectionManage.parseSelection(pSelectionMap[p as Selection][0]),
              )
            ) {
              delete options.paragrahs[p as Selection]
            }
          })
          //更新行号
          for (const pOptions of Object.values(options.paragrahs)) {
            for (const [rSelection, rOptions] of Object.entries(pOptions.rows)) {
              delete pOptions.rows[rSelection as Selection]
              if (rSelectionMap[rSelection as Selection][0] != (`${Infinity}-${Infinity}` as Selection)) {
                pOptions.rows[rSelectionMap[rSelection as Selection][0]] = {
                  ...rOptions,
                  rowIndex: options.rowsIndex
                    .filter((r) => r != (`${Infinity}-${Infinity}` as Selection))
                    .findIndex((r) => r === rSelectionMap[rSelection as Selection][0]),
                }
              }
            }
          }

          //更新字体区间
          font: for (const pOptions of Object.values(options.paragrahs)) {
            for (const rOptions of Object.values(pOptions.rows)) {
              for (const [fSelection, fOptions] of Object.entries(rOptions.font)) {
                const fSeObj = selectionManage.parseSelection(fSelection as Selection)
                if (
                  options.paragrahsIndex[0] === '0-1' &&
                  options.paragrahsIndex.slice(1).every((s) => s === (`${Infinity}-${Infinity}` as Selection))
                ) {
                  options.paragrahs['0-1'].rows['0-1'].font = {
                    '0-1': fOptions,
                  }
                  break font
                }
                if (fSeObj.endIndex >= oldSelection.startIndex) {
                  delete rOptions.font[fSelection as Selection]
                  if (selectionManage.isExterior(fSeObj, oldSelection)) {
                    let newSelection: Selection
                    //前面没有值了，将新增的字体合并到后面
                    if (oldSelection.startIndex === 0) {
                      newSelection = selectionManage.stringifySelection(
                        selectionManage.offsetSelection(fSeObj, [-fSeObj.startIndex, inputCacheLength - deleteLength]),
                      )
                    }
                    //前面还有值，当前区间位于区间左侧，将新增字体加入到此区间
                    else if (fSeObj.endIndex === oldSelection.startIndex) {
                      newSelection = selectionManage.stringifySelection(
                        selectionManage.offsetSelection(fSeObj, [0, inputCacheLength]),
                      )
                    }
                    //前面还有值，当前区间位于区间右侧，将区间平行左移
                    else {
                      newSelection = selectionManage.stringifySelection(
                        selectionManage.offsetSelection(fSeObj, [
                          inputCacheLength - deleteLength,
                          inputCacheLength - deleteLength,
                        ]),
                      )
                    }
                    rOptions.font[newSelection] = fOptions
                  } else if (
                    selectionManage.isOverlap(fSeObj, oldSelection) &&
                    !selectionManage.isContained(fSeObj, oldSelection) &&
                    !selectionManage.isContained(oldSelection, fSeObj)
                  ) {
                    let newSelection: Selection
                    const fDiffSelection = selectionManage.difference(fSeObj, oldSelection)!
                    if (fSeObj.startIndex < oldSelection.startIndex) {
                      newSelection = selectionManage.stringifySelection(
                        selectionManage.offsetSelection(fDiffSelection[0], [0, inputCacheLength]),
                      )
                    } else {
                      if (oldSelection.startIndex === 0) {
                        newSelection = selectionManage.stringifySelection(
                          selectionManage.offsetSelection(fDiffSelection[0], [
                            -fDiffSelection[0].startIndex,
                            inputCacheLength - deleteLength,
                          ]),
                        )
                      } else {
                        newSelection = selectionManage.stringifySelection(
                          selectionManage.offsetSelection(fDiffSelection[0], [
                            inputCacheLength - deleteLength,
                            inputCacheLength - deleteLength,
                          ]),
                        )
                      }
                    }
                    rOptions.font[newSelection] = fOptions
                  } else if (
                    selectionManage.isInterior(oldSelection, fSeObj) &&
                    oldSelection.startIndex === fSeObj.startIndex
                  ) {
                    let newSelection: Selection
                    if (oldSelection.startIndex === 0) {
                      newSelection = selectionManage.stringifySelection(
                        selectionManage.offsetSelection(fSeObj, [-fSeObj.startIndex, inputCacheLength - deleteLength]),
                      )
                    } else {
                      newSelection = selectionManage.stringifySelection(
                        selectionManage.offsetSelection(fSeObj, [
                          inputCacheLength - deleteLength,
                          inputCacheLength - deleteLength,
                        ]),
                      )
                    }
                    rOptions.font[newSelection] = fOptions
                  } else if (
                    selectionManage.isContained(oldSelection, fSeObj) &&
                    !selectionManage.isSameSelection(oldSelection, fSeObj)
                  ) {
                    const fDiffSelection = selectionManage.merge(...selectionManage.difference(fSeObj, oldSelection)!)
                    const newSelection = selectionManage.stringifySelection(
                      selectionManage.offsetSelection(fDiffSelection, [0, inputCacheLength]),
                    )
                    rOptions.font[newSelection] = fOptions
                  } else if (selectionManage.isSameSelection(oldSelection, fSeObj)) {
                    const newSelection = selectionManage.stringifySelection(
                      selectionManage.offsetSelection(oldSelection, [0, inputCacheLength - deleteLength]),
                    )
                    rOptions.font[newSelection] = fOptions
                  } else if (fSeObj.startIndex > oldSelection.endIndex) {
                    const newSelection = selectionManage.stringifySelection(
                      selectionManage.offsetSelection(fSeObj, [
                        inputCacheLength - deleteLength,
                        inputCacheLength - deleteLength,
                      ]),
                    )
                    rOptions.font[newSelection] = fOptions
                  }
                }
              }
            }
          }
          // console.log(pSelectionMap, rSelectionMap)
          // console.log(options.paragrahsIndex, options.rowsIndex)
          // console.log(options.paragrahs)

          metaNodeRef.current = {
            ...metaNodeRef.current,
            options: {
              ...options,
              selection: selectionManage.stringifySelection(newSelection),
            } as RenderTextOptions,
          }
          dispatch(
            updateTemplateData({
              templateId: template.templateId,
              propName: activeNode.propName,
              propData: composeData,
            }),
          )
          //更新node
          dispatch(
            updateNodeOptions({
              templateId: template.templateId,
              instanceId: activeNode.instanceId,
              options: {
                ...options,
                selection: selectionManage.stringifySelection(newSelection),
              },
            }),
          )
        }
      }
    }, 100),

    [template, metaNodeRef.current, mousedownLocationRef.current, mouseupLocationRef.current],
  )

  const focusProxy = useCallback(
    (e: MouseEvent) => {
      if (canvasProxy.current && canvasRef.current && template) {
        if (e.target != canvasRef.current) {
          canvasProxy.current.blur()
          dispatch(
            updateNodeActivation({
              templateId: template.templateId,
              toActiveNodesId: [],
            }),
          )
        }
      }
    },
    [canvasProxy.current, canvasRef.current, template],
  )

  /**
   * 根据文本节点样式计算文本盒的尺寸和位置
   * @param {RenderTextOptions} options  文本节点样式
   * @param {TemplateData[keyof TemplateData]} content:节点的装填信息
   */
  const computeMulTextSize = useCallback(
    (options: RenderTextOptions, content: TemplateData[keyof TemplateData]) => {
      const { paragrahs, Leading, rowsIndex, paragrahsIndex } = options
      const heightPerParagrah: number[] = Array.from({ length: paragrahsIndex.length }, () => 0)
      const widthPerParagrah: number[] = Array.from({ length: paragrahsIndex.length }, () => 0)
      const heightPerRow: number[] = Array.from({ length: rowsIndex.length }, () => 0) //每一行的最大字体高度
      const widthPerRow: number[] = Array.from({ length: rowsIndex.length }, () => 0) //每一行的宽度
      let maxCharacterWidth = -Infinity
      if (canvasContextRef.current) {
        for (const { rows, paragrahIndex, contentBox, preGap, postGap } of Object.values(paragrahs)) {
          for (const { font, rowIndex, contentBox } of Object.values(rows)) {
            for (const [subRange, fontOptions] of Object.entries(font)) {
              //计算每行的高度，由最大的字高决定（1.2为默认在行框上下有10%行高大小的间隔，不可变）

              heightPerRow[rowIndex] = Math.max(heightPerRow[rowIndex], fontOptions.fontSize * Leading * 1.2)

              const [startIndex, endIndex] = subRange.split('-').map((item) => parseInt(item))
              const length = endIndex - startIndex
              //获取单个文字
              const character = content.toString().slice(startIndex, startIndex + 1)
              //获取单个文字宽度
              canvasContextRef.current.font = `${fontOptions.fontSize}px ${fontOptions.fontFamily} ${fontOptions.italicly ? 'italic' : 'normal'} ${fontOptions.fontWeight}`
              const { actualBoundingBoxRight: right, actualBoundingBoxLeft: left } =
                canvasContextRef.current.measureText(character)
              /**
               * 更新字符宽度
               */
              const characterWidth = right + left
              fontOptions.characterWidth = characterWidth
              widthPerRow[rowIndex] += characterWidth * length
              maxCharacterWidth = Math.max(maxCharacterWidth, characterWidth)
            }

            contentBox.size.width = widthPerRow[rowIndex]
            contentBox.size.height = heightPerRow[rowIndex]
            widthPerParagrah[paragrahIndex] = Math.max(widthPerParagrah[paragrahIndex], widthPerRow[rowIndex])
            heightPerParagrah[paragrahIndex] += heightPerRow[rowIndex]
          }
          contentBox.size.width = widthPerParagrah[paragrahIndex]
          contentBox.size.height = heightPerParagrah[paragrahIndex] + preGap + postGap
        }
      }
      options.minContentWidth = maxCharacterWidth
      return {
        heightPerRow,
        widthPerRow,
        heightPerParagrah,
        widthPerParagrah,
      }
    },
    [canvasContextRef.current],
  )

  /**
   * 调整文本节点
   */
  const adjustTextNode = useCallback((node: CanvasNode, content: TemplateData[keyof TemplateData]) => {
    const options = node.options as RenderTextOptions

    //拖拽时(只有在这里才会赋值节点尺寸，其他时候都是修改内容尺寸)
    if (node.structure.contentBox.size == null) {
      //计算尺寸
      const { heightPerParagrah, widthPerParagrah } = computeMulTextSize(options, content)
      //更新文本内容的总宽高
      options.contentBox.size.height = heightPerParagrah.reduce((pre, cur) => pre + cur)
      options.contentBox.size.width = Math.max(...widthPerParagrah)
      node.structure.contentBox.size = {
        ...options.contentBox.size,
      }
      node.structure.contentBox.path = convertLocation2Path(node.structure.contentBox.location, options.contentBox.size)
    } else {
      //调整行如果节点宽度变化
      //节点盒宽度***没有上限***，文本框的宽度的上限是最长段落的宽度（最长段落：段落排列成一行的宽度）
      //节点盒宽度***有下限***，不能小于最大字符的宽度
      //当节点盒宽度变化时，文本框要跟着变化
      // 行索引调整为段落索引
      options.rowsIndex = structuredClone(options.paragrahsIndex)
      options.selectionBoxes = []
      options.minContentWidth = Infinity

      //将所有段落合并成一行
      for (const [pSelection, pOptions] of Object.entries(options.paragrahs)) {
        let fRange: Range<FontOptions> | undefined
        for (const rOptions of Object.values(pOptions.rows)) {
          fRange = fRange ? mergeRange(fRange, rOptions.font) : rOptions.font
        }
        options.paragrahs[pSelection as Selection] = {
          contentBox: {
            size: { width: 0, height: 0 },
            location: { x: 0, y: 0, w: 1 },
          },
          preGap: 0,
          postGap: 0,
          paragrahIndex: pOptions.paragrahIndex,
          rows: {
            [pSelection]: {
              font: fRange,
              contentBox: {
                size: { width: 0, height: 0 },
                location: { x: 0, y: 0, w: 1 },
              },
              rowIndex: pOptions.paragrahIndex,
            } as RowOptions,
          },
        }
      }

      //计算所有段落变成一行的尺寸
      const { heightPerParagrah, widthPerParagrah } = computeMulTextSize(options, content)
      options.contentBox.size.height = heightPerParagrah.reduce((pre, cur) => pre + cur)
      options.contentBox.size.width = Math.max(...widthPerParagrah)

      while (options.contentBox.size.width > node.structure.contentBox.size.width) {
        let accRowOffset = 0
        let curMaxRowIndex = 0

        for (const paragrahOptions of Object.values(options.paragrahs)) {
          let lastOverflowFontRange: Range<FontOptions> = {}
          for (const [rSelection, rowOptions] of Object.entries(paragrahOptions.rows)) {
            rowOptions.rowIndex += accRowOffset
            curMaxRowIndex = rowOptions.rowIndex
            //合并区间
            if (Object.keys(lastOverflowFontRange).length != 0) {
              rowOptions.font = mergeRange(lastOverflowFontRange, rowOptions.font)
              //合并后清空
              lastOverflowFontRange = {}
            }

            //合并涉及行索引的改动，这里要拿到最新的行索引
            const newRowSelection = toSortedSelection(Object.keys(rowOptions.font) as Selection[])
            const [startIndex, endIndex] = [
              selectionStr2Arr(newRowSelection[0] as Selection)[0],
              selectionStr2Arr(newRowSelection[newRowSelection.length - 1] as Selection)[1],
            ]

            let walkedWidth = 0
            let breakPoint = endIndex
            const breakSelctions = []
            //计算当前行的越界点(越界点取不到)
            for (const [subSelection, fontOptions] of Object.entries(rowOptions.font)) {
              const [startIndex, endIndex] = selectionStr2Arr(subSelection as Selection)
              for (let i = startIndex; i < endIndex; i++) {
                const characterWidth = fontOptions.characterWidth
                if (node.structure.contentBox.size.width - walkedWidth < characterWidth) {
                  breakPoint = Math.min(i, breakPoint)
                  breakSelctions.push(subSelection)
                  break
                } else {
                  walkedWidth += characterWidth
                }
              }
            }

            //当前行发生越界，分离range,保存越界的range
            if (breakPoint < endIndex) {
              const breakingSelection = breakSelctions.shift() as Selection
              const breakingFontOptions = rowOptions.font[breakingSelection] as FontOptions
              //删除正在发生越界的range
              delete rowOptions.font[breakingSelection]
              //构建留下的和脱离的range
              if (selectionStr2Arr(breakingSelection)[0] < breakPoint) {
                const remainSelection = [selectionStr2Arr(breakingSelection)[0], breakPoint].join('-') as Selection
                rowOptions.font[remainSelection] = breakingFontOptions
              }
              const detachSelection = [breakPoint, selectionStr2Arr(breakingSelection)[1]].join('-') as Selection
              lastOverflowFontRange[detachSelection] = breakingFontOptions

              //删除发生越界的range
              for (const fontSelection of breakSelctions) {
                lastOverflowFontRange[fontSelection as Selection] = rowOptions.font[fontSelection as Selection]
                delete rowOptions.font[fontSelection as Selection]
              }
            }

            //无论是否越界，将该行重新加入，并更新node下行索引
            delete paragrahOptions.rows[rSelection as Selection]
            const newSelection = [startIndex, breakPoint].join('-') as Selection
            paragrahOptions.rows[newSelection] = rowOptions
            options.rowsIndex[rowOptions.rowIndex] = newSelection
          }

          //如果当前段落遍历完后，仍有超出的，则新增一行，累计行偏移加1，后续的段落都+行偏移
          //使用这种方式在resize时，可能会出现多次调整的情况，可能宽度被设置成很小，需要换行很多次
          const lastOverflowFontRangeKeys = Object.keys(lastOverflowFontRange) as Selection[]
          if (lastOverflowFontRangeKeys.length != 0) {
            accRowOffset++
            let [startIndex, endIndex] = [Infinity, -Infinity]
            //求新行的索引
            for (const selection of lastOverflowFontRangeKeys) {
              startIndex = Math.min(selectionStr2Arr(selection)[0], startIndex)
              endIndex = Math.max(selectionStr2Arr(selection)[1], endIndex)
            }
            const newSelection = [startIndex, endIndex].join('-') as Selection
            paragrahOptions.rows[newSelection] = {
              font: lastOverflowFontRange,
              contentBox: { size: { width: 0, height: 0 }, location: { x: 0, y: 0, w: 1 } },
              rowIndex: curMaxRowIndex + 1,
            }
            options.rowsIndex.splice(curMaxRowIndex + 1, 0, newSelection)
          }
          lastOverflowFontRange = {}
        }

        const { heightPerParagrah, widthPerParagrah } = computeMulTextSize(options, content)
        options.contentBox.size.height = heightPerParagrah.reduce((pre, cur) => pre + cur)
        options.contentBox.size.width = Math.max(...widthPerParagrah)
        if (options.isAdoptiveHeight) {
          node.structure.contentBox.size.height = options.contentBox.size.height
        }
      }
      const { heightPerParagrah: h, widthPerParagrah: w } = computeMulTextSize(options, content)
      options.contentBox.size.height = h.reduce((pre, cur) => pre + cur)
      options.contentBox.size.width = Math.max(...w)
      if (options.isAdoptiveHeight) {
        node.structure.contentBox.size.height = options.contentBox.size.height
      }
    }

    /** ------------------------------------------------------------------------
         *              文本位置的计算（根据节点尺寸，对齐方式）
         --------------------------------------------------------------------------*/
    //根据对齐方式计算文本内容的起点:相对节点内容盒的偏移
    const contentSize = node.structure.contentBox.size
    const alignment = options.align
    //水平/垂直坐标(相对于父盒子的偏移)
    switch (alignment.horizontal) {
      case HorAlign.LEFT:
        options.contentBox.location.x = 0

        for (const paragraphOptions of Object.values(options.paragrahs)) {
          paragraphOptions.contentBox.location.x = 0
          for (const rowOptions of Object.values(paragraphOptions.rows)) {
            rowOptions.contentBox.location.x = 0
          }
        }
        break
      case HorAlign.JUSTIFY:
        //文本框将节点框撑大
        options.contentBox.location.x = 0
        options.contentBox.size.width = contentSize.width
        for (const paragraphOptions of Object.values(options.paragrahs)) {
          paragraphOptions.contentBox.location.x = 0
          paragraphOptions.contentBox.size.width = contentSize.width
          for (const [rowSelection, rowOptions] of Object.entries(paragraphOptions.rows)) {
            const rowContentBox = rowOptions.contentBox
            const [startIndex, endIndex] = selectionStr2Arr(rowSelection as Selection)
            const characterLength = endIndex - startIndex
            const spareWidthPerCharacter = (contentSize.width - rowContentBox.size.width) / characterLength
            for (const fontOptions of Object.values(rowOptions.font)) {
              fontOptions.characterWidth += spareWidthPerCharacter //在这里直接加，每次渲染都需要重新根据option计算字符宽度，不会累计
            }
            rowOptions.contentBox.size.width = contentSize.width
            rowOptions.contentBox.location.x = 0
          }
        }
        break
      case HorAlign.CENTER:
        options.contentBox.location.x = (contentSize.width - options.contentBox.size.width) / 2
        for (const paragrahOptions of Object.values(options.paragrahs)) {
          paragrahOptions.contentBox.location.x =
            (options.contentBox.size.width - paragrahOptions.contentBox.size.width) / 2
          for (const rowOptions of Object.values(paragrahOptions.rows)) {
            rowOptions.contentBox.location.x =
              (paragrahOptions.contentBox.size.width - rowOptions.contentBox.size.width) / 2
          }
        }
        break
      case HorAlign.RIGHT:
        options.contentBox.location.x = contentSize.width - options.contentBox.size.width
        for (const paragrahOptions of Object.values(options.paragrahs)) {
          paragrahOptions.contentBox.location.x = options.contentBox.size.width - paragrahOptions.contentBox.size.width
          for (const rowOptions of Object.values(paragrahOptions.rows)) {
            rowOptions.contentBox.location.x = paragrahOptions.contentBox.size.width - rowOptions.contentBox.size.width
          }
        }
        break
    }
    switch (alignment.vertical) {
      case VerAlign.TOP:
        {
          options.contentBox.location.y = 0
          let accParaHeight = 0
          for (const paragrahOptions of Object.values(options.paragrahs)) {
            paragrahOptions.contentBox.location.y = accParaHeight
            let accRowHeight = 0
            for (const rowOptions of Object.values(paragrahOptions.rows)) {
              rowOptions.contentBox.location.y = accRowHeight
              accRowHeight += rowOptions.contentBox.size.height
            }
            accParaHeight += paragrahOptions.contentBox.size.height
          }
        }
        break
      case VerAlign.MIDDLE:
        {
          options.contentBox.location.y = (contentSize.height - options.contentBox.size.height) / 2
          let accParaHeight = 0
          for (const paragrahOptions of Object.values(options.paragrahs)) {
            paragrahOptions.contentBox.location.y = accParaHeight
            let accRowHeight = 0
            for (const rowOptions of Object.values(paragrahOptions.rows)) {
              rowOptions.contentBox.location.y = accRowHeight
              accRowHeight += rowOptions.contentBox.size.height
            }
            accParaHeight += paragrahOptions.contentBox.size.height
          }
        }
        break
      case VerAlign.BOTTOM:
        {
          options.contentBox.location.y = contentSize.height - options.contentBox.size.height
          let accParaHeight = 0
          for (const paragrahOptions of Object.values(options.paragrahs)) {
            paragrahOptions.contentBox.location.y = accParaHeight
            let accRowHeight = 0
            for (const rowOptions of Object.values(paragrahOptions.rows)) {
              rowOptions.contentBox.location.y = accRowHeight
              accRowHeight += rowOptions.contentBox.size.height
            }
            accParaHeight += paragrahOptions.contentBox.size.height
          }
        }
        break
    }

    /**
     * 文本节点的selection
     */
    const selection = options.selection

    const [startIndex, endIndex] = selectionStr2Arr(selection)
    //根据selection计算selectionBoxs
    const selectionBoxes: Box[] = []

    if (endIndex === startIndex) {
      for (const [pSelection, paragrahOptions] of Object.entries(options.paragrahs)) {
        const pinter = getOverlapSelection(pSelection as Selection, selection)
        const pdiffer = getDifferSelection(pSelection as Selection, selection)
        //如果当前段落存在交集
        if (
          (pinter && selectionStr2Arr(pdiffer[0])[0] === selectionStr2Arr(pSelection as Selection)[0]) ||
          (startIndex == 0 && paragrahOptions.paragrahIndex == 0)
        ) {
          for (const [rSelection, rowOptions] of Object.entries(paragrahOptions.rows)) {
            const rinter = getOverlapSelection(rSelection as Selection, selection)
            const rdiffer = getDifferSelection(rSelection as Selection, selection)
            //如果当前行存在交集
            if (
              (rinter && selectionStr2Arr(rdiffer[0])[0] === selectionStr2Arr(rSelection as Selection)[0]) ||
              (startIndex == 0 && rowOptions.rowIndex == 0)
            ) {
              let walkedWidth = 0
              let interSelectionHeight = rowOptions.contentBox.size.height / options.Leading
              for (const [fSelection, fontOptions] of Object.entries(rowOptions.font)) {
                const differSelection = getDifferSelection(fSelection as Selection, selection)

                if (
                  differSelection[0] &&
                  selectionStr2Arr(differSelection[0])[0] === selectionStr2Arr(fSelection as Selection)[0] &&
                  endIndex > selectionStr2Arr(fSelection as Selection)[0]
                ) {
                  walkedWidth +=
                    (selectionStr2Arr(differSelection[0])[1] - selectionStr2Arr(differSelection[0])[0]) *
                    fontOptions.characterWidth
                  interSelectionHeight = fontOptions.fontSize * 1.2
                }
              }
              //框选框的大小和行框的高度一致，宽度为交集长度和（光标需要一个保底值）
              const interBoxSize: Size = {
                width: 2,
                height: interSelectionHeight,
              }
              const interBoxLocation: Point = {
                x:
                  walkedWidth +
                  node.structure.contentBox.location.x +
                  options.contentBox.location.x +
                  paragrahOptions.contentBox.location.x +
                  rowOptions.contentBox.location.x,
                y:
                  node.structure.contentBox.location.y +
                  options.contentBox.location.y +
                  paragrahOptions.contentBox.location.y +
                  rowOptions.contentBox.location.y +
                  rowOptions.contentBox.size.height -
                  rowOptions.contentBox.size.height / 12 - //减去字体底部响应式空隙
                  interSelectionHeight / 1.2 - // 减去字体高度
                  (interSelectionHeight - interSelectionHeight / 1.2) / 2,
                w: 1,
              }
              const interBoxPath = convertLocation2Path(interBoxLocation, interBoxSize)
              selectionBoxes.push({
                size: interBoxSize,
                location: interBoxLocation,
                path: interBoxPath,
              })
            }
          }
        }
      }
    } else {
      for (const [pSelection, paragrahOptions] of Object.entries(options.paragrahs)) {
        //如果当前段落存在交集
        if (hasOverlap(pSelection as Selection, selection)) {
          for (const [rSelection, rowOptions] of Object.entries(paragrahOptions.rows)) {
            //如果当前行存在交集
            if (hasOverlap(rSelection as Selection, selection)) {
              let walkedWidth = 0
              let interSelectionWidth = 0
              const interSelectionHeight = rowOptions.contentBox.size.height

              for (const [fSelection, fontOptions] of Object.entries(rowOptions.font)) {
                const interSelection = getOverlapSelection(fSelection as Selection, selection) as Selection
                const differSelection = getDifferSelection(fSelection as Selection, selection)

                if (interSelection) {
                  interSelectionWidth +=
                    (selectionStr2Arr(interSelection)[1] - selectionStr2Arr(interSelection)[0]) *
                    fontOptions.characterWidth
                }

                if (
                  differSelection[0] &&
                  selectionStr2Arr(differSelection[0])[0] === selectionStr2Arr(fSelection as Selection)[0] &&
                  endIndex > selectionStr2Arr(fSelection as Selection)[0]
                ) {
                  walkedWidth +=
                    (selectionStr2Arr(differSelection[0])[1] - selectionStr2Arr(differSelection[0])[0]) *
                    fontOptions.characterWidth
                }
              }
              //框选框的大小和行框的高度一致，宽度为交集长度和（光标需要一个保底值）
              const interBoxSize: Size = {
                width: interSelectionWidth,
                height: interSelectionHeight,
              }
              const interBoxLocation: Point = {
                x:
                  walkedWidth +
                  node.structure.contentBox.location.x +
                  options.contentBox.location.x +
                  paragrahOptions.contentBox.location.x +
                  rowOptions.contentBox.location.x,
                y:
                  node.structure.contentBox.location.y +
                  options.contentBox.location.y +
                  paragrahOptions.contentBox.location.y +
                  rowOptions.contentBox.location.y,
                w: 1,
              }
              const interBoxPath = convertLocation2Path(interBoxLocation, interBoxSize)
              selectionBoxes.push({
                size: interBoxSize,
                location: interBoxLocation,
                path: interBoxPath,
              })
            }
          }
        }
      }
    }
    options.selectionBoxes = selectionBoxes
  }, [])

  /**
   * adjustTemplate 调整模板，根据节点信息和样式信息做适应性变化
   */
  const adjustTemplate = useCallback((template: Template) => {
    const adjustedTemplate = structuredClone(template)
    for (const node of adjustedTemplate.nodeList) {
      switch (node.type) {
        case NodeType.TEXT: {
          //空白内容加没激活（双击过后没输入或者已有内容删除完后失活了）
          if (!template.templateData[node.propName] && !node.isActive) {
            //删除节点
            adjustedTemplate.nodeList = adjustedTemplate.nodeList.filter((n) => n != node)
            //加入操作栈

            //不调整当前节点
            continue
          }
          //要调整的条件过多，宽度，对齐方式等
          adjustTextNode(node, template.templateData[node.propName])

          break
        }
        case NodeType.BARCODE: {
          break
        }
        case NodeType.PICTURE: {
          break
        }
        case NodeType.POLYGON: {
          break
        }
        case NodeType.TABLE: {
          break
        }
      }
    }
    return adjustedTemplate
  }, [])

  /**
   *  监听template数据变化并调整
   */
  useEffect(() => {
    if (template) {
      const adjustedTemplate = adjustTemplate(template)
      if (!isEqual(adjustedTemplate, template)) {
        dispatch(updateTemplate(adjustedTemplate))
      } else {
        setAdjustedTemplate(adjustedTemplate)
      }
    }
  }, [template])
  /***
   * 获取画布上下文
   */
  useEffect(() => {
    if (canvasRef.current) {
      canvasContextRef.current = canvasRef.current.getContext('2d')
    }
  }, [canvasRef.current])

  /**
   * 画布事件绑定与解绑
   */
  useEffect(() => {
    if (canvasRef.current) {
      //画布中的鼠标事件（用于节点的选择，缩放，移动，框选；文本的新建）
      canvasRef.current.addEventListener('dblclick', handleCanvasDoubleClick)
      canvasRef.current.addEventListener('click', handleCanvasClick)
      canvasRef.current.addEventListener('mousedown', handleCanvasMouseDown)
      canvasRef.current.addEventListener('mousemove', handleCanvasMouseMove)
      canvasRef.current.addEventListener('mouseup', handleCanvasMouseUp)

      //将组件列表拖拽进入画布并新建对应节点
      canvasRef.current.addEventListener('dragover', onDragOver)
      canvasRef.current.addEventListener('drop', onDrop)

      //文本节点的输入事件
      canvasRef.current.addEventListener('inputWithouFocus', inputWithouFocus)

      //保证点击画布中时，总能聚焦到输入框进行输入
      document.addEventListener('click', focusProxy)
      //清理事件
      return () => {
        if (canvasRef.current) {
          canvasRef.current.removeEventListener('dblclick', handleCanvasDoubleClick)
          canvasRef.current.removeEventListener('click', handleCanvasClick)
          canvasRef.current.removeEventListener('mousedown', handleCanvasMouseDown)
          canvasRef.current.removeEventListener('mousemove', handleCanvasMouseMove)
          canvasRef.current.removeEventListener('mouseup', handleCanvasMouseUp)
          canvasRef.current.removeEventListener('dragover', onDragOver)
          canvasRef.current.removeEventListener('drop', onDrop)
          canvasRef.current.removeEventListener('inputWithouFocus', inputWithouFocus)
          document.removeEventListener('click', focusProxy)
        }
      }
    }
  }, [canvasRef.current, template]) //template也要作为依赖项,不然canvas绑定的事件仍然是老的事件（因为事件依赖template）

  /**
   * 画布初始化样式信息
   */
  useEffect(() => {
    if (canvasRef.current) {
      //设置canvas尺寸信息
      const dpr = window.devicePixelRatio
      canvasRef.current.width = 522
      canvasRef.current.height = 700
      canvasRef.current.style.width = `${canvasRef.current.width * dpr}px`
      canvasRef.current.style.height = `${canvasRef.current.height * dpr}px`
    }
  }, [canvasRef.current])

  /**
   * 代理元素键盘事件
   */
  interface CustomEvent extends Event {
    detail: {
      type: string
      value: string
      inputCache: string | number
      isComposing: boolean
    }
  }
  // const keydownProxy = useCallback(
  //   (e: KeyboardEvent) => {
  //     const validModifierKeys = [
  //       'Tab',
  //       'Control',
  //       'Delete',
  //       'Enter',
  //       'Backspace',
  //       'ArrowDown',
  //       'ArrowLeft',
  //       'ArrowRight',
  //       'ArrowUp',
  //     ]
  //     //阻止焦点切换和其他的事件
  //     if (e.key === 'Tab') {
  //       e.preventDefault()
  //     }
  //     if (canvasProxy.current && validModifierKeys.includes(e.key)) {
  //       const cusInputEnvent = new CustomEvent('inputWithouFocus', {
  //         detail: {
  //           type: e.type,
  //           value: (e.target as HTMLInputElement).value,
  //           inputCache: e.key,
  //           isComposing: e.isComposing,
  //         },
  //       })
  //       console.log('发送1')

  //       canvasRef.current?.dispatchEvent(cusInputEnvent)
  //     }
  //   },
  //   [canvasProxy.current],
  // )
  //
  const inputProxy = useCallback(
    (e: Event) => {
      if (canvasProxy.current && template && canvasRef.current) {
        const activeNodes = getActiveNodes(template).filter((node) => node.type === NodeType.TEXT)
        //只有一个激活节点且是文本
        if (activeNodes.length === 1) {
          const node = activeNodes[0]
          //转发事件
          const cusInputEnvent = new CustomEvent('inputWithouFocus', {
            detail: {
              type: (e as InputEvent).inputType,
              value: (e.target as HTMLInputElement).value,
              inputCache: (e as InputEvent).data,
              isComposing: (e as InputEvent).isComposing,
            },
          })
          canvasRef.current.dispatchEvent(cusInputEnvent)
          //修改代理元素位置(定位到selection末尾)
          //根据selection定位到（不新增ref，增加事件间耦合了）
          const options = node.options as RenderTextOptions
          const endIndex = selectionStr2Arr(options.selection)[0]
          const selection = [endIndex, endIndex].join('-') as Selection
          for (const [pSelection, paragrahOptions] of Object.entries(options.paragrahs)) {
            //如果当前段落存在交集
            if (hasOverlap(pSelection as Selection, selection)) {
              for (const [rSelection, rowOptions] of Object.entries(paragrahOptions.rows)) {
                //如果当前行存在交集
                if (hasOverlap(rSelection as Selection, selection)) {
                  let walkedWidth =
                    node.structure.contentBox.location.x +
                    options.contentBox.location.x +
                    paragrahOptions.contentBox.location.x +
                    rowOptions.contentBox.location.x

                  for (const [fSelection, fontOptions] of Object.entries(rowOptions.font)) {
                    const [fStart, fEnd] = selectionStr2Arr(fSelection as Selection)
                    if (endIndex > fEnd) {
                      walkedWidth += (fEnd - fStart) * fontOptions.characterWidth
                    } else if (endIndex >= fStart && endIndex <= fEnd) {
                      walkedWidth += (endIndex - fStart) * fontOptions.characterWidth
                    }
                  }
                  //未知原因会闪烁:FIX
                  canvasProxy.current.style.left = `${walkedWidth}px`
                  canvasProxy.current.style.top = `${
                    node.structure.contentBox.location.y +
                    options.contentBox.location.y +
                    paragrahOptions.contentBox.location.y +
                    rowOptions.contentBox.location.y +
                    (rowOptions.contentBox.size.height * 1.1) / 1.2 -
                    rowOptions.contentBox.size.height / 1.2 / options.Leading
                  }px`
                  canvasProxy.current.style.height = `${rowOptions.contentBox.size.height / options.Leading}px`
                }
              }
            }
          }
        }
      }
    },
    [canvasProxy.current, template, canvasRef.current],
  )
  const blurProxy = useCallback(() => {
    if (canvasProxy.current) {
      ;(canvasProxy.current as HTMLInputElement).value = ''
    }
  }, [canvasProxy.current])
  /***
   * 代理元素初始化样式
   */
  useEffect(() => {
    if (canvasRef.current) {
      const proxyEle: HTMLInputElement = document.createElement('input')
      proxyEle.style.width = `10px`
      proxyEle.style.height = `10px`
      proxyEle.style.position = 'absolute'
      proxyEle.style.left = '0'
      proxyEle.style.top = '0'
      proxyEle.style.opacity = '0'
      proxyEle.style.backgroundColor = '#fff'
      proxyEle.style.zIndex = '-999'
      proxyEle.style.overflow = 'hidden'
      canvasProxy.current = proxyEle
      canvasRef.current.parentElement!.insertBefore(proxyEle, canvasRef.current)
    }
    return () => {
      canvasProxy.current?.remove()
      canvasProxy.current == null
    }
  }, [canvasRef.current])
  /**
   * 代理元素的事件绑定
   */
  useEffect(() => {
    if (canvasProxy.current) {
      // canvasProxy.current.addEventListener('keydown', keydownProxy)
      canvasProxy.current.addEventListener('input', inputProxy)
      canvasProxy.current.addEventListener('blur', blurProxy)
    }
    return () => {
      // canvasProxy.current?.removeEventListener('keydown', keydownProxy)
      canvasProxy.current?.removeEventListener('input', inputProxy)
      canvasProxy.current?.removeEventListener('blur', blurProxy)
    }
  }, [canvasProxy.current, template])

  return { preview, print }
}

export default useCanvas
