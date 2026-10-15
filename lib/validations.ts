import { z } from "zod";

/**
 * Zod Schema for /api/scan endpoint
 */
export const scanRequestSchema = z.object({
  base64: z.string().optional(),
  mimeType: z.string().optional(),
  imageUrl: z.string().optional(),
  cardCount: z.number().min(3).max(15).optional(),
  images: z
    .array(
      z.object({
        base64: z.string().optional(),
        mimeType: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .optional(),
});

export type ScanRequest = z.infer<typeof scanRequestSchema>;

/**
 * Zod Schema for /api/tutor endpoint
 */
export const tutorRequestSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(300),
  subject: z.string().max(100).optional().default("Générale"),
  summary: z.string().max(5000).optional().default(""),
  flashcards: z
    .array(
      z.object({
        front: z.string(),
        back: z.string(),
      })
    )
    .optional()
    .default([]),
  messages: z.array(
    z.object({
      role: z.enum(["user", "model"]),
      text: z.string().min(1).max(2000),
    })
  ),
});

export type TutorRequest = z.infer<typeof tutorRequestSchema>;

/**
 * Zod Schema for creating a deck (/api/decks POST)
 */
export const deckCreateSchema = z.object({
  title: z.string().min(1).max(300).optional().default("Cours sans titre"),
  subject: z.string().max(100).optional().default("Général"),
  summary: z.string().max(10000).optional().nullable(),
  detailed_content: z.string().optional().nullable(),
  progress_percent: z.number().min(0).max(100).optional().default(0),
  initial_quiz_question: z.string().optional().nullable(),
  initial_quiz_answer: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  flashcards: z
    .array(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1),
        distractors: z.array(z.string()).optional(),
      })
    )
    .optional()
    .default([]),
});

export type DeckCreateInput = z.infer<typeof deckCreateSchema>;

/**
 * Zod Schema for updating a deck (/api/decks PATCH)
 */
export const deckUpdateSchema = z.object({
  id: z.string().min(1, "ID du cours requis"),
  progress_percent: z.number().min(0).max(100).optional(),
  detailed_content: z.string().optional(),
});

export type DeckUpdateInput = z.infer<typeof deckUpdateSchema>;

/**
 * Zod Schema for appending pages to a deck (/api/decks/append)
 */
export const deckAppendSchema = z.object({
  deckId: z.string().uuid("ID de cours invalide"),
  base64: z.string().optional(),
  mimeType: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z
    .array(
      z.object({
        base64: z.string().optional(),
        mimeType: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .optional(),
});

export type DeckAppendInput = z.infer<typeof deckAppendSchema>;

/**
 * Zod Schema for generating game/flashcards (/api/decks/generate-game)
 */
export const deckGenerateGameSchema = z.object({
  deckId: z.string().min(1, "deckId requis"),
});

export type DeckGenerateGameInput = z.infer<typeof deckGenerateGameSchema>;

/**
 * Zod Schema for claiming referral code (/api/referral POST)
 */
export const referralClaimSchema = z.object({
  refCode: z.string().min(3).max(50),
});

export type ReferralClaimInput = z.infer<typeof referralClaimSchema>;

/**
 * Zod Schema for referral payout request (/api/referral/payout)
 */
export const referralPayoutSchema = z.object({
  iban: z.string().min(10, "Veuillez fournir un IBAN valide pour le virement").max(40),
});

export type ReferralPayoutInput = z.infer<typeof referralPayoutSchema>;

/**
 * Zod Schema for /api/feedback endpoint
 */
export const feedbackRequestSchema = z.object({
  message: z.string().min(3, "Message trop court").max(2000),
  rating: z.number().min(1).max(5).optional(),
  page: z.string().max(200).optional(),
});

export type FeedbackRequestInput = z.infer<typeof feedbackRequestSchema>;

/**
 * Zod Schema for /api/auth/email endpoint
 */
export const authEmailRequestSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  onboarding: z
    .object({
      step: z.number().optional(),
      level: z.string().max(100).optional(),
      goal: z.string().max(200).optional(),
      userName: z.string().max(100).optional(),
      painPoint: z.string().max(200).optional(),
      completed: z.boolean().optional(),
    })
    .optional(),
});

export type AuthEmailRequest = z.infer<typeof authEmailRequestSchema>;

/**
 * Zod Schema for RGPD account deletion (/api/user/delete-account)
 */
export const deleteAccountRequestSchema = z.object({
  confirmText: z.literal("SUPPRIMER"),
});

export type DeleteAccountRequest = z.infer<typeof deleteAccountRequestSchema>;

/**
 * Zod Schema for logging review card progress (/api/review/log)
 */
export const reviewLogSchema = z.object({
  deckId: z.string().min(1, "deckId requis"),
  logs: z.array(
    z.object({
      cardFront: z.string().min(1),
      rating: z.enum(["again", "good", "hard"]),
      stepNumber: z.number().int().min(1).max(6).optional(),
    })
  ).min(1, "Au moins un log requis"),
});

export type ReviewLogInput = z.infer<typeof reviewLogSchema>;

