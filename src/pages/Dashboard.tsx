
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { documentService } from "@/services/documentService";
import { Document } from "@/types/document";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CategorySelector } from "@/components/CategorySelector";
import { Plus, FileEdit, Trash2, LogOut, Search } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentService.getAllDocuments();
        setDocuments(docs);
        setFilteredDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to load your drawings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    let result = [...documents];
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(doc => 
        (doc.category || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    setFilteredDocuments(result);
  }, [searchQuery, selectedCategory, documents]);

  const createNewDocument = async (category?: string) => {
    try {
      const newDoc = await documentService.createDocument({
        title: "Untitled Drawing",
        content: {},
        category: category || null,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="py-6 px-6 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 shadow-md rounded-b-2xl">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Excali-Lite</h1>
          <p className="text-slate-500 dark:text-slate-400">Your drawing workspace</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search drawings" 
              className="pl-10 w-full bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => createNewDocument()} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus size={18} />
              New Drawing
            </Button>
            <Button variant="outline" onClick={signOut} className="aspect-square p-2">
              <LogOut size={18} />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">My Drawings</h2>
          <CategorySelector 
            currentCategory={selectedCategory} 
            onChange={setSelectedCategory} 
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center p-12 space-y-4 bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold">No drawings yet</h2>
            <p className="text-muted-foreground">Create your first drawing to get started!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto">
              <Card className="hover:shadow-lg transition-all duration-200 border-dashed border-2 cursor-pointer" onClick={() => createNewDocument()}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-40">
                  <Plus size={40} className="text-slate-400 mb-2" />
                  <p className="text-center text-slate-600 dark:text-slate-400">New Drawing</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-200 border-dashed border-2 cursor-pointer" onClick={() => createNewDocument("stickers")}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-40">
                  <Plus size={40} className="text-pink-400 mb-2" />
                  <p className="text-center text-slate-600 dark:text-slate-400">New Sticker Drawing</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-all duration-200 border-dashed border-2 cursor-pointer" onClick={() => createNewDocument()}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-40">
                  <Plus size={40} className="text-slate-400 mb-2" />
                  <p className="text-center text-slate-600 dark:text-slate-400">Create New Drawing</p>
                </CardContent>
              </Card>
              
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group bg-white dark:bg-slate-800 rounded-xl shadow">
                  <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    {doc.preview_image ? (
                      <img 
                        src={doc.preview_image} 
                        alt={doc.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileEdit size={40} className="text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                    {doc.category && (
                      <span className="absolute top-2 right-2 px-2 py-1 text-xs rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                        {doc.category}
                      </span>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="truncate text-lg">{doc.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                    <p>Last modified: {formatDate(doc.updated_at)}</p>
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
                      className="gap-1 text-destructive hover:bg-destructive/10" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteDocument(doc.id);
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
