import type { FitnessProfileData } from "@/types/fitness-profile";

export const goalLabels: Record<string, string> = {
  weight_loss: "کاهش وزن",
  muscle_gain: "عضله‌سازی",
  endurance: "افزایش استقامت",
  general_fitness: "آمادگی جسمانی",
  athletic_performance: "آمادگی جسمانی تخصصی",
  rehabilitation: "توانبخشی",
};

export const experienceLabels: Record<string, string> = {
  beginner: "مبتدی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
};

export const equipmentLabels: Record<string, string> = {
  none: "بدون تجهیزات",
  home_basic: "تجهیزات خانگی",
  gym_full: "باشگاه کامل",
};

export const calculateNutritionTargets = (
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sessionsPerWeek = 4,
  goal = "muscle_gain",
  gender: "male" | "female" = "male"
) => {
  const genderOffset = gender === "female" ? -161 : 5;
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears + genderOffset);

  let activityMultiplier = 1.55;
  if (sessionsPerWeek <= 2) {
    activityMultiplier = 1.375;
  } else if (sessionsPerWeek >= 6) {
    activityMultiplier = 1.65;
  }

  const tdee = Math.round(bmr * activityMultiplier);

  let surplusOrDeficit = 0;
  let proteinMultiplier = 2.0;
  let fatMultiplier = 1.0;

  if (goal === "weight_loss") {
    surplusOrDeficit = -400;
    proteinMultiplier = 2.2;
    fatMultiplier = 0.8;
  } else if (goal === "muscle_gain") {
    surplusOrDeficit = 400;
    proteinMultiplier = 2.0;
    fatMultiplier = 1.0;
  } else if (goal === "athletic_performance") {
    surplusOrDeficit = 200;
    proteinMultiplier = 1.8;
    fatMultiplier = 1.0;
  } else if (goal === "endurance") {
    surplusOrDeficit = 0;
    proteinMultiplier = 1.5;
    fatMultiplier = 0.9;
  } else if (goal === "general_fitness") {
    surplusOrDeficit = 0;
    proteinMultiplier = 1.6;
    fatMultiplier = 0.9;
  } else if (goal === "rehabilitation") {
    surplusOrDeficit = 0;
    proteinMultiplier = 1.6;
    fatMultiplier = 0.9;
  }

  const targetCalories = Math.max(1200, tdee + surplusOrDeficit);

  const proteinGrams = Math.round(weightKg * proteinMultiplier);
  const proteinKcal = Math.round(proteinGrams * 4);

  const fatGrams = Math.round(weightKg * fatMultiplier);
  const fatKcal = Math.round(fatGrams * 9);

  const remainingKcal = Math.max(0, targetCalories - (proteinKcal + fatKcal));
  const carbsGrams = Math.round(remainingKcal / 4);
  const carbsKcal = Math.round(carbsGrams * 4);

  const totalMacroKcal = proteinKcal + fatKcal + carbsKcal || targetCalories;
  const proteinPercent = Math.round((proteinKcal / totalMacroKcal) * 100);
  const fatPercent = Math.round((fatKcal / totalMacroKcal) * 100);
  const carbsPercent = Math.max(0, 100 - (proteinPercent + fatPercent));

  return {
    bmr,
    tdee,
    targetCalories,
    surplusOrDeficit,
    proteinGrams,
    proteinKcal,
    fatGrams,
    fatKcal,
    carbsGrams,
    carbsKcal,
    proteinPercent,
    fatPercent,
    carbsPercent,
  };
};

export const VALID_GOALS = [
  "weight_loss",
  "muscle_gain",
  "endurance",
  "general_fitness",
  "athletic_performance",
  "rehabilitation",
];

export const VALID_EQUIPMENT = ["none", "home_basic", "gym_full"];
export const VALID_EXPERIENCE = ["beginner", "intermediate", "advanced"];
export const VALID_GENDERS = ["male", "female"];

export function sanitizeProfile(doc: any): FitnessProfileData | null {
  if (!doc) return null;
  return {
    gender: doc.gender || "male",
    goal: doc.goal,
    sessionsPerWeek: doc.sessionsPerWeek,
    equipment: doc.equipment,
    trainingExperience: doc.trainingExperience,
    ageYears: doc.ageYears,
    heightCm: doc.heightCm,
    weightKg: doc.weightKg,
    bodyPhotos: doc.bodyPhotos || [],
    notes: doc.notes || "",
  };
}

