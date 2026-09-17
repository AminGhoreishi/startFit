"use client";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import type { CKEditorWrapperProps } from "@/types/blog";

export default function CKEditorWrapper({
  value,
  onChange,
}: CKEditorWrapperProps) {
  const CKEditorComponent = CKEditor as any;
  return (
    <CKEditorComponent
      editor={
        ClassicEditor as unknown as ConstructorParameters<
          typeof import("@ckeditor/ckeditor5-react").CKEditor
        >[0]["editor"]
      }
      data={value}
      onChange={(_: any, editor: any) => onChange(editor.getData())}
      config={{
        licenseKey: "GPL",
        language: "fa",
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "|",
          "blockQuote",
          "insertTable",
          "mediaEmbed",
          "|",
          "undo",
          "redo",
        ],
        heading: {
          options: [
            {
              model: "paragraph",
              title: "پاراگراف",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "تیتر ۱ (H1)",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "تیتر ۲ (H2)",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "تیتر ۳ (H3)",
              class: "ck-heading_heading3",
            },
            {
              model: "heading4",
              view: "h4",
              title: "تیتر ۴ (H4)",
              class: "ck-heading_heading4",
            },
          ],
        },
      }}
    />
  );
}
