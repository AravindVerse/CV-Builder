import React from 'react';

export default function PIBankPanel({ piBankBlocks, setPiBankBlocks, piTab, setPiTab }: any) {
  return (
    <div className="flex flex-col h-full">
      
      {/* Category Add Buttons */}
      <div className="flex flex-wrap gap-2 font-sans text-xs mb-3 border-b pb-3">
        <button onClick={() => setPiBankBlocks([...piBankBlocks, { id: 'pi-'+Date.now(), category: 'HR', tags: ['draft'], question: 'New HR Question', answer: '' }])} className="bg-blue-100 text-blue-800 px-2 py-1.5 rounded font-bold hover:bg-blue-200">+ HR</button>
        <button onClick={() => setPiBankBlocks([...piBankBlocks, { id: 'pi-'+Date.now(), category: 'Projects', tags: ['draft'], question: 'New Project Question', answer: '' }])} className="bg-purple-100 text-purple-800 px-2 py-1.5 rounded font-bold hover:bg-purple-200">+ Projects</button>
        <button onClick={() => setPiBankBlocks([...piBankBlocks, { id: 'pi-'+Date.now(), category: 'Technical', tags: ['draft'], question: 'New Technical Question', answer: '' }])} className="bg-green-100 text-green-800 px-2 py-1.5 rounded font-bold hover:bg-green-200">+ Technical</button>
      </div>

      {/* Draft & Finalised Tabs */}
      <div className="flex font-sans text-[10px] font-bold mb-2 bg-gray-100 rounded-lg p-1">
        <button onClick={() => setPiTab('draft')} className={`flex-1 py-1.5 rounded-md transition-all ${piTab === 'draft' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Drafts</button>
        <button onClick={() => setPiTab('finalised')} className={`flex-1 py-1.5 rounded-md transition-all ${piTab === 'finalised' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>Finalised</button>
      </div>

      {/* PI Questions List */}
      <div className="flex-1 overflow-y-auto space-y-3 bg-blue-50/50 p-2 rounded border border-dashed border-blue-200">
        {piBankBlocks.filter((b: any) => (b.tags || []).includes(piTab)).length === 0 && (
          <div className="text-xs text-gray-400 text-center mt-4 font-bold">No questions found in this tab.</div>
        )}

        {piBankBlocks.filter((b: any) => (b.tags || []).includes(piTab)).map((block: any) => (
          <div key={block.id} className="bg-white p-3 rounded shadow-sm border border-gray-300 relative group/libitem flex flex-col gap-2">
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{block.category}</span>
              <button 
                onClick={() => {
                  const newBlocks = piBankBlocks.map((b: any) => 
                    b.id === block.id ? { ...b, tags: b.tags.includes('finalised') ? ['draft'] : ['finalised'] } : b
                  );
                  setPiBankBlocks(newBlocks);
                }} 
                className={`text-[9px] px-1.5 py-0.5 rounded border font-bold transition ${block.tags?.includes('finalised') ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
              >
                Fin
              </button>
            </div>

            <div className="font-serif font-bold text-sm text-black">
               <span className="text-blue-600 mr-1">Q:</span>
               <span 
                  className="outline-none" 
                  contentEditable 
                  suppressContentEditableWarning 
                  onBlur={(e) => {
                    const newBlocks = [...piBankBlocks];
                    const idx = newBlocks.findIndex((b: any) => b.id === block.id);
                    newBlocks[idx].question = e.currentTarget.innerHTML;
                    setPiBankBlocks(newBlocks);
                  }} 
                  dangerouslySetInnerHTML={{__html: block.question}} 
               />
            </div>

            <div className="font-serif text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 min-h-[60px]">
               <span className="text-green-600 font-bold mr-1">A:</span>
               <span 
                  className="outline-none block mt-1" 
                  contentEditable 
                  suppressContentEditableWarning 
                  onBlur={(e) => {
                    const newBlocks = [...piBankBlocks];
                    const idx = newBlocks.findIndex((b: any) => b.id === block.id);
                    newBlocks[idx].answer = e.currentTarget.innerHTML;
                    setPiBankBlocks(newBlocks);
                  }} 
                  dangerouslySetInnerHTML={{__html: block.answer}} 
               />
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}