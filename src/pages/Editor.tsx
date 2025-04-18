
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
import ErrorBoundary from "@/components/ErrorBoundary";

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [excalidrawElements, setExcalidrawElements] = useState<readonly ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [editorInitialized, setEditorInitialized] = useState(false);
  
  // For generating previews
  const excalidrawRef = useRef<any>(null);
  
  // Autosave debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref to track if document has been fetched to avoid infinite loops
  const documentFetchedRef = useRef(false);
  
  // Add debugging to help identify the exact issue
  useEffect(() => {
    console.log("Excalidraw component loaded");
  }, []);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id || documentFetchedRef.current) return;
      
      try {
        documentFetchedRef.current = true;
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

  // Separate effect for initial editor initialization
  useEffect(() => {
    if (!isLoading && !editorInitialized) {
      setEditorInitialized(true);
    }
  }, [isLoading, editorInitialized]);

  const generatePreview = async () => {
    if (!excalidrawRef.current || !excalidrawElements.length) return null;
    
    try {
      const blob = await exportToBlob({
        elements: excalidrawElements,
        appState: {
          exportWithDarkMode: false,
          exportBackground: true,
          viewBackgroundColor: "#ffffff",
        },
        files: null,
      });
      
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error generating preview:", error);
      return null;
    }
  };

  const saveDrawing = async (elements: readonly ExcalidrawElement[], appState: AppState) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      // Generate a preview image
      const previewImage = await generatePreview();
      
      // Update with or without the preview_image field based on what's available
      await documentService.updateDocument(id, {
        title,
        content: { elements, appState },
        ...(previewImage ? { preview_image: previewImage } : {})
      });
      
      toast.success("Drawing saved successfully");
    } catch (error) {
      console.error("Error saving drawing:", error);
      toast.error("Failed to save drawing");
    } finally {
      setIsSaving(false);
    }
  };

  // Use a ref for the onChange handler to prevent it from causing re-renders
  const handleChangeRef = useRef((elements: readonly ExcalidrawElement[], state: AppState) => {
    setExcalidrawElements(elements);
    setAppState(state);
    
    // Autosave after changes (debounced)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDrawing(elements, state);
    }, 3000); // Autosave after 3 seconds of inactivity
  });

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
      <header className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-white hover:bg-white/20">
            <ArrowLeft size={18} />
            <span className="ml-2">Back</span>
          </Button>
          <Input
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            className="max-w-[300px] font-bold bg-white/10 border-white/20 text-white placeholder-white/60"
          />
        </div>
        <Button
          onClick={() => saveDrawing(excalidrawElements, appState as AppState)}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20"
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
          <ErrorBoundary fallback={
            <div className="flex h-full items-center justify-center flex-col gap-4 p-8">
              <h2 className="text-xl font-bold text-red-600">Failed to load the drawing editor</h2>
              <p className="text-gray-600">There was a problem initializing the drawing editor component.</p>
              <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
            </div>
          }>
            {editorInitialized && (
              <Excalidraw
                excalidrawAPI={(api) => {
                  excalidrawRef.current = api;
                }}
                initialData={{
                  elements: excalidrawElements,
                  appState: appState || undefined,
                }}
                onChange={handleChangeRef.current}
                viewModeEnabled={false}
              />
            )}
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
};

export default Editor;
