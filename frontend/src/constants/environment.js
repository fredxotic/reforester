/**
 * Shared environmental and financial constants used across the ReForester platform.
 * Keep backend and frontend copies in sync, or move to a shared package.
 */

// ── Financial ──────────────────────────────────────────────
/** Price per ton of sequestered CO₂ on the voluntary carbon market (USD). */
export const CARBON_CREDIT_RATE_USD = 50;

// ── Environmental per-tree factors ─────────────────────────
/** Average kg of CO₂ sequestered per tree per year at maturity. */
export const CO2_PER_TREE_KG_YEAR = 22;

/** Average kg of O₂ produced per tree per year at maturity. */
export const O2_PER_TREE_KG_YEAR = 260;

// ── Equivalence factors (EPA / public sources) ─────────────
/** Average metric tons of CO₂ emitted per passenger car per year. */
export const CO2_PER_CAR_TONS_YEAR = 4.6;

/** Average metric tons of CO₂ from electricity for one US home per year. */
export const CO2_PER_HOME_TONS_YEAR = 12;

// ── Defaults ───────────────────────────────────────────────
/** Default tree survival rate (%) when no project-specific value exists. */
export const DEFAULT_SURVIVAL_RATE = 85;

/** Number of years for a tree to reach full maturity. */
export const MATURITY_YEARS = 10;

/** Payback period (years) used for carbon credit ROI calculations. */
export const CARBON_PAYBACK_YEARS = 20;
