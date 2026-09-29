import mongoose, { Document } from "mongoose";
import type React from "react";
import type { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";

export type FitnessGoal =
  | "weight_loss"
  | "muscle_gain"
  | "endurance"
  | "general_fitness"
  | "athletic_performance"
  | "rehabilitation";

export type EquipmentOption = "none" | "home_basic" | "gym_full";

export type TrainingExperienceOption = "beginner" | "intermediate" | "advanced";

export type GenderOption = "male" | "female";

export type FitnessProfileTab = "physical" | "training" | "photos";

export interface GoalOptionItem {
  val: FitnessGoal;
  label: string;
  icon: React.ElementType;
}

export interface ExperienceOptionItem {
  val: TrainingExperienceOption;
  label: string;
  desc: string;
}

export interface EquipmentOptionItem {
  val: EquipmentOption;
  label: string;
  desc: string;
}

export interface FitnessProfile {
  _id?: string;
  userId?: string;
  gender?: GenderOption;
  goal: FitnessGoal;
  sessionsPerWeek: number;
  equipment: EquipmentOption;
  trainingExperience: TrainingExperienceOption;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  bodyPhotos: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FitnessProfileData {
  gender?: GenderOption;
  goal: FitnessGoal;
  sessionsPerWeek: number;
  equipment: EquipmentOption;
  trainingExperience: TrainingExperienceOption;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  bodyPhotos: string[];
  notes?: string;
}

export interface FitnessFormInputs {
  gender: GenderOption;
  goal: FitnessGoal;
  sessionsPerWeek: number;
  equipment: EquipmentOption;
  trainingExperience: TrainingExperienceOption;
  ageYears: string;
  heightCm: string;
  weightKg: string;
  notes: string;
}

export interface OnboardingFormInputs {
  gender?: GenderOption;
  goal: FitnessGoal;
  sessionsPerWeek: number;
  equipment: EquipmentOption;
  trainingExperience: TrainingExperienceOption;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  bodyPhotos: string[];
  notes: string;
}

export interface OnboardingFormProps {
  initialProfile?: FitnessProfileData | null;
}

export interface FitnessProfileApiResponse {
  profile?: FitnessProfileData | null;
  message?: string;
}

export interface IFitnessProfile
  extends Omit<FitnessProfile, "_id" | "userId" | "createdAt" | "updatedAt">,
    Document {
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface BMICategoryDisplay {
  label: string;
  color: string;
  bg: string;
  border: string;
}

export interface PhysicalTabProps {
  register: UseFormRegister<FitnessFormInputs>;
  errors: FieldErrors<FitnessFormInputs>;
  watchedAge: string;
  watchedHeight: string;
  watchedWeight: string;
  watchedGender: GenderOption;
  setValue: UseFormSetValue<FitnessFormInputs>;
  bmi: number;
  bmiCategory: BMICategoryDisplay;
}

export interface TrainingTabProps {
  watchedGoal: FitnessGoal;
  watchedSessions: number;
  watchedExperience: TrainingExperienceOption;
  watchedEquipment: EquipmentOption;
  setValue: UseFormSetValue<FitnessFormInputs>;
}

export interface PhotosTabProps {
  register: UseFormRegister<FitnessFormInputs>;
  bodyPhotos: string[];
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (index: number) => void;
}

export interface FitnessProfileSidebarProps {
  profile?: FitnessProfileData | null;
}

export interface FitnessProfileManagementProps {
  initialProfile?: FitnessProfileData | null;
}

export interface NutritionTargetResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  surplusOrDeficit: number;
  proteinGrams: number;
  proteinKcal: number;
  fatGrams: number;
  fatKcal: number;
  carbsGrams: number;
  carbsKcal: number;
  proteinPercent: number;
  fatPercent: number;
  carbsPercent: number;
}

export interface FitnessNutritionTargetsProps {
  nutrition: NutritionTargetResult;
}

export interface FitnessProfileStatsProps {
  profile: FitnessProfileData;
}

