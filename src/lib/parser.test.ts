import { describe, it, expect } from 'vitest'
import { normalizeQuestion } from './parser'
import type { QuizQuestion } from '../types/quiz'

describe('normalizeQuestion', () => {
  it('normalizes Variant A (a + trans + grammar + vocab)', () => {
    const raw = {
      q: 'I saw a little boy ______ the street alone.',
      a: 'crossing',
      options: ['crossing', 'crossed', 'to cross', 'crosses'],
      trans: '我剛才看見一個小男孩獨自橫穿馬路。',
      grammar: '感官動詞 saw + 受詞 + V-ing',
      vocab: 'alone [əˈloʊn] (adv.) 獨自地',
    }

    const result: QuizQuestion = normalizeQuestion(raw)

    expect(result.q).toBe(raw.q)
    expect(result.options).toEqual(raw.options)
    expect(result.correctAnswer).toBe('crossing')
    expect(result.correctIndex).toBe(0)
    expect(result.explanation.translation).toBe(raw.trans)
    expect(result.explanation.grammar).toBe(raw.grammar)
    expect(result.explanation.vocab).toBe(raw.vocab)
    expect(result.explanation.restore).toBeUndefined()
  })

  it('normalizes Variant B (correct + trans + ana)', () => {
    const raw = {
      q: 'Each of the students _______ a different assignment.',
      options: ['has', 'have', 'having', 'are having'],
      correct: 0,
      trans: '每個學生都有不同的作業。',
      ana: 'Each of + 複數名詞，主詞核心是 Each，視為單數。',
    }

    const result: QuizQuestion = normalizeQuestion(raw)

    expect(result.correctAnswer).toBe('has')
    expect(result.correctIndex).toBe(0)
    expect(result.explanation.translation).toBe(raw.trans)
    expect(result.explanation.grammar).toBe(raw.ana)
    expect(result.explanation.vocab).toBeUndefined()
    expect(result.explanation.restore).toBeUndefined()
  })

  it('normalizes Variant C (correct + trans + ana + orig)', () => {
    const raw = {
      q: "He promised _______ me back as soon as possible.",
      options: ['calling', 'to call', 'call', 'called'],
      correct: 1,
      trans: '他承諾會盡快回電給我。',
      ana: 'promise 後接 to V 表示未來的承諾。',
      orig: "He promised: 'I will call you back.'",
    }

    const result: QuizQuestion = normalizeQuestion(raw)

    expect(result.correctAnswer).toBe('to call')
    expect(result.correctIndex).toBe(1)
    expect(result.explanation.translation).toBe(raw.trans)
    expect(result.explanation.grammar).toBe(raw.ana)
    expect(result.explanation.restore).toBe(raw.orig)
    expect(result.explanation.vocab).toBeUndefined()
  })

  it('normalizes Variant D (correct + translation + grammar + restore + vocab)', () => {
    const raw = {
      q: "I ______ my keys. I can't find them anywhere!",
      options: ['lost', 'have lost', 'am losing', 'was losing'],
      correct: 1,
      translation: '我弄丟了我的鑰匙。我到處都找不到！',
      grammar: '【現在完成式】強調過去發生的動作對「現在」造成的影響。',
      restore: 'Original: I lost my keys at some point.',
      vocab: 'lost [lɔst] (v.) 遺失',
    }

    const result: QuizQuestion = normalizeQuestion(raw)

    expect(result.correctAnswer).toBe('have lost')
    expect(result.correctIndex).toBe(1)
    expect(result.explanation.translation).toBe(raw.translation)
    expect(result.explanation.grammar).toBe(raw.grammar)
    expect(result.explanation.restore).toBe(raw.restore)
    expect(result.explanation.vocab).toBe(raw.vocab)
  })

  it('normalizes Variant E (correct + trans + gram + restore + vocab)', () => {
    const raw = {
      q: 'Last night, I ______ my homework when the phone rang.',
      options: ['did', 'was doing', 'have done', 'do'],
      correct: 1,
      trans: '昨晚當電話響起時，我正在寫作業。',
      gram: '過去進行式 (was/were + V-ing) 用於描述過去某個特定時刻正在進行的動作。',
      restore: 'I was doing my homework (long action) + phone rang (short action).',
      vocab: 'homework [ˈhomˌwɝk] (n.) 作業',
    }

    const result: QuizQuestion = normalizeQuestion(raw)

    expect(result.correctAnswer).toBe('was doing')
    expect(result.correctIndex).toBe(1)
    expect(result.explanation.translation).toBe(raw.trans)
    expect(result.explanation.grammar).toBe(raw.gram)
    expect(result.explanation.restore).toBe(raw.restore)
    expect(result.explanation.vocab).toBe(raw.vocab)
  })

  it('handles Variant A where correct answer is not first option', () => {
    const raw = {
      q: 'We watched the sun ______ over the horizon.',
      a: 'rise',
      options: ['to rise', 'rise', 'rose', 'rises'],
      trans: '我們看著太陽從地平線升起。',
      grammar: 'watch + 受詞 + 原形動詞 (V)',
      vocab: 'horizon [həˈraɪzn] (n.) 地平線',
    }

    const result = normalizeQuestion(raw)

    expect(result.correctAnswer).toBe('rise')
    expect(result.correctIndex).toBe(1)
  })
})
