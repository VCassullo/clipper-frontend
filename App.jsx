import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, Loader, Copy, Check } from 'lucide-react';

export default function IdeaSaverApp() {
  const API_URL = 'https://clipper-production-b7ab.up.railway.app';
  
  const [ideas, setIdeas] = useState(() => {
    const saved = localStorage.getItem('ideas');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ideas', JSON.stringify(ideas));
  }, [ideas]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const processImage = async (file) => {
    if (!file.type.startsWith('image/')) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_URL}/api/ideas`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newIdea = {
          id: data.id,
          image: e.target.result,
          insight: data.insight,
          timestamp: data.timestamp,
        };
        
        setIdeas([newIdea, ...ideas]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar imagem');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    handleDrag(e);
    const files = e.dataTransfer?.files;
    if (files?.[0]) processImage(files[0]);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const deleteIdea = (id) => {
    setIdeas(ideas.filter(idea => idea.id !== id));
  };

  const copyInsight = (insight, id) => {
    navigator.clipboard.writeText(insight);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-yellow-500/30 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
            Clipper
          </h1>
          <p className="text-gray-300/70 mt-1 text-sm">Capture prints. Salve insights. Nunca mais perca.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Upload Section */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-yellow-400 bg-yellow-500/10'
              : 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-400/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-block mb-4"
            disabled={loading}
          >
            {loading ? (
              <Loader className="w-16 h-16 text-yellow-400 animate-spin mx-auto" />
            ) : (
              <Upload className="w-16 h-16 text-yellow-400 mx-auto hover:text-yellow-300 transition-colors" />
            )}
          </button>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {loading ? 'Processando...' : 'Solte seu print aqui'}
          </h2>
          <p className="text-gray-300/70">
            Ou clique para selecionar uma imagem
          </p>
        </div>

        {/* Stats */}
        {ideas.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-300/70 text-sm font-medium">Total de Prints</p>
              <p className="text-3xl font-black text-yellow-300 mt-1">{ideas.length}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-600/20 to-gray-700/20 border border-gray-500/30 rounded-xl p-4">
              <p className="text-gray-300/70 text-sm font-medium">Último Print</p>
              <p className="text-sm text-gray-300 mt-1">{ideas[0]?.timestamp.split(',')[0]}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-400/20 to-gray-600/20 border border-yellow-400/30 rounded-xl p-4">
              <p className="text-yellow-300/70 text-sm font-medium">Status</p>
              <p className="text-xl font-black text-yellow-300 mt-1">✓ Ativo</p>
            </div>
          </div>
        )}

        {/* Ideas Grid */}
        {ideas.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-6">Seus Prints Salvos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ideas.map(idea => (
                <div
                  key={idea.id}
                  className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-yellow-500/20 rounded-xl overflow-hidden hover:border-yellow-400/50 transition-all hover:shadow-lg hover:shadow-yellow-500/10"
                >
                  {/* Imagem */}
                  <div className="relative h-48 overflow-hidden bg-black/40">
                    <img
                      src={idea.image}
                      alt="Print"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-40"></div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-gray-300/70 text-xs font-medium mb-3">{idea.timestamp}</p>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                      <p className="text-white text-sm leading-relaxed">{idea.insight}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyInsight(idea.insight, idea.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 py-2 rounded-lg transition-colors text-sm font-medium"
                      >
                        {copied === idea.id ? (
                          <><Check className="w-4 h-4" /> Copiado</>
                        ) : (
                          <><Copy className="w-4 h-4" /> Copiar</>
                        )}
                      </button>
                      
                      <button
                        onClick={() => deleteIdea(idea.id)}
                        className="px-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {ideas.length === 0 && !loading && (
          <div className="mt-16 text-center py-12">
            <p className="text-gray-300/50 text-lg">Nenhum print salvo ainda...</p>
            <p className="text-gray-300/30 text-sm mt-2">Faça upload de seu primeiro print</p>
          </div>
        )}
      </div>
    </div>
  );
}
