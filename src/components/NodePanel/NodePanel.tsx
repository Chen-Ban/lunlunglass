import React from 'react'
import styles from './NodePanel.module.scss'
import { CanvasNode } from 'src/store/types/Template.type'
type Props = {
  activeNode: CanvasNode | undefined
}

export default function NodePanel({ activeNode }: Props) {
  if (!activeNode) return <div className={styles.container}>21</div>
  return <div className={styles.container}>{activeNode.type}</div>
}
