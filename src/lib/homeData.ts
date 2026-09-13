import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/models/Blog";
import UserModel from "@/models/User";
import PackageModel from "@/models/Package";
import PackageFeatureModel from "@/models/Packagefeature";
import TestimonialModel from "@/models/Testimonial";
import { unstable_cache } from "next/cache";
import type {
  HomeArticleItem,
  HomeWorkoutPlanItem,
  HomeStats,
  TestimonialItem,
} from "@/types/components";

export const getHomeArticles = unstable_cache(
  async (): Promise<HomeArticleItem[]> => {
    try {
      await dbConnect();
      const latestBlogs = await BlogModel.find({ status: "published" })
        .select("title slug excerpt image category authorId createdAt")
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("authorId", "fullName username avatar")
        .lean();

      return latestBlogs.map((blog: any) => {
        const authorName =
          blog.authorId?.fullName || blog.authorId?.username || "نویسنده مهمان";
        const authorInitial = authorName.substring(0, 1);
        const publishDateString = new Intl.DateTimeFormat("fa-IR", {
          month: "long",
          day: "numeric",
        }).format(new Date(blog.createdAt));

        const readingTime = 5;

        return {
          id: blog._id.toString(),
          title: blog.title,
          slug: blog.slug,
          excerpt:
            blog.excerpt || "مطالعه مقاله ورزشی و راهنمای تخصصی در استارفیت",
          image: blog.image || "",
          category: blog.category,
          readingTime: `${readingTime} دقیقه مطالعه`,
          authorName,
          authorInitial,
          publishDate: publishDateString,
        };
      });
    } catch {
      return [];
    }
  },
  ["home-articles"],
  { revalidate: 3600, tags: ["articles"] }
);

export const getHomePlans = unstable_cache(
  async (): Promise<HomeWorkoutPlanItem[]> => {
    try {
      await dbConnect();
      const dbPackages = await PackageModel.find({ isActive: true })
        .select("_id name tagline description icon price slug")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      const packageIds = dbPackages.map((pkg: any) => pkg._id);
      const dbFeatures =
        packageIds.length > 0
          ? await PackageFeatureModel.find({
              packageId: { $in: packageIds },
              included: true,
            })
              .select("packageId name sortOrder")
              .sort({ sortOrder: 1 })
              .lean()
          : [];

      return dbPackages.map((pkg: any) => {
        const pkgFeatures = dbFeatures
          .filter((feat: any) => feat.packageId.toString() === pkg._id.toString())
          .map((feat: any) => feat.name);

        return {
          id: pkg._id.toString(),
          slug: pkg.slug || pkg._id.toString(),
          title: pkg.name,
          description: pkg.tagline || pkg.description || "",
          duration: "یک ماه",
          level: "همه سطوح",
          icon: pkg.icon || "💪",
          features:
            pkgFeatures.length > 0
              ? pkgFeatures
              : [
                  `اشتراک ماهانه: ${new Intl.NumberFormat("fa-IR").format(
                    pkg.price?.monthly || 0,
                  )} تومان`,
                ],
        };
      });
    } catch {
      return [];
    }
  },
  ["home-plans"],
  { revalidate: 3600, tags: ["packages"] }
);

export const getHomeStats = unstable_cache(
  async (): Promise<HomeStats> => {
    try {
      await dbConnect();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);

      const [todayCount, yesterdayCount] = await Promise.all([
        UserModel.countDocuments({ createdAt: { $gte: startOfToday } }),
        UserModel.countDocuments({
          createdAt: { $gte: startOfYesterday, $lt: startOfToday },
        }),
      ]);

      const formatPersianNumber = (num: number) => {
        return new Intl.NumberFormat("fa-IR").format(num);
      };

      let trendText = "";
      if (yesterdayCount === 0) {
        if (todayCount > 0) {
          trendText = `+${formatPersianNumber(100)}% نسبت به دیروز`;
        } else {
          trendText = `${formatPersianNumber(0)}% نسبت به دیروز`;
        }
      } else {
        const percentage = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
        const formattedPercent = new Intl.NumberFormat("fa-IR", {
          signDisplay: "exceptZero",
        }).format(Math.round(percentage));
        trendText = `${formattedPercent}% نسبت به دیروز`;
      }

      return {
        todayUsersCount: formatPersianNumber(todayCount),
        trendText,
      };
    } catch {
      return {
        todayUsersCount: "۰",
        trendText: "۰% نسبت به دیروز",
      };
    }
  },
  ["home-stats"],
  { revalidate: 600, tags: ["stats"] }
);

export const getHomeTestimonials = unstable_cache(
  async (): Promise<TestimonialItem[]> => {
    try {
      await dbConnect();
      const dbTestimonials = await TestimonialModel.find({ isVisible: true })
        .select("_id name role avatar badge rating comment achievement createdAt userId")
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("userId", "fullName username avatar role")
        .lean();

      if (!dbTestimonials || dbTestimonials.length === 0) {
        return [];
      }

      return dbTestimonials.map((item: any) => {
        const user = item.userId;
        const resolvedName =
          user?.fullName || user?.username || item.name || "ورزشکار استارفیت";
        const resolvedAvatar = user?.avatar || item.avatar || "";

        return {
          id: item._id.toString(),
          name: resolvedName,
          role: item.role || "شاگرد استارفیت",
          avatar: resolvedAvatar,
          badge: item.badge || "ورزشکار",
          rating: typeof item.rating === "number" ? item.rating : 5,
          comment: item.comment,
          achievement: item.achievement || "",
        };
      });
    } catch {
      return [];
    }
  },
  ["home-testimonials"],
  { revalidate: 3600, tags: ["testimonials"] }
);


