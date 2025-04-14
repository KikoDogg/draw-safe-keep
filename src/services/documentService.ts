
import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentCreateInput, DocumentUpdateInput } from "@/types/document";

export const documentService = {
  async getAllDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }

    return data || [];
  },

  async getDocumentById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching document:", error);
      throw error;
    }

    return data;
  },

  async createDocument(document: DocumentCreateInput): Promise<Document> {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        ...document,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating document:", error);
      throw error;
    }

    return data;
  },

  async updateDocument(id: string, document: DocumentUpdateInput): Promise<Document> {
    // Handle preview_image properly
    const updatePayload = {
      ...document,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("documents")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating document:", error);
      throw error;
    }

    return data;
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }
};

