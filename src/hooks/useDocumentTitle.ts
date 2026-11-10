import { useEffect } from 'react'

const APP = 'R_M_R TEST FOR INTERN'

export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} · ${APP}` : APP
  }, [title])
}
