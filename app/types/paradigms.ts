export type ParadigmSchool = 'efficiency' | 'abstraction' | 'agility' | 'general'

export interface Paradigm {
  id: string
  cost: number
  school: ParadigmSchool
  requires?: string[]
}
