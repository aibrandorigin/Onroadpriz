import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Clock, ChevronRight, ArrowLeft, User as UserIcon, Calendar, Tag, Share2 } from 'lucide-react';

export const BlogsPage: React.FC = () => {
  const { blogs, navigate, setSelectedBlogSlug } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Buying Tips', 'RTO Procedures', 'Commercial Vehicles', 'Maintenance'];

  const filteredBlogs = selectedCategory === 'All' 
    ? blogs 
    : blogs.filter(b => b.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#77101F]/10 text-[#77101F] text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Automotive Knowledge Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#101828] font-display">
          Guides, RTO Tips & Market Insights
        </h1>
        <p className="text-xs sm:text-sm text-[#667085]">
          Everything you need to know about buying and selling used cars, commercial vehicles, RTO Parivahan procedures, and vehicle maintenance in India.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-[#77101F] text-white shadow-xs'
                : 'bg-white text-[#667085] border border-[#DCE3EC] hover:bg-[#F5F7FA] hover:text-[#101828]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map(blog => (
          <article
            key={blog.id}
            onClick={() => {
              setSelectedBlogSlug(blog.slug);
              navigate(`/blog/${blog.slug}`);
            }}
            className="group bg-white rounded-2xl border border-[#DCE3EC] hover:border-[#77101F]/50 hover:shadow-xl transition-all overflow-hidden cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="h-52 overflow-hidden bg-[#F5F7FA] relative">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#77101F] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                  {blog.category}
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-[#98A2B3]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {blog.publishedAt}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {blog.readTimeMinutes} min read
                  </span>
                </div>

                <h2 className="text-base font-bold text-[#101828] group-hover:text-[#77101F] transition-colors leading-snug line-clamp-2 font-display">
                  {blog.title}
                </h2>

                <p className="text-xs text-[#667085] line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#DCE3EC]/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img src={blog.author.avatar} alt={blog.author.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="font-semibold text-[#101828]">{blog.author.name}</span>
              </div>
              <span className="font-bold text-[#77101F] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Read Full Guide <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export const BlogDetailPage: React.FC = () => {
  const { blogs, selectedBlogSlug, navigate, showToast } = useApp();

  const blog = blogs.find(b => b.slug === selectedBlogSlug) || blogs[0];

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-[#101828]">Article not found</h2>
        <button onClick={() => navigate('/blogs')} className="mt-4 px-4 py-2 bg-[#77101F] text-white rounded-xl text-xs font-bold">
          Return to Blog Directory
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link Copied', 'Article link copied to clipboard.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/blogs')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#667085] hover:text-[#77101F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Guides</span>
        </button>

        <button
          onClick={handleShare}
          className="p-2 border border-[#DCE3EC] rounded-xl text-xs font-semibold text-[#101828] hover:bg-[#F5F7FA] flex items-center gap-1.5 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Guide</span>
        </button>
      </div>

      <article className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <span className="bg-[#77101F]/10 text-[#77101F] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {blog.category}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#101828] font-display mt-3 leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-[#667085] mt-4 pt-4 border-t border-[#DCE3EC]">
            <div className="flex items-center gap-2">
              <img src={blog.author.avatar} alt={blog.author.name} className="w-8 h-8 rounded-full object-cover" />
              <span className="font-bold text-[#101828]">{blog.author.name}</span>
            </div>
            <span>•</span>
            <span>{blog.publishedAt}</span>
            <span>•</span>
            <span>{blog.readTimeMinutes} min read</span>
          </div>
        </div>

        <div className="h-72 sm:h-96 rounded-2xl overflow-hidden bg-[#F5F7FA]">
          <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-[#101828] leading-relaxed whitespace-pre-line space-y-4">
          <p className="text-base font-semibold text-[#101828] leading-relaxed italic">
            "{blog.excerpt}"
          </p>
          <p>{blog.content}</p>
        </div>

        <div className="pt-6 border-t border-[#DCE3EC] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#667085]">Related Tags:</span>
            {blog.tags.map(t => (
              <span key={t} className="px-2.5 py-1 bg-[#F7F9FC] border border-[#DCE3EC] text-[#101828] text-xs rounded-lg font-medium">
                #{t}
              </span>
            ))}
          </div>

          <button
            onClick={() => navigate('/buy')}
            className="px-6 py-2.5 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Explore Verified Vehicles
          </button>
        </div>
      </article>
    </div>
  );
};
