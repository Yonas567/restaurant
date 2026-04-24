export interface BlogAuthorType {
  id?: string
  avatar?: string
  name?: string
  time?: string | Date
}

export interface BlogType {
  id?: string
  profile: BlogAuthorType
  time?: string | Date
  comment?: string
  replies?: BlogType[]
}

export interface BlogPostType {
  id: string
  title?: string
  content?: string
  coverImg?: string
  createdAt?: string | Date
  view?: number
  share?: number
  category?: string
  featured?: boolean
  author?: BlogAuthorType
  comments?: BlogType[]
}
