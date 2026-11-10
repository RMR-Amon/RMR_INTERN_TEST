import type { ReactNode, TableHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { Avatar } from '../Avatar/Avatar'
import styles from './Table.module.scss'

export function Table({ className, children, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className={styles.wrap}>
      <table className={cn(styles.table, className)} {...rest}>
        {children}
      </table>
    </div>
  )
}

export function UserCell({ name, username, avatar, extra }: { name: string; username: string; avatar?: string | null; extra?: ReactNode }) {
  return (
    <div className={styles.cellUser}>
      <Avatar name={name} src={avatar} size={34} />
      <div className={styles.userText}>
        <span>{name}</span>
        <span>@{username}</span>
      </div>
      {extra}
    </div>
  )
}
