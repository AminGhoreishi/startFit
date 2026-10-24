"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import {
  Edit,
  Dumbbell,
  Package,
} from "lucide-react";
import type {
  PackageInfo,
  UserInfo,
  WorkoutPlan,
  ProgramDayItem,
  VideoInfo,
  SubscriptionItem,
} from "@/types/workout";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import WorkoutProgramForm from "./days/WorkoutProgramForm";
import ProgramDaysList from "./days/ProgramDaysList";
import EditPlanInfoForm from "./plans/EditPlanInfoForm";
import SelectedPackageHeader from "./packages/SelectedPackageHeader";
import CreatePlanForm from "./plans/CreatePlanForm";
import AddWorkoutDropdown from "./days/AddWorkoutDropdown";
import PackageCard from "./packages/PackageCard";
import ProgramDayExercisesDetail from "./exercises/ProgramDayExercisesDetail";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const EMPTY_ARRAY: any[] = [];

export default function WorkoutsManagement() {
  const [selectedPackage, setSelectedPackage] = useState<PackageInfo | null>(null);
  const [selectedProgramDay, setSelectedProgramDay] = useState<ProgramDayItem | null>(null);

  const [isEditingPlanInfo, setIsEditingPlanInfo] = useState(false);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [editingProgramDay, setEditingProgramDay] = useState<ProgramDayItem | null>(null);
  const [watchingVideo, setWatchingVideo] = useState<VideoInfo | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

  const { data: pkgData, isLoading: loadingPackages } = useSWR(
    "/api/admin/package",
    fetcher
  );
  const packages: PackageInfo[] = pkgData?.packages ?? EMPTY_ARRAY;

  const { data: vidData } = useSWR("/api/admin/video", fetcher);
  const videos: VideoInfo[] = vidData?.videos ?? EMPTY_ARRAY;

  const { data: subsData, isLoading: loadingSubs } = useSWR(
    selectedPackage
      ? `/api/admin/subscription?packageId=${selectedPackage._id}&limit=100`
      : null,
    fetcher
  );
  const packageSubscriptions: SubscriptionItem[] = subsData?.subscriptions ?? EMPTY_ARRAY;

  const { data: monthData, mutate: mutatePlan, isLoading: loadingPlan } = useSWR(
    selectedPackage
      ? selectedUser
        ? `/api/admin/subscription/workout-plans?packageId=${selectedPackage._id}&userId=${selectedUser._id}`
        : `/api/admin/subscription/workout-plans?packageId=${selectedPackage._id}`
      : null,
    fetcher
  );
  const workoutPlan: WorkoutPlan | null =
    monthData?.plans && monthData.plans.length > 0 ? monthData.plans[0] : null;

  const { data: programData, mutate: mutateProgram, isLoading: loadingProgram } = useSWR(
    workoutPlan
      ? `/api/admin/subscription/workout-programs?planId=${workoutPlan._id}`
      : null,
    fetcher
  );
  const programDays: ProgramDayItem[] = programData?.program?.programs ?? EMPTY_ARRAY;

  const activeProgramDay =
    selectedProgramDay &&
    programDays.find((d) => d._id === selectedProgramDay._id || d.day === selectedProgramDay.day)
      ? programDays.find((d) => d._id === selectedProgramDay._id || d.day === selectedProgramDay.day)!
      : selectedProgramDay;

  const handleSelectPackage = useCallback((pkg: PackageInfo) => {
    setSelectedPackage(pkg);
    setSelectedProgramDay(null);
    setShowProgramForm(false);
    setEditingProgramDay(null);
  }, []);

  const handleProgramSuccess = useCallback(() => {
    mutateProgram();
    setShowProgramForm(false);
    setEditingProgramDay(null);
  }, [mutateProgram]);

  return (
    <div className="overflow-hidden font-danaMed" dir="rtl">
      <div className="container mx-auto pt-8">
        <div className="mb-8 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2 font-morabbaReg">
            مدیریت برنامه‌های تمرینی
          </h1>
          <p className="text-white/60 text-sm">
            برنامه‌های ورزشی، روزها و حرکات هر پکیج اشتراک را طراحی، روزبندی و سازماندهی کنید.
          </p>
        </div>

        {loadingPackages ? (
          <div className="p-12 text-center text-white/50 bg-white/5 border border-white/10 rounded-xl">
            در حال بارگذاری اطلاعات اولیه...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-white font-bold text-lg flex items-center gap-2 font-morabbaReg">
                <Package className="w-5 h-5 text-amber-400" />
                انتخاب پکیج
              </h2>
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg._id}
                    pkg={pkg}
                    isSelected={selectedPackage?._id === pkg._id}
                    onSelect={handleSelectPackage}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              {!selectedPackage ? (
                <div className="h-64 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/40 text-center p-8 bg-white/5">
                  <Dumbbell className="w-16 h-16 mb-4 opacity-20 text-amber-400" />
                  <p className="font-semibold text-lg">
                    برای شروع، یک پکیج را از ستون سمت راست انتخاب کنید
                  </p>
                  <p className="text-sm text-white/50 mt-1">
                    شما می‌توانید برنامه‌های ورزشی هر پکیج را به صورت مجزا مدیریت کنید.
                  </p>
                </div>
              ) : loadingPlan ? (
                <div className="h-64 border border-white/10 rounded-2xl flex items-center justify-center text-white/50 bg-white/5">
                  در حال بارگذاری برنامه تمرینی پکیج...
                </div>
              ) : (
                <div className="space-y-6">
                  <SelectedPackageHeader
                    selectedPackage={selectedPackage}
                    subscriptionCount={packageSubscriptions.length}
                    setSelectedUser={setSelectedUser}
                    workoutPlan={workoutPlan}
                    setSelectedProgramDay={setSelectedProgramDay}
                    mutatePlan={mutatePlan}
                    mutateProgram={mutateProgram}
                  />

                  {!workoutPlan ? (
                    <CreatePlanForm
                      selectedPackage={selectedPackage}
                      selectedUser={selectedUser}
                      onSuccess={() => mutatePlan()}
                    />
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
                      {isEditingPlanInfo ? (
                        <EditPlanInfoForm
                          workoutPlan={workoutPlan}
                          onSuccess={() => {
                            mutatePlan();
                            setIsEditingPlanInfo(false);
                          }}
                          onCancel={() => setIsEditingPlanInfo(false)}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2 font-morabbaReg">
                              {workoutPlan.title}
                            </h3>
                            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                              {workoutPlan.description || "بدون توضیحات اضافی"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEditingPlanInfo(true)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 p-2 rounded-lg transition-all cursor-pointer"
                            title="ویرایش مشخصات برنامه"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {workoutPlan && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4">
                          <div>
                            <h4 className="text-white font-bold text-sm font-morabbaReg">
                              روزهای برنامه تمرینی
                            </h4>
                            <p className="text-xs text-white/50 mt-0.5">
                              برای مشاهده و مدیریت حرکات هر روز، روی کارت آن کلیک کنید.
                            </p>
                          </div>
                          <AddWorkoutDropdown
                            packageId={selectedPackage._id}
                            workoutPlanId={workoutPlan._id}
                            userId={selectedUser?._id}
                            onAddNewDay={() => {
                              setEditingProgramDay(null);
                              setShowProgramForm(true);
                            }}
                          />
                        </div>

                        {showProgramForm && (
                          <WorkoutProgramForm
                            workoutPlanId={workoutPlan._id}
                            userId={selectedUser?._id}
                            editingProgramDay={editingProgramDay}
                            videos={videos}
                            onSuccess={handleProgramSuccess}
                            onCancel={() => {
                              setShowProgramForm(false);
                              setEditingProgramDay(null);
                            }}
                          />
                        )}

                        <ProgramDaysList
                          planId={workoutPlan._id}
                          programDays={programDays}
                          selectedProgramDay={activeProgramDay}
                          onSelectProgramDay={setSelectedProgramDay}
                          onEditProgramDay={(day) => {
                            setEditingProgramDay(day);
                            setShowProgramForm(true);
                          }}
                          mutateProgram={mutateProgram}
                        />
                      </div>

                      {activeProgramDay && (
                        <ProgramDayExercisesDetail
                          activeProgramDay={activeProgramDay}
                          onEditDay={(day) => {
                            setEditingProgramDay(day);
                            setShowProgramForm(true);
                          }}
                          videos={videos}
                          setWatchingVideo={setWatchingVideo}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {watchingVideo && (
          <VideoPlayerModal
            video={watchingVideo}
            onClose={() => setWatchingVideo(null)}
          />
        )}
      </div>
    </div>
  );
}
