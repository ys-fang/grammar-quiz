export interface QuizQuestion {
  q: string
  options: string[]
  correctAnswer: string
  correctIndex: number
  explanation: {
    translation: string
    grammar: string
    vocab?: string
    restore?: string
  }
}

export interface TopicData {
  topicId: string
  title: string
  questions: QuizQuestion[]
}

export interface CategoryGroup {
  categoryTitle: string
  topics: { name: string; slug: string; topicId: string }[]
}

export interface Manifest {
  gasUrl: string
  categories: CategoryGroup[]
}

// Raw data variants from scraped HTML
export interface RawVariantA {
  q: string
  a: string
  options: string[]
  trans: string
  grammar: string
  vocab: string
}

export interface RawVariantB {
  q: string
  options: string[]
  correct: number
  trans: string
  ana: string
}

export interface RawVariantC {
  q: string
  options: string[]
  correct: number
  trans: string
  ana: string
  orig: string
}

export interface RawVariantD {
  q: string
  options: string[]
  correct: number
  translation: string
  grammar: string
  restore: string
  vocab: string
}

export interface RawVariantE {
  q: string
  options: string[]
  correct: number
  trans: string
  gram: string
  restore: string
  vocab: string
}

export type RawQuestion =
  | RawVariantA
  | RawVariantB
  | RawVariantC
  | RawVariantD
  | RawVariantE
