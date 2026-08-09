import type { QuestionnaireDefinition } from './types'

/**
 * Catálogo local. Senhas e metadados migrarão para o banco quando configurado.
 * Troque `accessPassword` por valor de ambiente ou API.
 */
export const questionnaires: QuestionnaireDefinition[] = [
  {
    id: 'roda-da-vida',
    slug: 'roda-da-vida',
    title: 'Roda da Vida',
    subtitle: 'Autoconhecimento',
    description:
      'Avalie cada área da sua vida de 0 a 10. O resultado ajuda a visualizar equilíbrio e prioridades no processo terapêutico.',
    accessPassword: import.meta.env.VITE_Q_RODA_PASSWORD ?? 'roda2026',
    layout: 'wheel',
    questions: [
      { id: 'saude', label: 'Saúde', type: 'scale', min: 0, max: 10 },
      {
        id: 'trabalho-financas',
        label: 'Trabalho / Finanças',
        type: 'scale',
        min: 0,
        max: 10,
      },
      { id: 'familia', label: 'Família', type: 'scale', min: 0, max: 10 },
      { id: 'amigos', label: 'Amigos', type: 'scale', min: 0, max: 10 },
      {
        id: 'relacionamento-amoroso',
        label: 'Relacionamento amoroso',
        type: 'scale',
        min: 0,
        max: 10,
      },
      { id: 'lazer', label: 'Lazer', type: 'scale', min: 0, max: 10 },
      { id: 'autocuidado', label: 'Autocuidado', type: 'scale', min: 0, max: 10 },
      { id: 'emocoes', label: 'Emoções', type: 'scale', min: 0, max: 10 },
      { id: 'sono', label: 'Sono', type: 'scale', min: 0, max: 10 },
      { id: 'futuro', label: 'Futuro', type: 'scale', min: 0, max: 10 },
    ],
  },
]

export function getQuestionnaireBySlug(slug: string) {
  return questionnaires.find((q) => q.slug === slug)
}

export function listQuestionnaires() {
  return questionnaires.map(({ accessPassword: _, ...rest }) => rest)
}
