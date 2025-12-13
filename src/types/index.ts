export interface Mystery {
  id: number
  part: string
  name: string
  meditation: string
  image_url: string
}

export interface Group {
  id: number
  name: string
}

export interface Profile {
  id: string
  full_name: string
  rose_pos: number | null
  groups: Group | null
  role?: string
}

export interface Intention {
  title: string
  content: string
}

export interface RoseMember {
  id: string
  full_name: string
  rose_pos: number | null
  current_mystery_name: string
}
