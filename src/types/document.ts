
export type Document = {
  id: string;
  title: string;
  content: any;
  created_at: string | null;
  updated_at: string | null;
  category: string | null;
  category_color: string | null;
  user_id: string;
  preview_image?: string | null; // Adding this back to fix the Dashboard component
};

export type DocumentCreateInput = {
  title: string;
  content: any;
  category?: string;
  category_color?: string;
  preview_image?: string | null;
};

export type DocumentUpdateInput = {
  title?: string;
  content?: any;
  category?: string;
  category_color?: string;
  updated_at?: string;
  preview_image?: string | null;
};

