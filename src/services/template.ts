import axiosInstance from './ajax'
import { Template, TemplateType } from 'store/types/Template.type'

export async function getTemplates(): Promise<Template[]> {
  return await axiosInstance.get(`/api/template`)
}

export async function getTemplateByType(type: TemplateType): Promise<Template[]> {
  return await axiosInstance.get(`/api/template/${type}`)
}
