import type { RecommendedModel, ModelVariant } from './types'

export const RECOMMENDED_MODELS: RecommendedModel[] = [
  // ── Chat models ───────────────────────────────────────────
  // Optimized for decision-making speed: all knowledge comes from
  // the retrieval layer, so we only need fast instruction-following.
  {
    displayName: 'Qwen 3.5 0.8B',
    parametersBillions: 0.8,
    tier: 'small',
    category: 'chat',
    description: 'Ultra-fast — ideal for classification and structured decisions',
    gpuRecommended: false,
    variants: [
      { tag: 'qwen3.5:0.8b', quantization: 'Q8', sizeOnDisk: '~1 GB', minRAMGB: 4 },
    ],
  },
  {
    displayName: 'Qwen 3.5 2B',
    parametersBillions: 2,
    tier: 'small',
    category: 'chat',
    description: 'Fast and capable — great default for most systems',
    gpuRecommended: false,
    variants: [
      { tag: 'qwen3.5:2b-q4_K_M', quantization: 'Q4_K_M', sizeOnDisk: '~1.9 GB', minRAMGB: 4 },
      { tag: 'qwen3.5:2b', quantization: 'Q8', sizeOnDisk: '~2.7 GB', minRAMGB: 6 },
    ],
  },
  {
    displayName: 'Qwen 3.5 4B',
    parametersBillions: 4,
    tier: 'medium',
    category: 'chat',
    description: 'Best speed-to-quality ratio — recommended default',
    gpuRecommended: false,
    variants: [
      { tag: 'qwen3.5:4b', quantization: 'Q4_K_M', sizeOnDisk: '~3.4 GB', minRAMGB: 6 },
      { tag: 'qwen3.5:4b-q8_0', quantization: 'Q8', sizeOnDisk: '~5.3 GB', minRAMGB: 8 },
    ],
  },
  {
    displayName: 'Qwen 3.5 9B',
    parametersBillions: 9,
    tier: 'medium',
    category: 'chat',
    description: 'Richer answers for RAG — pick this if you have a GPU',
    gpuRecommended: true,
    variants: [
      { tag: 'qwen3.5:9b', quantization: 'Q4_K_M', sizeOnDisk: '~6.6 GB', minRAMGB: 8 },
      { tag: 'qwen3.5:9b-q8_0', quantization: 'Q8', sizeOnDisk: '~11 GB', minRAMGB: 16 },
    ],
  },
  // ── Embedding models ──────────────────────────────────────
  {
    displayName: 'Nomic Embed Text',
    parametersBillions: 0.137,
    tier: 'small',
    category: 'embedding',
    description: 'Fast, high-quality embeddings — recommended default',
    gpuRecommended: false,
    variants: [
      { tag: 'nomic-embed-text', quantization: 'Default', sizeOnDisk: '~274 MB', minRAMGB: 4 },
    ],
  },
  {
    displayName: 'All-MiniLM',
    parametersBillions: 0.033,
    tier: 'small',
    category: 'embedding',
    description: 'Ultra-lightweight embeddings for constrained systems',
    gpuRecommended: false,
    variants: [
      { tag: 'all-minilm', quantization: 'Default', sizeOnDisk: '~67 MB', minRAMGB: 4 },
    ],
  },
]

/**
 * Pick the fastest variant of a model that fits within the system's RAM.
 * Prefers Q4 (smaller/faster) over Q8 — quality gains from heavier
 * quantization don't matter when the LLM is only making decisions
 * over user-provided context.
 */
export function pickBestVariant(
  model: RecommendedModel,
  totalMemoryGB: number | null,
): ModelVariant {
  if (totalMemoryGB === null) return model.variants[0]

  for (const variant of model.variants) {
    if (variant.minRAMGB <= totalMemoryGB) {
      return variant
    }
  }

  return model.variants[0]
}

/**
 * Sort models so the fastest compatible model appears first.
 * Compatible models sorted smallest-first (fastest), then
 * incompatible ones after (smallest-first so near-misses show first).
 */
export function sortModelsForSystem(
  models: RecommendedModel[],
  totalMemoryGB: number | null,
): RecommendedModel[] {
  if (totalMemoryGB === null) return models

  return [...models].sort((a, b) => {
    const aFits = a.variants[0].minRAMGB <= totalMemoryGB
    const bFits = b.variants[0].minRAMGB <= totalMemoryGB

    if (aFits && !bFits) return -1
    if (!aFits && bFits) return 1
    return a.parametersBillions - b.parametersBillions
  })
}
