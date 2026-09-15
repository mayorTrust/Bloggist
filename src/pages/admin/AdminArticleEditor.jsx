import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import {
  ArrowLeft,
  Upload,
  X,
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveVertical,
  Undo,
  Redo,
  Check,
  RotateCcw,
  Sparkles,
  Mic,
  Globe
} from 'lucide-react';
import AiVoiceCreateModal from '../../components/AiVoiceCreateModal.jsx';
import SeoAioOptimizationPanel from '../../components/SeoAioOptimizationPanel.jsx';

export default function AdminArticleEditor({ articleId, navigate }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Trust Agbi');
  const [bannerImage, setBannerImage] = useState('');
  const [status, setStatus] = useState('published'); // 'draft' or 'published'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [bannerUploading, setBannerUploading] = useState(false);
  const [inlineUploading, setInlineUploading] = useState(false);
  const [bannerUrlInput, setBannerUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // AI Voice Creation modal state
  const [aiVoiceModalOpen, setAiVoiceModalOpen] = useState(false);

  // SEO & AIO state
  const [seoData, setSeoData] = useState({
    meta_title: '',
    meta_description: '',
    keywords: '',
    aio_summary: '',
    seo_score: 88
  });

  // Link dialog state
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedSelectionRef = useRef(null);

  // Spacing dropdown
  const [showSpacingMenu, setShowSpacingMenu] = useState(false);

  // Font size dropdown
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

  // Editor ref
  const editorRef = useRef(null);
  const bannerFileInputRef = useRef(null);
  const inlineImageInputRef = useRef(null);

  // Initial load for edit mode
  useEffect(() => {
    if (articleId) {
      loadArticle(articleId);
    } else {
      // Default empty starter paragraph if new
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p>Write your article...</p>';
      }
    }
  }, [articleId]);

  const loadArticle = async (id) => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getArticle(id);
      setTitle(data.title || '');
      setAuthor(data.author || 'Trust Agbi');
      setBannerImage(data.banner_image || '');
      setStatus(data.status || 'published');
      setSeoData({
        meta_title: data.meta_title || data.title || '',
        meta_description: data.meta_description || data.excerpt || '',
        keywords: data.keywords || '',
        aio_summary: data.aio_summary || '',
        seo_score: data.seo_score || 88
      });
      if (editorRef.current) {
        editorRef.current.innerHTML = data.content_html || '<p><br></p>';
      }
      setLoading(false);
    } catch (err) {
      console.warn('Failed to load article for editing:', err?.message || err);
      setError('Failed to load article for editing');
      setLoading(false);
    }
  };

  // Selection utilities
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  // Format execution
  const executeCommand = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
  };

  // Format Headings
  const applyHeading = (level) => {
    executeCommand('formatBlock', `<${level}>`);
  };

  const applyParagraph = () => {
    executeCommand('formatBlock', '<p>');
  };

  // Lists
  const applyBulletList = () => {
    executeCommand('insertUnorderedList');
  };

  const applyNumberedList = () => {
    executeCommand('insertOrderedList');
  };

  const applyRomanList = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('insertOrderedList');
    // Find parent OL and set upper-roman
    const sel = window.getSelection();
    if (sel.anchorNode) {
      let node = sel.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'OL') {
          node.style.listStyleType = 'upper-roman';
          break;
        }
        node = node.parentNode;
      }
    }
  };

  // Font size: Small, Normal, Large
  const applyFontSize = (size) => {
    setShowFontSizeMenu(false);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    if (size === 'small') {
      document.execCommand('fontSize', false, '2'); // 13px
    } else if (size === 'normal') {
      document.execCommand('fontSize', false, '3'); // 16px
    } else if (size === 'large') {
      document.execCommand('fontSize', false, '5'); // 24px
    }
  };

  // Text color: Black, Dark Gray, Gray
  const applyTextColor = (color) => {
    executeCommand('foreColor', color);
  };

  // Spacing
  const insertSpacing = (heightPx, label) => {
    setShowSpacingMenu(false);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const spacerHtml = `<div style="height: ${heightPx}px; border-left: 2px dashed #E5E5E5; margin: 8px 0;" title="${label} Spacing" data-bloggist-spacing="${label}"></div><p><br></p>`;
    document.execCommand('insertHTML', false, spacerHtml);
  };

  // Link handling
  const openLinkDialog = () => {
    saveSelection();
    setLinkUrl('https://');
    setShowLinkDialog(true);
  };

  const confirmAddLink = (e) => {
    e.preventDefault();
    setShowLinkDialog(false);
    restoreSelection();
    if (linkUrl && linkUrl.trim() && linkUrl !== 'https://') {
      let validUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(validUrl)) {
        validUrl = 'https://' + validUrl;
      }
      executeCommand('createLink', validUrl);
    }
  };

  // Banner image upload
  const handleBannerFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerUploading(true);
    setError('');
    try {
      const res = await api.uploadImage(file);
      setBannerImage(res.url);
      setBannerUploading(false);
    } catch (err) {
      setBannerUploading(false);
      setError('Banner upload failed: ' + (err.message || 'Unknown error'));
    }
  };

  // Inline content image upload
  const handleInlineImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInlineUploading(true);
    try {
      const res = await api.uploadImage(file);
      setInlineUploading(false);

      if (editorRef.current) {
        editorRef.current.focus();
      }
      const imageHtml = `
        <figure style="margin: 24px 0; text-align: center;">
          <img src="${res.url}" alt="Article Image" style="max-width: 100%; height: auto; display: inline-block; border: 1px solid #E5E5E5;" />
        </figure>
        <p><br></p>
      `;
      document.execCommand('insertHTML', false, imageHtml);
    } catch (err) {
      setInlineUploading(false);
      alert('Failed to upload image: ' + err.message);
    } finally {
      if (inlineImageInputRef.current) {
        inlineImageInputRef.current.value = '';
      }
    }
  };

  // Save / Publish
  const handleSave = async (targetStatus) => {
    if (!title.trim()) {
      setError('Please enter an article title');
      return;
    }
    if (!author.trim()) {
      setError('Please enter an author name');
      return;
    }

    const contentHtml = editorRef.current?.innerHTML || '';
    const textOnly = contentHtml.replace(/<[^>]+>/g, ' ').trim();
    if (!textOnly && !contentHtml.includes('<img')) {
      setError('Please write some content for the article');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title: title.trim(),
      author: author.trim(),
      banner_image: bannerImage,
      content_html: contentHtml,
      status: targetStatus,
      meta_title: seoData.meta_title || title.trim(),
      meta_description: seoData.meta_description || '',
      keywords: seoData.keywords || '',
      aio_summary: seoData.aio_summary || '',
      seo_score: seoData.seo_score || 88
    };

    try {
      if (articleId) {
        await api.updateArticle(articleId, payload);
      } else {
        await api.createArticle(payload);
      }
      setSaving(false);
      navigate('/admin/articles');
    } catch (err) {
      setSaving(false);
      setError(err.message || 'Failed to save article');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-[#666666]">Loading article...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-6 pb-28 space-y-8">
      {/* Top Header: Back button & Save/Publish actions */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <button
          id="editor-back-btn"
          type="button"
          onClick={() => navigate('/admin/articles')}
          className="inline-flex items-center gap-2 text-sm text-[#666666] hover:text-black transition-colors cursor-pointer focus:outline-hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Articles</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Voice Research Button */}
          <button
            id="editor-ai-voice-btn"
            type="button"
            onClick={() => setAiVoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer rounded-xs shadow-xs"
            title="Tell Gemini to research and draft an article"
          >
            <Mic className="w-3.5 h-3.5 text-red-400" />
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">AI Voice Research</span>
          </button>

          <button
            id="save-draft-btn"
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="px-3.5 py-1.5 text-xs text-[#666666] hover:text-black border border-[#E5E5E5] hover:border-black bg-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            id="publish-article-btn"
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="px-4 py-1.5 text-xs bg-black text-white hover:opacity-90 transition-opacity font-medium cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200">
          {error}
        </div>
      )}

      {/* 1. Banner Image Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#666666]">
            Banner Image
          </label>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[#666666] hover:text-black underline cursor-pointer"
            >
              {showUrlInput ? 'Hide URL input' : 'Paste Image URL'}
            </button>
            <button
              type="button"
              onClick={() => bannerFileInputRef.current?.click()}
              className="text-black font-semibold hover:underline cursor-pointer"
            >
              Upload File
            </button>
          </div>
        </div>

        {/* Optional direct URL input */}
        {showUrlInput && (
          <div className="flex items-center gap-2 p-2 bg-neutral-50 border border-[#E5E5E5] rounded-xs">
            <input
              type="url"
              value={bannerUrlInput}
              onChange={(e) => setBannerUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#E5E5E5] focus:border-black focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => {
                if (bannerUrlInput.trim()) {
                  setBannerImage(bannerUrlInput.trim());
                  setBannerUrlInput('');
                  setShowUrlInput(false);
                }
              }}
              className="px-3 py-1.5 text-xs bg-black text-white hover:bg-neutral-800 cursor-pointer font-medium"
            >
              Apply
            </button>
          </div>
        )}

        {bannerImage ? (
          <div className="relative aspect-[21/9] sm:aspect-[2/1] overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5] group rounded-xs">
            <img
              src={bannerImage}
              alt="Article Banner Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                className="px-2.5 py-1 text-xs bg-white text-black border border-[#E5E5E5] shadow-xs hover:bg-[#F5F5F5] cursor-pointer"
                title="Replace Banner"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => setBannerImage('')}
                className="p-1 bg-white text-black border border-[#E5E5E5] shadow-xs hover:text-red-600 cursor-pointer"
                title="Remove Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            id="add-banner-image-dropzone"
            onClick={() => bannerFileInputRef.current?.click()}
            className="aspect-[21/9] sm:aspect-[2/1] border-2 border-dashed border-[#E5E5E5] hover:border-black flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#F5F5F5]/50 group rounded-xs"
          >
            <Upload className="w-6 h-6 text-[#666666] group-hover:text-black mb-2 transition-colors" />
            <span className="text-sm font-medium text-black">
              {bannerUploading ? 'Uploading banner...' : '＋ Add Banner Image'}
            </span>
            <span className="text-xs text-[#666666] mt-1">
              Upload file or click "Paste Image URL" above
            </span>
          </div>
        )}

        <input
          ref={bannerFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={handleBannerFileChange}
          className="hidden"
        />
      </div>

      {/* 2. Author Field */}
      <div className="pt-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#666666] mb-1">
          Author
        </label>
        <input
          id="article-author-input"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author name"
          className="w-full text-sm font-medium text-black border-b border-[#E5E5E5] py-1.5 focus:border-black focus:outline-hidden bg-transparent"
        />
      </div>

      {/* 3. Article Title Input (Looks like real headline) */}
      <div className="pt-4">
        <input
          id="article-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title..."
          className="w-full text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black border-none focus:outline-hidden bg-transparent placeholder:text-[#666666]/40 leading-tight"
        />
      </div>

      {/* 4. Compact WYSIWYG Toolbar */}
      <div
        id="editor-compact-toolbar"
        className="sticky top-16 z-20 bg-white/85 backdrop-blur-md border border-[#E5E5E5]/90 p-1.5 flex items-center gap-1 overflow-x-auto shadow-sm"
      >
        {/* Bold */}
        <button
          id="format-bold-btn"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('bold');
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Bold"
          aria-label="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          id="format-italic-btn"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('italic');
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Italic"
          aria-label="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Underline */}
        <button
          id="format-underline-btn"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('underline');
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Underline"
          aria-label="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-[#E5E5E5] mx-1 shrink-0" />

        {/* Text Size Menu */}
        <div className="relative">
          <button
            id="format-text-size-btn"
            type="button"
            onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
            className="px-2 py-1 text-xs font-semibold text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
            title="Text Size"
          >
            Size
          </button>
          {showFontSizeMenu && (
            <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-[#E5E5E5] shadow-md py-1 z-30">
              <button
                type="button"
                onClick={() => applyFontSize('small')}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F5F5F5] cursor-pointer"
              >
                Small
              </button>
              <button
                type="button"
                onClick={() => applyFontSize('normal')}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-[#F5F5F5] cursor-pointer"
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => applyFontSize('large')}
                className="w-full text-left px-3 py-1.5 text-base font-semibold hover:bg-[#F5F5F5] cursor-pointer"
              >
                Large
              </button>
            </div>
          )}
        </div>

        {/* Text Color: Black, Dark Gray, Gray */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyTextColor('#000000');
          }}
          className="w-4 h-4 rounded-full bg-black border border-[#E5E5E5] cursor-pointer shrink-0 ml-1"
          title="Color: Black"
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyTextColor('#444444');
          }}
          className="w-4 h-4 rounded-full bg-[#444444] border border-[#E5E5E5] cursor-pointer shrink-0"
          title="Color: Dark Gray"
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyTextColor('#888888');
          }}
          className="w-4 h-4 rounded-full bg-[#888888] border border-[#E5E5E5] cursor-pointer shrink-0"
          title="Color: Gray"
        />

        <div className="w-[1px] h-5 bg-[#E5E5E5] mx-1 shrink-0" />

        {/* Headings */}
        <button
          id="format-h2-btn"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyHeading('h2');
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Heading 2"
          aria-label="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          id="format-h3-btn"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyHeading('h3');
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Heading 3"
          aria-label="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <button
          id="format-h4-btn"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyHeading('h4');
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Heading 4"
          aria-label="Heading 4"
        >
          <Heading4 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-[#E5E5E5] mx-1 shrink-0" />

        {/* Alignments */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('justifyLeft');
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('justifyCenter');
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('justifyRight');
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-[#E5E5E5] mx-1 shrink-0" />

        {/* Lists: Bullet, Numbered, Roman */}
        <button
          id="format-bullet-list-btn"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyBulletList();
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Bullet List"
          aria-label="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          id="format-numbered-list-btn"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyNumberedList();
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Numbered List"
          aria-label="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          id="format-roman-list-btn"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyRomanList();
          }}
          className="px-1.5 py-1 text-xs font-serif font-bold text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Roman Numeral List (I, II, III)"
          aria-label="Roman List"
        >
          I. II.
        </button>

        <div className="w-[1px] h-5 bg-[#E5E5E5] mx-1 shrink-0" />

        {/* Add Image Inside Content */}
        <button
          id="format-add-image-btn"
          type="button"
          onClick={() => inlineImageInputRef.current?.click()}
          disabled={inlineUploading}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Add Image"
          aria-label="Add Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <input
          ref={inlineImageInputRef}
          type="file"
          accept="image/*"
          onChange={handleInlineImageChange}
          className="hidden"
        />

        {/* Add Link */}
        <button
          id="format-add-link-btn"
          type="button"
          onClick={openLinkDialog}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Add Link"
          aria-label="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Spacing Tool */}
        <div className="relative">
          <button
            id="format-spacing-btn"
            type="button"
            onClick={() => setShowSpacingMenu(!showSpacingMenu)}
            className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
            title="Vertical Spacing"
          >
            <MoveVertical className="w-4 h-4" />
          </button>
          {showSpacingMenu && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-[#E5E5E5] shadow-md py-1 z-30">
              <button
                type="button"
                onClick={() => insertSpacing(16, 'Small')}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F5F5F5] cursor-pointer"
              >
                Small Space
              </button>
              <button
                type="button"
                onClick={() => insertSpacing(32, 'Medium')}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F5F5F5] cursor-pointer"
              >
                Medium Space
              </button>
              <button
                type="button"
                onClick={() => insertSpacing(48, 'Large')}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F5F5F5] cursor-pointer"
              >
                Large Space
              </button>
            </div>
          )}
        </div>

        <div className="w-[1px] h-5 bg-[#E5E5E5] mx-1 shrink-0" />

        {/* Undo / Redo */}
        <button
          id="format-undo-btn"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('undo');
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          id="format-redo-btn"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('redo');
          }}
          className="p-1.5 text-[#666666] hover:text-black hover:bg-[#F5F5F5] rounded-xs cursor-pointer focus:outline-hidden"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* 5. Custom WYSIWYG Writing Canvas */}
      <div className="min-h-[400px] border border-[#E5E5E5] bg-white p-6 sm:p-8 focus-within:border-black transition-colors">
        <div
          ref={editorRef}
          id="article-wysiwyg-content"
          contentEditable
          suppressContentEditableWarning
          className="prose prose-neutral max-w-none min-h-[360px] text-black leading-relaxed focus:outline-hidden text-base sm:text-lg [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:mt-6 [&>h2]:mb-2 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-2 [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:mt-3 [&>h4]:mb-1 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-1 [&_a]:underline [&_a]:text-black"
        />
      </div>

      {/* 6. Comprehensive SEO & AIO Optimization Panel */}
      <SeoAioOptimizationPanel
        articleId={articleId}
        articleData={{
          title,
          excerpt: seoData.meta_description,
          content_html: editorRef.current?.innerHTML || '',
          author
        }}
        seoData={seoData}
        onChange={(updatedSeo) => setSeoData(updatedSeo)}
      />

      {/* AI Voice Research Modal */}
      <AiVoiceCreateModal
        isOpen={aiVoiceModalOpen}
        onClose={() => setAiVoiceModalOpen(false)}
        onArticleCreated={(generatedArt) => {
          setTitle(generatedArt.title || '');
          setAuthor(generatedArt.author || 'Trust Agbi');
          setBannerImage(generatedArt.banner_image || '');
          setStatus('draft');
          setSeoData({
            meta_title: generatedArt.meta_title || generatedArt.title || '',
            meta_description: generatedArt.meta_description || generatedArt.excerpt || '',
            keywords: generatedArt.keywords || '',
            aio_summary: generatedArt.aio_summary || '',
            seo_score: generatedArt.seo_score || 92
          });
          if (editorRef.current) {
            editorRef.current.innerHTML = generatedArt.content_html || '<p><br></p>';
          }
          // If we created a new article in the database, navigate to edit it directly
          if (generatedArt.id) {
            navigate(`/admin/articles/edit/${generatedArt.id}`);
          }
        }}
      />

      {/* Link Insertion Modal */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={confirmAddLink} className="w-full max-w-sm bg-white p-6 border border-[#E5E5E5] space-y-4">
            <h4 className="text-sm font-bold text-black">Insert Link</h4>
            <div>
              <label className="block text-xs text-[#666666] mb-1">URL</label>
              <input
                type="url"
                required
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 text-sm border border-[#E5E5E5] focus:border-black focus:outline-hidden"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="px-3 py-1.5 text-xs text-[#666666] border border-[#E5E5E5] hover:bg-[#F5F5F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-black text-white hover:opacity-90 cursor-pointer"
              >
                Add Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
