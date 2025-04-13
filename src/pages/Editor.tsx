
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState } from "@excalidraw/excalidraw/types/types";
import { documentService } from "@/services/documentService";
import { Document } from "@/types/document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [excalidrawElements, setExcalidrawElements] = useState<readonly ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<AppState | null>(null);
  
  // Autosave debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      
      try {
        const doc = await documentService.getDocumentById(id);
        if (doc) {
          setDocument(doc);
          setTitle(doc.title);
          
          // Initialize Excalidraw with saved content if it exists
          if (doc.content && doc.content.elements) {
            setExcalidrawElements(doc.content.elements);
            if (doc.content.appState) {
              setAppState(doc.content.appState);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("Failed to load drawing");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id, navigate]);

  const saveDrawing = async (elements: readonly ExcalidrawElement[], appState: AppState) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await documentService.updateDocument(id, {
        title,
        content: { elements, appState },
      });
      toast.success("Drawing saved successfully");
    } catch (error) {
      console.error("Error saving drawing:", error);
      toast.error("Failed to save drawing");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (elements: readonly ExcalidrawElement[], appState: AppState) => {
    setExcalidrawElements(elements);
    setAppState(appState);
    
    // Autosave after changes (debounced)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDrawing(elements, appState);
    }, 2000); // Autosave after 2 seconds of inactivity
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = async () => {
    if (!id || document?.title === title) return;
    
    try {
      await documentService.updateDocument(id, { title });
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
          <Input
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            className="max-w-[300px] font-bold"
          />
        </div>
        <Button
          onClick={() => saveDrawing(excalidrawElements, appState as AppState)}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2"
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </header>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex-1">
          <Excalidraw
            initialData={{
              elements: excalidrawElements,
              appState: appState || undefined,
            }}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
};

export default Editor;
