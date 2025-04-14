
export type Document = {
  id: string;
  title: string;
  content: any;
  created_at: string | null;
  updated_at: string | null;
  category: string | null;
  category_color: string | null;
  user_id: string;
};

export type DocumentCreateInput = {
  title: string;
  content: any;
  category?: string;
  category_color?: string;
};

export type DocumentUpdateInput = {
  title?: string;
  content?: any;
  category?: string;
  category_color?: string;
  updated_at?: string;
  preview_image?: string | null; // Keeping this for backward compatibility
};
