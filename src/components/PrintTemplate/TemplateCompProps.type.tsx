import { CanvasNode } from 'store/types/Template.type'
export type TemplateComponentProps<T> = {
  componentId: string
  componentName: string
  component: React.LazyExoticComponent<React.FC<any>>
  propName: CanvasNode['propName']
  options: T
  type: string
}
