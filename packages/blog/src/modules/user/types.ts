import { BlogUserEntity } from './entity';
export interface TBlogUserUpdateProps {
  readonly nickname: BlogUserEntity['nickname'],
  readonly email: BlogUserEntity['email'],
  // readonly avatar: BlogUserEntity['avatar'],
}

export interface BlogUserChangePasswordProps {
  oldPassword: BlogUserEntity['password'],
  newPassword: BlogUserEntity['password'],
  comPassword: BlogUserEntity['password'],
}