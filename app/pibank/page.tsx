"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PIBankPage() {
  // Mirrored Architecture from CV Builder
  const [piLibraryBlocks, setPiLibraryBlocks] = useState<any[]>([]);
  const [piActiveBlocks, setPiActiveBlocks] = useState<any[]>([]);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedQuestion, setDraggedQuestion] = useState<{bucketId: string, qId: string} | null>(null);
  
  const [fullData, setFullData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [piTab, setPiTab] = useState<'draft' | 'finalised'>('draft');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- AUTO-LOAD VIA API ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const API_URL = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5000/api/cv-data' 
          : '/api/cv-data';
          
        const response = await fetch(API_URL);
        const json = await response.json();
        
        if (json.success && json.data) {
          setFullData(json.data);
          // Load PI specific data if it exists
          if (json.data.piLibraryBlocks) setPiLibraryBlocks(json.data.piLibraryBlocks);
          if (json.data.piActiveBlocks) setPiActiveBlocks(json.data.piActiveBlocks);
        }
      } catch (err) {
        console.error("Failed to load PI Bank data");
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // --- AUTO-SAVE VIA API ---
  const saveToServer = async (libBlocks: any[], actBlocks: any[]) => {
    if (!fullData) return;
    try {
      // Use the exact same dynamic URL logic as the load function
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/cv-data' 
        : '/api/cv-data';

      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fullData, piLibraryBlocks: libBlocks, piActiveBlocks: actBlocks })
      });
    } catch (err) {
      console.error("Failed to save");
    }
  };

  // Background Auto-Save (Waits 3.5 seconds after dragging/typing)
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => saveToServer(piLibraryBlocks, piActiveBlocks), 3500);
      return () => clearTimeout(timer);
    }
  }, [piLibraryBlocks, piActiveBlocks, isLoaded]);

  // --- BUCKET CREATION ---
  const addBucket = (category: string) => {
    const newBucket = {
      id: 'pi-bucket-' + Date.now(),
      category,
      title: category === 'Projects' ? 'New Project Name' : `${category} Bucket`,
      tags: ['draft'],
      questions: [
        { id: 'q-' + Date.now(), q: 'Type your question here...', a: 'Type your answer here...' }
      ]
    };
    setPiLibraryBlocks([newBucket, ...piLibraryBlocks]);
  };

  // --- DRAG & DROP LOGIC ---
  const onBlockDragStart = (e: React.DragEvent, id: string) => {
    setDraggedBlockId(id); e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  };
  const onQuestionDrop = (e: React.DragEvent, targetBucketId: string, targetQId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents the block drop logic from accidentally firing
    if (!draggedQuestion) return;

    const { bucketId: sourceBucketId, qId: sourceQId } = draggedQuestion;
    
    // Safety check: Prevent doing anything if dropped on itself
    if (sourceBucketId === targetBucketId && sourceQId === targetQId) {
      setDraggedQuestion(null);
      return;
    }

    // Deep clone the array to guarantee React triggers a visual re-render
    const newActive = piActiveBlocks.map(b => ({ ...b, questions: [...b.questions] }));
    
    const sourceBucket = newActive.find(b => b.id === sourceBucketId);
    const targetBucket = newActive.find(b => b.id === targetBucketId);
    
    if (sourceBucket && targetBucket) {
      // Find BOTH indices BEFORE removing anything so the math doesn't break
      const sourceIdx = sourceBucket.questions.findIndex((q: any) => q.id === sourceQId);
      const targetIdx = targetBucket.questions.findIndex((q: any) => q.id === targetQId);
      
      if (sourceIdx > -1 && targetIdx > -1) {
        // 1. Remove the item from its original spot
        const [movedQ] = sourceBucket.questions.splice(sourceIdx, 1);
        // 2. Insert it into the perfectly calculated target spot
        targetBucket.questions.splice(targetIdx, 0, movedQ);
        setPiActiveBlocks(newActive);
      }
    }
    setDraggedQuestion(null);
  };

  const onDropZone = (e: React.DragEvent, zone: 'active' | 'library') => {
    e.preventDefault();
    if (!draggedBlockId) return;
    
    const inActive = piActiveBlocks.find(b => b.id === draggedBlockId);
    const inLibrary = piLibraryBlocks.find(b => b.id === draggedBlockId);

    if (zone === 'active' && inLibrary) {
      setPiLibraryBlocks(piLibraryBlocks.filter(b => b.id !== draggedBlockId));
      setPiActiveBlocks([...piActiveBlocks, inLibrary]);
    } else if (zone === 'library' && inActive) {
      setPiActiveBlocks(piActiveBlocks.filter(b => b.id !== draggedBlockId));
      setPiLibraryBlocks([...piLibraryBlocks, inActive]);
    }
    setDraggedBlockId(null);
  };

  // --- NESTED EDITING LOGIC ---
  const updateBucketTitle = (id: string, newTitle: string) => {
    const activeIdx = piActiveBlocks.findIndex(b => b.id === id);
    if (activeIdx > -1) {
      const newActive = [...piActiveBlocks];
      newActive[activeIdx].title = newTitle;
      setPiActiveBlocks(newActive);
      return;
    }
    const libIdx = piLibraryBlocks.findIndex(b => b.id === id);
    if (libIdx > -1) {
      const newLib = [...piLibraryBlocks];
      newLib[libIdx].title = newTitle;
      setPiLibraryBlocks(newLib);
    }
  };

  const updateQA = (bucketId: string, qId: string, field: 'q' | 'a', text: string) => {
    let processedText = text;
    
    // Auto-wrap bare tables in collapsible <details> tags
    if (processedText.includes('<table')) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(processedText, 'text/html');
        let modified = false;
        
        doc.querySelectorAll('table').forEach(table => {
          // Check if it's not already wrapped in a details tag
          if (table.parentElement && table.parentElement.tagName.toLowerCase() !== 'details') {
            const details = doc.createElement('details');
            const summary = doc.createElement('summary');
            summary.innerHTML = '📊 Pasted Table Data (Click to expand)';
            summary.setAttribute('contenteditable', 'false'); // Prevents browser from treating the button as typed text
            
            // --- INJECT RESIZABLE COLUMNS FOR EXCEL ---
            // Wraps the first row in resizable divs to bypass the browser's table-cell block
            const firstRow = table.querySelector('tr');
            if (firstRow) {
              firstRow.querySelectorAll('td, th').forEach(cell => {
                const htmlCell = cell as HTMLElement; // Tell TypeScript this is an HTMLElement
                const text = htmlCell.innerHTML;
                htmlCell.innerHTML = `<div style="resize: horizontal; overflow: hidden; min-width: 50px; width: 150px; padding-right: 5px;">${text}</div>`;
                htmlCell.style.backgroundColor = '#f1f5f9';
                htmlCell.style.fontWeight = 'bold';
              });
            }
            // ------------------------------------------
            
            // Wrap the table
            table.parentElement.insertBefore(details, table);
            details.appendChild(summary);
            details.appendChild(table);
            
            // Automatically add TWO empty, clickable lines after the table
            const spacer1 = doc.createElement('div');
            spacer1.innerHTML = '<br>';
            const spacer2 = doc.createElement('div');
            spacer2.innerHTML = '<br>';
            
            // Insert them sequentially right after the collapsed table
            details.insertAdjacentElement('afterend', spacer1);
            spacer1.insertAdjacentElement('afterend', spacer2);
            
            modified = true;
          }
        });
        
        if (modified) processedText = doc.body.innerHTML;
      } catch (e) {
        console.error("Table parse error", e);
      }
    }

    const newActive = [...piActiveBlocks];
    const bucket = newActive.find(b => b.id === bucketId);
    if (!bucket) return;
    const qItem = bucket.questions.find((q: any) => q.id === qId);
    if (qItem) qItem[field] = processedText;
    setPiActiveBlocks(newActive);
  };

  const addQuestionToBucket = (bucketId: string) => {
    const newActive = [...piActiveBlocks];
    const bucketIdx = newActive.findIndex(b => b.id === bucketId);
    if (bucketIdx > -1) {
      newActive[bucketIdx].questions.push({ id: 'q-' + Date.now(), q: 'New Question', a: '' });
      setPiActiveBlocks(newActive);
    }
  };

  const removeQuestion = (bucketId: string, qId: string) => {
    const newActive = [...piActiveBlocks];
    const bucketIdx = newActive.findIndex(b => b.id === bucketId);
    if (bucketIdx > -1) {
      newActive[bucketIdx].questions = newActive[bucketIdx].questions.filter((q: any) => q.id !== qId);
      setPiActiveBlocks(newActive);
    }
  };

  const toggleTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLib = piLibraryBlocks.map(b => {
      if (b.id === id) return { ...b, tags: b.tags.includes('finalised') ? ['draft'] : ['finalised'] };
      return b;
    });
    setPiLibraryBlocks(newLib);
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500 bg-gray-50">Loading PI Workspace...</div>;

  return (
    <main className="text-black bg-gray-50 min-h-screen py-8 flex relative overflow-x-hidden">
      
      <style>{`
        /* Styles to make pasted Excel tables look beautiful */
        .pi-editor table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; background: white; }
        .pi-editor th, .pi-editor td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; word-wrap: break-word; }
        .pi-editor td { color: #334155; }
        
        /* Auto-collapse table styles */
        .pi-editor details { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 8px; margin: 10px 0; overflow-x: auto; }
        .pi-editor summary { font-weight: 700; color: #2563eb; cursor: pointer; font-size: 12px; outline: none; user-select: none; }
      `}</style>

      {/* ================= LEFT SIDE: PI LIBRARY ================= */}
      <div 
        className={`fixed left-4 top-4 bg-white shadow-xl border border-blue-200 rounded-lg z-50 h-[95vh] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80 p-4' : 'w-16 p-2 items-center'}`}
        onDragOver={onDragOver} 
        onDrop={(e) => onDropZone(e, 'library')}
      >
        {!isSidebarOpen ? (
          <button onClick={() => setIsSidebarOpen(true)} className="mt-2 bg-blue-100 hover:bg-blue-200 text-blue-800 p-3 rounded-lg font-bold shadow-sm flex flex-col items-center gap-2" title="Expand Library">
            <span>▶</span>
            <span className="text-[10px] uppercase tracking-widest mt-1" style={{ writingMode: 'vertical-rl' }}>Library</span>
          </button>
        ) : (
          <>
            {/* Header & Back Button */}
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="font-bold text-gray-800 text-sm">PI Prep Library</h2>
              <div className="flex gap-2">
                <button onClick={() => setIsSidebarOpen(false)} className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold shadow-sm transition-colors border border-blue-200">
                  ◀ Collapse
                </button>
                <Link href="/" className="text-[10px] bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded font-bold text-gray-700 shadow-sm transition-colors border border-gray-200">
                  ← Back to CV
                </Link>
              </div>
            </div>

        {/* Add Bucket Buttons */}
        <div className="flex flex-wrap gap-2 font-sans text-xs mb-3 border-b pb-3">
          <button onClick={() => addBucket('Internship')} className="bg-blue-100 text-blue-800 px-2 py-1.5 rounded font-bold hover:bg-blue-200">+ Internship</button>
          <button onClick={() => addBucket('Projects')} className="bg-purple-100 text-purple-800 px-2 py-1.5 rounded font-bold hover:bg-purple-200">+ Projects</button>
          <button onClick={() => addBucket('Others')} className="bg-orange-100 text-orange-800 px-2 py-1.5 rounded font-bold hover:bg-orange-200">+ Others</button>
          <button onClick={() => addBucket('HR')} className="bg-green-100 text-green-800 px-2 py-1.5 rounded font-bold hover:bg-green-200">+ HR</button>
        </div>

        {/* Drafts / Finalised Tabs */}
        <div className="flex font-sans text-[10px] font-bold mb-2 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setPiTab('draft')} className={`flex-1 py-1.5 rounded-md transition-all ${piTab === 'draft' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Drafts</button>
          <button onClick={() => setPiTab('finalised')} className={`flex-1 py-1.5 rounded-md transition-all ${piTab === 'finalised' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>Finalised</button>
        </div>

        {/* Draggable Category List */}
        <div className="flex-1 overflow-y-auto space-y-2 bg-blue-50/50 p-2 rounded border border-dashed border-blue-200">
          {['Internship', 'Projects', 'Others', 'HR'].map(cat => {
            const categoryItems = piLibraryBlocks.filter(b => b.category === cat && (b.tags || []).includes(piTab));
            if (categoryItems.length === 0) return null;
            
            return (
              <details key={cat} className="group rounded border border-blue-200 shadow-sm bg-white overflow-hidden" open>
                <summary className="flex justify-between items-center p-2 cursor-pointer font-bold text-xs text-blue-900 bg-blue-100 hover:bg-blue-200 transition-colors list-none">
                  <span className="uppercase tracking-wider">{cat} ({categoryItems.length})</span>
                </summary>
                
                <div className="p-2 space-y-2 bg-blue-50/30">
                  {categoryItems.map(block => (
                    <div 
                      key={block.id} 
                      draggable 
                      onDragStart={(e) => onBlockDragStart(e, block.id)} 
                      className="bg-white p-2 rounded shadow-sm border border-gray-300 cursor-move hover:border-blue-500 transition-colors relative group/libitem select-none"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{block.category}</span>
                        <button 
                          onClick={(e) => toggleTag(block.id, e)} 
                          className={`text-[9px] px-1.5 py-0.5 rounded border font-bold transition ${block.tags?.includes('finalised') ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}
                        >
                          Fin
                        </button>
                      </div>
                      <div className="text-xs font-serif font-bold text-black truncate" dangerouslySetInnerHTML={{__html: block.title}} />
                      <div className="text-[10px] text-gray-500 mt-1 font-bold">{block.questions?.length || 0} Questions inside</div>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
          {piLibraryBlocks.filter(b => (b.tags || []).includes(piTab)).length === 0 && (
            <div className="text-xs text-gray-400 text-center mt-4 font-bold">No buckets found in this tab.</div>
          )}
        </div>
        </>
      )}
      </div>

      {/* ================= RIGHT SIDE: A4 CANVAS DROPZONE ================= */}
      <div className={`transition-all duration-300 flex-1 p-4 ${isSidebarOpen ? 'ml-[340px] max-w-4xl' : 'ml-[80px] max-w-full w-full pr-8'}`}>
        <div 
          className="min-h-[90vh] bg-transparent pb-24"
          onDragOver={onDragOver} 
          onDrop={(e) => onDropZone(e, 'active')}
        >
          {piActiveBlocks.length === 0 && (
            <div className="mt-8 p-12 border-4 border-dashed border-gray-300 text-center text-gray-400 font-sans font-bold text-xl rounded-xl bg-white shadow-sm">
              Drag PI Buckets Here from the Library to Prepare Answers
            </div>
          )}

          {piActiveBlocks.map(block => (
            <div key={block.id} className="bg-white shadow-xl border border-gray-300 rounded-xl mb-6 p-6 relative group/drag animate-in fade-in zoom-in-95 duration-200">
              
              {/* Drag Handle */}
              <div 
                draggable 
                onDragStart={(e) => onBlockDragStart(e, block.id)} 
                className="absolute -left-6 top-6 cursor-move opacity-0 group-hover/drag:opacity-100 bg-blue-100 text-blue-800 px-1 py-0.5 rounded shadow text-xs font-bold" 
                title="Drag back to Library"
              >
                ✥
              </div>
              
              {/* Bucket Title (Editable) */}
              <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-3 mb-5">
                  <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-widest">{block.category}</span>
                  <div 
                    contentEditable 
                    suppressContentEditableWarning 
                    onBlur={(e) => updateBucketTitle(block.id, e.currentTarget.innerHTML)} 
                    dangerouslySetInnerHTML={{__html: block.title}} 
                    className="text-xl font-bold outline-none focus:bg-yellow-50 w-full rounded p-1 transition-colors" 
                  />
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {block.questions.map((item: any) => (
                  <details 
                    key={item.id} 
                    className="relative group/q bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-all marker:hidden [&::-webkit-details-marker]:hidden"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; }}
                    onDrop={(e) => onQuestionDrop(e, block.id, item.id)}
                  >
                    
                    {/* Drag Question Handle */}
                    <div 
                      draggable 
                      onDragStart={(e) => {
                        e.stopPropagation();
                        setDraggedQuestion({ bucketId: block.id, qId: item.id });
                        e.dataTransfer.effectAllowed = 'move';
                      }} 
                      className="absolute -left-2 top-4 cursor-move opacity-0 group-hover/q:opacity-100 bg-gray-200 text-gray-600 px-1 py-0.5 rounded shadow-sm text-xs font-bold z-10" 
                      title="Drag to reorder question"
                    >
                      ↕
                    </div>

                    {/* Delete Question Button */}
                    <button 
                      onClick={() => removeQuestion(block.id, item.id)} 
                      className="absolute -right-3 -top-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover/q:opacity-100 transition-opacity shadow-sm text-xs font-bold z-10"
                    >
                      ×
                    </button>

                    {/* Question Field (Click to Expand/Collapse) */}
                    <summary className="font-serif font-bold text-lg text-black flex items-start cursor-pointer list-none outline-none">
                        {/* Expand/Collapse Arrow */}
                        <span className="text-blue-400 mr-3 mt-1.5 text-[10px] transition-transform group-open/q:rotate-90 flex-shrink-0">▶</span>
                        <span className="text-blue-600 mr-2 mt-1 flex-shrink-0">Q:</span>
                        <div 
                          contentEditable 
                          suppressContentEditableWarning 
                          onClick={(e) => e.stopPropagation()} // Prevents typing from collapsing the view
                          onBlur={(e) => updateQA(block.id, item.id, 'q', e.currentTarget.innerHTML)} 
                          dangerouslySetInnerHTML={{__html: item.q}} 
                          className="pi-editor outline-none focus:bg-yellow-50 w-full p-1 rounded transition-colors cursor-text" 
                        />
                    </summary>
                    
                    {/* Answer Field (Hidden until expanded) */}
                    <div className="font-serif text-[15px] text-gray-800 bg-blue-50/30 rounded-lg border border-blue-100 flex items-start p-3 mt-4 ml-6">
                        <span className="text-green-600 font-bold mr-2">A:</span>
                        <div 
                          contentEditable 
                          suppressContentEditableWarning 
                          onBlur={(e) => updateQA(block.id, item.id, 'a', e.currentTarget.innerHTML)} 
                          dangerouslySetInnerHTML={{__html: item.a}} 
                          className="pi-editor outline-none w-full min-h-[80px] focus:bg-white focus:shadow-sm p-1 rounded whitespace-pre-wrap transition-colors leading-relaxed" 
                        />
                    </div>
                  </details>
                ))}
              </div>

              {/* Add New Question to Bucket */}
              <button 
                onClick={() => addQuestionToBucket(block.id)} 
                className="mt-6 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm w-full border border-gray-200 border-dashed"
              >
                + Add Another Question to "{block.title.replace(/<[^>]+>/g, '')}"
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}