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

/**
 * Zod Schema for RGPD account deletion (/api/user/delete-account)
 */
export const deleteAccountRequestSchema = z.object({
  confirmText: z.literal("SUPPRIMER"),
});
