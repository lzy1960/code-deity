export type ParadigmSchool = 'efficiency' | 'abstraction' | 'agility' | 'general'

export interface Paradigm {
  id: string
  name: string
  description: string
  cost: number
  school: ParadigmSchool
  requires?: string[]
}
