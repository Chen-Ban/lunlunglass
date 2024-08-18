import { useRequest } from 'ahooks'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'

import { getTemplates } from 'services/template'
import { Template } from 'src/store/types/Template.type'
import { resetTemplate } from 'store/Template'
import { stateType } from 'store/index'
type Props = {
  templateId: Template['templateId']
}
export default ({ templateId }: Props) => {
  const dispatch = useDispatch()
  const templates = useSelector<stateType, Template[]>((state) => state.templates)
  const [template, setTemplate] = useState<Template | undefined>()

  const { loading } = useRequest(getTemplates, {
    onSuccess(templates) {
      dispatch(resetTemplate(templates))
    },
  })

  useEffect(() => {
    // 会更新三次，第一次从无->store中的无->store存入数据库的数据后更新
    const template = templates.find((template) => template.templateId == templateId)
    if (template) {
      setTemplate(template)
    }
  }, [templates])

  return {
    loading,
    template,
  }
}
