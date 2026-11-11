import { AtSign, Save, Trash2, Upload, User } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Avatar, Button, Card, CardHeader, Input } from '@/components/ui'
import { USERNAME_MAX, validateFullName, validateUsername } from '@/features/auth/lib/validation'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { toAppError } from '@/services/supabase/errors'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import type { Profile } from '@/types'
import { profileApi } from '../api/profileApi'
import styles from './Profile.module.scss'

const MAX_AVATAR = 2 * 1024 * 1024

/** Edit name, username and avatar (Supabase Storage). */
export function ProfileForm({ profile }: { profile: Profile }) {
  const { t } = useI18n()
  const toMessage = useErrorMessage()
  const setProfile = useAuthStore((s) => s.setProfile)
  const fileRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState(profile.full_name)
  const [username, setUsername] = useState(profile.username)
  const [errors, setErrors] = useState<{ fullName?: string; username?: string }>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const dirty = fullName.trim() !== profile.full_name || username !== profile.username

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const next = { fullName: validateFullName(fullName, t), username: validateUsername(username, t) }
    setErrors(next)
    if (next.fullName || next.username) return
    setSaving(true)
    try {
      const updated = await profileApi.update(profile.id, { full_name: fullName.trim(), username })
      setProfile(updated)
      toast.success(t.profile.updated)
    } catch (err) {
      if (toAppError(err).code === 'username_taken') setErrors({ username: t.validation.usernameTaken })
      else toast.error(toMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_AVATAR) {
      toast.error(t.profile.avatarTooLarge)
      return
    }
    setUploading(true)
    try {
      const url = await profileApi.uploadAvatar(profile.id, file)
      const updated = await profileApi.update(profile.id, { avatar_url: url })
      setProfile(updated)
      toast.success(t.profile.avatarUpdated)
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const removeAvatar = async () => {
    setUploading(true)
    try {
      const updated = await profileApi.update(profile.id, { avatar_url: null })
      setProfile(updated)
      toast.success(t.profile.avatarUpdated)
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader title={t.profile.edit} icon={<User />} />
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.avatarRow}>
          <Avatar name={fullName || profile.full_name} src={profile.avatar_url} size={72} />
          <div className={styles.avatarActions}>
            <div>
              <Button variant="secondary" size="sm" icon={<Upload />} loading={uploading} onClick={() => fileRef.current?.click()}>
                {t.profile.uploadAvatar}
              </Button>
              {profile.avatar_url && (
                <Button variant="ghost" size="sm" icon={<Trash2 />} onClick={removeAvatar} disabled={uploading}>
                  {t.profile.removeAvatar}
                </Button>
              )}
            </div>
            <p>{t.profile.avatarHint}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className={styles.fileInput}
              onChange={handleFile}
              tabIndex={-1}
              aria-hidden
            />
          </div>
        </div>
        <Input
          label={t.auth.fullName}
          icon={<User />}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          maxLength={60}
        />
        <Input
          label={t.auth.username}
          icon={<AtSign />}
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
          error={errors.username}
          hint={t.auth.usernameHint}
          maxLength={USERNAME_MAX}
        />
        <div className={styles.formActions}>
          <Button type="submit" icon={<Save />} loading={saving} disabled={!dirty}>
            {t.profile.saveChanges}
          </Button>
        </div>
      </form>
    </Card>
  )
}
