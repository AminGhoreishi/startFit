import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3, deleteFileFromS3 } from "@/lib/arvan";
import { validateBlog, validateBlogUpdate } from "@/validators/blog";
import { revalidateTag, revalidatePath } from "next/cache";

async function generateUniqueSlug(text: string, currentBlogId?: string): Promise<string> {
  const baseSlug = text
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug || "article";
  let count = 1;

  while (true) {
    const existing = await Blog.findOne({ slug });
    if (!existing || (currentBlogId && existing._id.toString() === currentBlogId.toString())) {
      break;
    }
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const blog = await Blog.findById(id)
        .populate("authorId", "username fullName email role")
        .lean();
      if (!blog) {
        return NextResponse.json(
          { message: "مقاله مورد نظر پیدا نشد" },
          { status: 404 }
        );
      }
      return NextResponse.json({ blog });
    }

    const slug = searchParams.get("slug");
    if (slug) {
      const decodedSlug = decodeURIComponent(slug);
      const blog = await Blog.findOne({ slug: decodedSlug })
        .populate("authorId", "username fullName email role")
        .lean();
      if (!blog) {
        return NextResponse.json(
          { message: "مقاله مورد نظر پیدا نشد" },
          { status: 404 }
        );
      }
      return NextResponse.json({ blog });
    }

    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};

    if (status && status !== "all" && status !== "همه") {
      query.status = status;
    }

    if (category && category !== "all" && category !== "همه") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query)
      .populate("authorId", "username fullName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / Number(limit));

    const totalViewsResult = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const totalViews = totalViewsResult[0]?.total || 0;
    const publishedCount = await Blog.countDocuments({ status: "published" });
    const draftCount = await Blog.countDocuments({ status: "draft" });

    return NextResponse.json({
      blogs,
      total,
      totalPages,
      stats: {
        totalViews,
        publishedCount,
        draftCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "خطایی در دریافت اطلاعات مقالات رخ داد" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (session.user.role !== "admin" && session.user.role !== "coach")
    ) {
      return NextResponse.json(
        { message: "دسترسی غیرمجاز. فقط مدیران مجاز به انتشار مقاله هستند" },
        { status: 403 }
      );
    }

    const authorId = session.user.id;

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const customSlug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const category = formData.get("category") as string;
    const status = formData.get("status") as string;
    const publishDate = formData.get("publishDate") as string;
    const seoTitle = formData.get("seoTitle") as string;
    const seoDescription = formData.get("seoDescription") as string;
    const tagsStr = formData.get("tags") as string;
    const imageFile = formData.get("image") as File;

    let tags: any = undefined;
    if (tagsStr) {
      try {
        tags = JSON.parse(tagsStr);
      } catch (err) {
        return NextResponse.json(
          { message: "فرمت تگ‌ها معتبر نیست" },
          { status: 400 }
        );
      }
    }

    const validationData = {
      title: title || undefined,
      slug: customSlug?.trim() || undefined,
      content: content || undefined,
      excerpt: excerpt || undefined,
      category: category || undefined,
      status: status || undefined,
      publishDate: publishDate || undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      tags,
    };

    const validationResult = validateBlog(validationData);
    if (validationResult !== true) {
      return NextResponse.json(
        { message: "داده‌های ارسالی معتبر نیستند", details: validationResult },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(customSlug?.trim() || title);

    let imageUrl = "";
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: "حجم تصویر شاخص نباید بیش از ۵ مگابایت باشد" },
          { status: 400 }
        );
      }
      imageUrl = await uploadFileToS3(imageFile, "blogs");
    }

    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt: excerpt || "",
      image: imageUrl,
      category: category || "بدنسازی",
      status: status || "draft",
      publishDate: publishDate ? new Date(publishDate) : null,
      seoTitle: seoTitle || "",
      seoDescription: seoDescription || "",
      tags: Array.isArray(tags) ? tags : [],
      authorId,
      views: 0,
    });

    revalidateTag("articles", { expire: 0 });
    revalidatePath("/");
    revalidatePath("/articles");

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/blog error:", error.message);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (session.user.role !== "admin" && session.user.role !== "coach")
    ) {
      return NextResponse.json(
        { message: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const customSlug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const category = formData.get("category") as string;
    const status = formData.get("status") as string;
    const publishDate = formData.get("publishDate") as string;
    const seoTitle = formData.get("seoTitle") as string;
    const seoDescription = formData.get("seoDescription") as string;
    const tagsStr = formData.get("tags") as string;
    const imageInput = formData.get("image");

    let tags: any = undefined;
    if (tagsStr) {
      try {
        tags = JSON.parse(tagsStr);
      } catch (err) {
        return NextResponse.json(
          { message: "فرمت تگ‌ها معتبر نیست" },
          { status: 400 }
        );
      }
    }

    const validationData = {
      id: id || undefined,
      title: title || undefined,
      slug: customSlug?.trim() || undefined,
      content: content || undefined,
      excerpt: excerpt || undefined,
      category: category || undefined,
      status: status || undefined,
      publishDate: publishDate || undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      tags,
    };

    const validationResult = validateBlogUpdate(validationData);
    if (validationResult !== true) {
      return NextResponse.json(
        { message: "داده‌های ارسالی معتبر نیستند", details: validationResult },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { message: "مقاله مورد نظر پیدا نشد" },
        { status: 404 }
      );
    }

    const trimmedCustomSlug = customSlug?.trim();
    if (trimmedCustomSlug && trimmedCustomSlug !== blog.slug) {
      const oldSlug = blog.slug;
      blog.slug = await generateUniqueSlug(trimmedCustomSlug, blog._id);
      if (oldSlug) {
        revalidatePath(`/article/${oldSlug}`);
      }
    } else if (!blog.slug && title) {
      blog.slug = await generateUniqueSlug(title, blog._id);
    }

    if (title !== undefined) {
      blog.title = title;
    }

    if (content !== undefined) blog.content = content;
    if (excerpt !== undefined) blog.excerpt = excerpt;

    if (imageInput && imageInput instanceof File && imageInput.size > 0) {
      if (imageInput.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: "حجم تصویر شاخص نباید بیش از ۵ مگابایت باشد" },
          { status: 400 }
        );
      }
      if (blog.image) {
        await deleteFileFromS3(blog.image);
      }
      blog.image = await uploadFileToS3(imageInput, "blogs");
    } else if (
      imageInput === "null" ||
      imageInput === "deleted"
    ) {
      if (blog.image) {
        await deleteFileFromS3(blog.image);
      }
      blog.image = "";
    }

    if (category !== undefined) blog.category = category;
    if (status !== undefined) blog.status = status;
    if (publishDate !== undefined)
      blog.publishDate = publishDate ? new Date(publishDate) : null;
    if (seoTitle !== undefined) blog.seoTitle = seoTitle;
    if (seoDescription !== undefined) blog.seoDescription = seoDescription;
    if (tags !== undefined && Array.isArray(tags)) blog.tags = tags;

    await blog.save();

    revalidateTag("articles", { expire: 0 });
    revalidatePath("/");
    revalidatePath("/articles");
    if (blog.slug) {
      revalidatePath(`/article/${blog.slug}`);
    }

    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    return NextResponse.json(
      { message: "خطایی در ویرایش مقاله رخ داد" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (session.user.role !== "admin" && session.user.role !== "coach")
    ) {
      return NextResponse.json(
        { message: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "شناسه مقاله الزامی است" },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { message: "مقاله مورد نظر پیدا نشد" },
        { status: 404 }
      );
    }

    if (blog.image) {
      await deleteFileFromS3(blog.image);
    }

    await Blog.findByIdAndDelete(id);

    revalidateTag("articles", { expire: 0 });
    revalidatePath("/");
    revalidatePath("/articles");
    if (blog.slug) {
      revalidatePath(`/article/${blog.slug}`);
    }

    return NextResponse.json({
      success: true,
      message: "مقاله با موفقیت حذف شد",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "خطایی در حذف مقاله رخ داد" },
      { status: 500 }
    );
  }
}

