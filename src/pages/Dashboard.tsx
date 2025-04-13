
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { documentService } from "@/services/documentService";
import { Document } from "@/types/document";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileEdit, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentService.getAllDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to load your drawings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const createNewDocument = async () => {
    try {
      const newDoc = await documentService.createDocument({
        title: "Untitled Drawing",
        content: {},
      });
      navigate(`/edit/${newDoc.id}`);
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to create new drawing");
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await documentService.deleteDocument(id);
      setDocuments(documents.filter(doc => doc.id !== id));
      toast.success("Drawing deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete drawing");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="container mx-auto p-4">
      <header className="py-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Excali-Lite</h1>
        <div className="flex gap-2">
          <Button onClick={createNewDocument} className="flex items-center gap-2">
            <Plus size={18} />
            New Drawing
          </Button>
          <Button variant="outline" onClick={signOut}>
            <LogOut size={18} />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </header>

      <main>
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center p-12 space-y-4">
            <h2 className="text-2xl font-semibold">No drawings yet</h2>
            <p className="text-muted-foreground">Create your first drawing to get started!</p>
            <Button onClick={createNewDocument} className="mt-4">
              <Plus size={18} className="mr-2" />
              Create Drawing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="truncate">{doc.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                  <p>Last modified: {formatDate(doc.updated_at)}</p>
                  <p>Created: {formatDate(doc.created_at)}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Link to={`/edit/${doc.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <FileEdit size={16} />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 text-destructive" 
                    onClick={() => deleteDocument(doc.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
