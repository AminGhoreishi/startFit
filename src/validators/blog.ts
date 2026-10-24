import validator from "./index";

const blogSchema = {
  title: { type: "string", empty: false, min: 3 },
  slug: { type: "string", optional: true },
  content: { type: "string", empty: false },
  excerpt: { type: "string", optional: true },
  category: { type: "string", optional: true },
  status: { type: "string", optional: true, enum: ["published", "draft", "scheduled"] },
  publishDate: { type: "string", optional: true },
  seoTitle: { type: "string", optional: true },
  seoDescription: { type: "string", optional: true },
  tags: { type: "array", items: "string", optional: true },
};

const blogUpdateSchema = {
  id: { type: "string", empty: false },
  title: { type: "string", empty: false, min: 3, optional: true },
  slug: { type: "string", optional: true },
  content: { type: "string", empty: false, optional: true },
  excerpt: { type: "string", optional: true },
  category: { type: "string", optional: true },
  status: { type: "string", optional: true, enum: ["published", "draft", "scheduled"] },
  publishDate: { type: "string", optional: true },
  seoTitle: { type: "string", optional: true },
  seoDescription: { type: "string", optional: true },
  tags: { type: "array", items: "string", optional: true },
};

export const validateBlog = validator.compile(blogSchema);
export const validateBlogUpdate = validator.compile(blogUpdateSchema);
