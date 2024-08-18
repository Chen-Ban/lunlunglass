import { Selection } from 'store/types/Template.type'

export type SelectionObj = {
  startIndex: number
  endIndex: number
}
export default interface SelectionManage {
  /**
   * 区间解析
   * @param {Selection} sel:区间字符串 `${number}-${number}`
   * @returns {SelectionObj} 区间解析结果
   */
  parseSelection(sel: Selection): SelectionObj
  /**
   * 区间输出
   * @param {SelectionObj} sel
   * @returns {Selection}
   */
  stringifySelection(sel: SelectionObj): Selection
  /**
   * 区间外切
   * @param {SelectionObj} sel1:区间1
   * @param {SelectionObj} sel2:区间2
   * @return {boolean} 是否外切
   */
  isExterior(sel1: SelectionObj, sel2: SelectionObj): boolean
  /**
   * 区间内错
   * @param {SelectionObj} sel1:区间1
   * @param {SelectionObj} sel2:区间2
   * @return {boolean} 是否内错(区间1是否包含于区间2，并且有个端点重合)
   */
  isInterior(sel1: SelectionObj, sel2: SelectionObj): boolean
  /**
   * 区间相交
   * @param {SelectionObj} sel1:区间1
   * @param {SelectionObj} sel2:区间2
   * @return {boolean} 是否相交
   */
  isOverlap(sel1: SelectionObj, sel2: SelectionObj): boolean
  /**
   * 区间包含于
   * @param {SelectionObj} sel1:区间1
   * @param {SelectionObj} sel2:区间2
   * @return {boolean} 是否存在区间1包含于区间2
   */
  isContained(sel1: SelectionObj, sel2: SelectionObj): boolean
  /**
   * 0区间
   * @param {SelectionObj} sel:区间
   * @return {boolean}
   */
  isZeroSelection(sel: SelectionObj): boolean
  /**
   * 相等区间
   * @param {SelectionObj} sel1:区间1
   * @param {SelectionObj} sel2:区间2
   * @return {boolean}区间是否相等
   */
  isSameSelection(sel1: SelectionObj, sel2: SelectionObj): boolean
  /**
   * 区间交集
   * @param {SelectionObj} sel1:区间1
   * @param {SelectionObj} sel2:区间2
   * @return {SelectionObj | null}区间交集
   */
  intersect(sel1: SelectionObj, sel2: SelectionObj): SelectionObj | null
  /**
   * 区间并集
   * @param {SelectionObj} sel1:区间1
   * @param {SelectionObj} sel2:区间2
   * @return {SelectionObj}区间并集
   */
  union(sel1: SelectionObj, sel2: SelectionObj): SelectionObj | null
  /**
   * 区间差集
   * @param {SelectionObj} sel1:区间1
   * @param {SelectionObj} sel2:区间2
   * @return {SelectionObj[]}区间差集
   */
  difference(sel1: SelectionObj, sel2: SelectionObj): SelectionObj[] | null
  /**
   * 区间合并
   * @param {SelectionObj} sel1:区间1
   * @param {SelectionObj} sel2:区间2
   * @return {SelectionObj}区间合并结果
   * @descripe 两个没有交集的区间合并，后一个区间的端点会发生偏移
   */
  merge(sel1: SelectionObj, sel2: SelectionObj): SelectionObj
  /**
   * 区间端点偏移
   * @param {SelectionObj} sel:区间1
   * @param {number[]} offset:区间端点偏移数组
   * @return {SelectionObj}区间偏移结果
   */
  offsetSelection(sel: SelectionObj, offset: number[]): SelectionObj
}
