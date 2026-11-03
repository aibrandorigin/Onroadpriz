import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BlogPost } from '../../types';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  X, 
  Calendar, 
  User, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const BlogsTab: React.FC = () => {
  const { blogs, addBlog, updateBlog, deleteBlog, showToast, navigate, setSelectedBlogSlug } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Buying Tips');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        b.title.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        (b.author?.name && b.author.name.toLowerCase().includes(q));
      
      const matchesCat = categoryFilter === 'All' || b.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [blogs, searchQuery, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingBlogId(null);
    setTitle('');
    setSlug('');
    setCategory('Buying Tips');
    setExcerpt('');
    setContent('');
    setFeaturedImage('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80');
    setSeoTitle('');
    setMetaDescription('');
    setModalOpen(true);
  };

  const handleEditBlog = (b: BlogPost) => {
    setEditingBlogId(b.id);
    setTitle(b.title);
    setSlug(b.slug);
    setCategory(b.category);
    setExcerpt(b.excerpt);
    setContent(b.content);
    setFeaturedImage(b.featuredImage || '');
    setSeoTitle(b.seoTitle || b.title);
    setMetaDescription(b.metaDescription || b.excerpt);
    setModalOpen(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingBlogId) {
      updateBlog(editingBlogId, {
        title,
        slug: generatedSlug,
        category,
        excerpt,
        content,
        featuredImage,
        seoTitle,
        metaDescription
      });
    } else {
      addBlog({
        title,
        slug: generatedSlug,
        category,
        excerpt,
        content,
        featuredImage,
        seoTitle,
        metaDescription,
        status: 'Published'
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Knowledge Base & Blogs Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#77101F]/10 text-[#77101F]">
              {blogs.length} Articles
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish automotive buying guides, RC transfer tutorials, inspection checklists, and SEO content.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl hover:bg-[#5E0B17] transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, slug, or keywords..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#77101F] focus:bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
        >
          <option value="All">All Categories</option>
          <option value="Buying Tips">Buying Tips</option>
          <option value="Selling Tips">Selling Tips</option>
          <option value="RTO & Legal">RTO & Legal</option>
          <option value="Vehicle Maintenance">Maintenance</option>
        </select>
      </div>

      {/* Blogs Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Published Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBlogs.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.featuredImage}
                        alt=""
                        className="w-12 h-9 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1 max-w-sm">{b.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">/blog/{b.slug}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {b.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {b.author?.name || 'OnRoadPriz Editorial'}
                  </td>

                  <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                    {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-GB') : '14 Aug 2026'}
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {b.status || 'Published'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedBlogSlug(b.slug);
                          navigate(`/blog/${b.slug}`);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Preview Article on Live Site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEditBlog(b)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        title="Edit Article"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete article "${b.title}"?`)) deleteBlog(b.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingBlogId ? 'Edit Article' : 'Compose New Article'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Article Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 7 Things to Inspect Before Buying a Used Car in India"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    <option value="Buying Tips">Buying Tips</option>
                    <option value="Selling Tips">Selling Tips</option>
                    <option value="RTO & Legal">RTO & Legal</option>
                    <option value="Vehicle Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Featured Image URL</label>
                  <input
                    type="url"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Excerpt *</label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Summary snippet displayed on blog index..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Content (Markdown / Text) *</label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed article body text..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                  required
                />
              </div>

              {/* SEO Meta Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  SEO & Social Sharing Preview
                </span>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="SEO Meta Title"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO Meta Description (under 160 characters)"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#77101F] text-white font-bold rounded-xl hover:bg-[#5E0B17]"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
