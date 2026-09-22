import WorkoutPlan from "@/models/WorkoutPlan";
import "@/models/WorkoutProgram";
import "@/models/Video";
import type {
  DayItem,
  UserWorkoutDataResult,
  VideoInfo,
  WorkoutPlan as WorkoutPlanType,
} from "@/types/workout";

export async function getUserWorkoutData(
  userId?: string | null,
  packageId?: string | null
): Promise<UserWorkoutDataResult> {
  if (!packageId || !userId) {
    return { plan: null, workoutDays: [] };
  }

  let rawPlan = await WorkoutPlan.findOne({
    packageId,
    userId,
    isActive: true,
  })
    .populate({
      path: "programm",
      populate: [
        { path: "programs.exercises.videoId" },
        { path: "programs.exercises.videoId2" },
      ],
    })
    .lean();

  if (!rawPlan) {
    rawPlan = await WorkoutPlan.findOne({
      packageId,
      isActive: true,
      $or: [{ userId: null }, { userId: { $exists: false } }],
    })
      .populate({
        path: "programm",
        populate: [
          { path: "programs.exercises.videoId" },
          { path: "programs.exercises.videoId2" },
        ],
      })
      .lean();
  }

  if (!rawPlan) {
    return { plan: null, workoutDays: [] };
  }

  const serializedPlan: WorkoutPlanType = JSON.parse(JSON.stringify(rawPlan));

  const programData = Array.isArray(serializedPlan.programm)
    ? serializedPlan.programm[0]
    : serializedPlan.programm;

  const workoutDays: DayItem[] = (programData?.programs || []).map((p, idx) => ({
    _id: p._id || `day-${idx}`,
    dayName: p.day,
    muscleGroup: p.muscleGroup || "",
    exercises: (p.exercises || []).map((ex, exIdx) => ({
      _id: ex._id || `ex-${idx}-${exIdx}`,
      name: ex.name,
      description: ex.description || "",
      sets: ex.sets ?? 3,
      reps: ex.reps ?? "",
      weight: ex.weight ?? 0,
      restSec: ex.restSec ?? 60,
      isComplete: Boolean(ex.isComplete),
      videoId: (typeof ex.videoId === "object" ? ex.videoId : null) as VideoInfo | null,
      videoId2: (typeof ex.videoId2 === "object" ? ex.videoId2 : null) as VideoInfo | null,
    })),
  }));

  return {
    plan: serializedPlan,
    workoutDays,
  };
}
