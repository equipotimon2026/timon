import { z } from 'zod';

export const mipsResponseSchema = z.record(z.string(), z.boolean());
export const riasecResponseSchema = z.record(
  z.string(),
  z.record(z.string(), z.array(z.string()))
);
export const herrmannResponseSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())])
);
export const gardnerResponseSchema = z.record(
  z.string(),
  z.record(z.string(), z.number())
);
export const textResponseSchema = z.record(z.string(), z.string());

export type MipsResponseInput = z.infer<typeof mipsResponseSchema>;
export type RiasecResponseInput = z.infer<typeof riasecResponseSchema>;
export type HerrmannResponseInput = z.infer<typeof herrmannResponseSchema>;
export type GardnerResponseInput = z.infer<typeof gardnerResponseSchema>;
export type TextResponseInput = z.infer<typeof textResponseSchema>;
