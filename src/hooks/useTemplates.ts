import { useSelector } from 'react-redux'
import { stateType } from '../store'
import { CanvasNode, Template } from 'store/types/Template.type'

export const useGetTemplates = () => {
  return useSelector<stateType, Template[]>((state) => state.templates)
}

export const useGetTemplateById = (templateId: Template['templateId']): Template | undefined => {
  const templates = useGetTemplates()
  return templates.find((template) => template.templateId == templateId)
}

export const useGetToplayerActiveNode = (templateId: Template['templateId']): CanvasNode | null => {
  const template = useGetTemplateById(templateId)
  const activeNodes = template!.nodeList.filter((node) => node.isActive)
  const len = activeNodes.length
  if (len > 0) {
    return activeNodes.sort((pre, cur) => pre.layer - cur.layer)[len - 1]
  }
  return null
}
