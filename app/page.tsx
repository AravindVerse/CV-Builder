"use client";

import React, { useState, useRef, useEffect } from 'react';
import LicenseGate from "./components/LicenseGate";
export default function ResumePage() {
  // --- EXACT PIXEL POSITIONING (STRICTLY PRESERVED) ---
  const [marginTopPx, setMarginTopPx] = useState(16); 
  const [headerHeightPx, setHeaderHeightPx] = useState(55); 
  const [blackBarHeightPx, setBlackBarHeightPx] = useState(20); 
  const [sectionHeightPx, setSectionHeightPx] = useState(18.3); 
  const [companyHeightPx, setCompanyHeightPx] = useState(13.975); 
  const [projectTitleHeightPx, setProjectTitleHeightPx] = useState(13.5); 

  // --- INDEPENDENT MARGIN CALIBRATION ---
  const [marginBottomMm, setMarginBottomMm] = useState(3); // Reduced to give you way more room!
  const [marginLeftMm, setMarginLeftMm] = useState(8);
  const [marginRightMm, setMarginRightMm] = useState(8);
  
  // --- VERTICAL SPACING CALIBRATION ---
  const [gapBannerTablePx, setGapBannerTablePx] = useState(4);   
  const [leftColWidth, setLeftColWidth] = useState(15); 
  const [yearColWidth, setYearColWidth] = useState(5.835); 

  // --- TYPOGRAPHY ---
  const [fontSizePx, setFontSizePx] = useState(13); 
  const [nameFontSizePx, setNameFontSizePx] = useState(21); 
  const [subHeaderFontSizePx, setSubHeaderFontSizePx] = useState(13); 
  const [fontFamily, setFontFamily] = useState('"EB Garamond", Garamond, "Cormorant Garamond", serif'); 
  const [boldWeight, setBoldWeight] = useState(700); 
  const [lineHeight, setLineHeight] = useState(1); 

  // --- BULLET CELL PADDING ---
  const [padBulletCellTopPx, setPadBulletCellTopPx] = useState(2.5); 
  const [padBulletCellBottomPx, setPadBulletCellBottomPx] = useState(2.5); 

  // --- BULLET CONTROL STATE ---
  const [textIndentPx, setTextIndentPx] = useState(14); 
  const [bulletLeftPx, setBulletLeftPx] = useState(4.5); 
  const [bulletTopPx, setBulletTopPx] = useState(4.5); 
  const [bulletSizePx, setBulletSizePx] = useState(3.8); 
  const [bulletGapPx, setBulletGapPx] = useState(2); 

  // --- UI STATES ---
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureStart, setMeasureStart] = useState<{x: number, y: number} | null>(null);
  const [measureCurrent, setMeasureCurrent] = useState<{x: number, y: number} | null>(null);

  // --- 🆕 ADVANCED POINT TOGGLE ---
  const [showHiddenPoints, setShowHiddenPoints] = useState(false);

  // --- AUTO-SAVE FLAG ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [cvScale, setCvScale] = useState(1);


  // --- CORE CONTENT STATES ---
  const [headerData, setHeaderData] = useState({
    name: "Aravind Tupakula", line1: "Male, 21 years", line2: "MBA, Batch 25 - 27",
    banner: "Sustainability | Power BI | 3D Artist | Botanophile"
  });

  const [academics, setAcademics] = useState([
    { degree: "MBA", institute: "Indian Institute of Management, Mumbai", score: "Pursuing", year: "2027" },
    { degree: "B.Sc (Computer Science)", institute: "SVR Degree College, Sattenapalli", score: "76.46%", year: "2025" },
    { degree: "Class XII", institute: "FIITJEE Junior College, Vijayawada", score: "84.30%", year: "2021" },
    { degree: "Class X", institute: "Jawahar Navodaya Vidyalaya, Maddirala", score: "80.02%", year: "2019" }
  ]);

  // --- CMS STATES ---
  const [pointLibrary, setPointLibrary] = useState<string[]>([]);
  
  // Helper to ensure bullets are objects with ID and hidden states (Backwards Compatibility)
  const formatPt = (pt: any) => typeof pt === 'string' ? { id: Math.random().toString(), text: pt, hidden: false } : pt;

  const [libraryBlocks, setLibraryBlocks] = useState<any[]>([
    { id: 'int-1', type: 'internship', company: "Company Name", date: "Month'YY-Month'YY", title: "Project Title: Your Project Name", details: [""].map(formatPt), achievements: [""].map(formatPt) },
    { id: 'proj-1', type: 'project', company: "Organization Name", date: "Duration", title: "Project Title: Your Project Name", details: [""].map(formatPt), achievements: [""].map(formatPt) },
    { id: 'por-1', type: 'por', role: "Your Role", bullets: [""].map(formatPt), years: "YYYY<br/>YYYY" },
    { id: 'awa-1', type: 'award', category: "Category Name", bullets: [""].map(formatPt), years: "YYYY<br/>YYYY" }
  ]);

  // --- 🆕 CV VERSIONS STATE ---
  const [cvVersions, setCvVersions] = useState<any[]>([
    { id: 'default', name: 'Master CV', blocks: [] }
  ]);
  const [currentCvId, setCurrentCvId] = useState<string>('default');
  
  const [activeBlocks, setActiveBlocks] = useState<any[]>([]); 
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

   // --- 🆕 LIBRARY ITEM MENU & IN-APP MODAL STATE ---
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const executeDeleteLibraryItem = () => {
    if (itemToDelete) {
      setLibraryBlocks(libraryBlocks.filter(b => b.id !== itemToDelete));
      setItemToDelete(null);
    }
  };
  
  // 🆕 NEW: Point level drag state
  const [draggedPoint, setDraggedPoint] = useState<{ blockId: string, field: string, index: number } | null>(null);
  
  // 🆕 TABS & RIGHT PANEL UI STATES
  const [rightPanelMode, setRightPanelMode] = useState<'library' | 'cvmaker'>('library');
  const [newCvName, setNewCvName] = useState('');
  const [libraryTab, setLibraryTab] = useState<'draft' | 'finalised' | 'iim-mumbai'>('draft');

  // --- NEW CV SWITCHING LOGIC ---
  const handleSwitchCv = (newCvId: string) => {
    // 1. Save current canvas to the current CV profile
    const updatedVersions = cvVersions.map(cv => 
      cv.id === currentCvId ? { ...cv, blocks: activeBlocks } : cv
    );
    setCvVersions(updatedVersions);
    
    // 2. Load the new CV profile onto the canvas
    const nextCv = updatedVersions.find(cv => cv.id === newCvId);
    setActiveBlocks(nextCv ? nextCv.blocks : []);
    setCurrentCvId(newCvId);
  };

  const handleCreateCv = () => {
    if (!newCvName.trim()) return;
    const newId = 'cv-' + Date.now();
    // Save current canvas first
    const updatedVersions = cvVersions.map(cv => 
      cv.id === currentCvId ? { ...cv, blocks: activeBlocks } : cv
    );
    // Add new CV and switch to it instantly
    setCvVersions([...updatedVersions, { id: newId, name: newCvName, blocks: [] }]);
    setActiveBlocks([]);
    setCurrentCvId(newId);
    setNewCvName('');
  };

  const handleDeleteCv = () => {
    if (currentCvId === 'default') return; // Protect Master CV from deletion
    if (!window.confirm("Are you sure you want to delete this CV version?")) return;
    
    const updatedVersions = cvVersions.filter(cv => cv.id !== currentCvId);
    setCvVersions(updatedVersions);
    
    // Auto-switch back to Master CV
    const masterCv = updatedVersions.find(cv => cv.id === 'default');
    setActiveBlocks(masterCv ? masterCv.blocks : []);
    setCurrentCvId('default');
  };

  // --- AUTO-LOAD VIA API ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // Dev mode uses the Python server on 5000, production (.exe) uses the relative path
        const API_URL = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5000/api/cv-data' 
          : '/api/cv-data';
          
        const response = await fetch(API_URL);
        const json = await response.json();
        if (json.success && json.data) {
          const d = json.data;
          // Auto-migrate strings to objects on load just in case
          const parsePoints = (blocks: any[]) => blocks.map(b => {
            const nb = {...b};
            if(nb.details) nb.details = nb.details.map(formatPt);
            if(nb.achievements) nb.achievements = nb.achievements.map(formatPt);
            if(nb.bullets) nb.bullets = nb.bullets.map(formatPt);
            
            // 🆕 TAG MIGRATION: Convert old 'status' string to new 'tags' array
            if (nb.status && !nb.tags) {
              nb.tags = [nb.status];
              delete nb.status;
            } else if (!nb.tags) {
              nb.tags = ['draft']; // default fallback
            }
            return nb;
          });
          
          if (d.libraryBlocks) setLibraryBlocks(parsePoints(d.libraryBlocks));
          
          // 🆕 CV VERSIONS MIGRATION
          if (d.cvVersions) {
            // Load new multi-CV structure
            setCvVersions(d.cvVersions);
            const loadedActive = d.cvVersions.find((cv: any) => cv.id === (d.currentCvId || 'default'))?.blocks || [];
            setActiveBlocks(parsePoints(loadedActive));
            if (d.currentCvId) setCurrentCvId(d.currentCvId);
          } else if (d.activeBlocks) {
            // Legacy migration: Move existing active blocks into the new Master CV structure
            const legacyActive = parsePoints(d.activeBlocks);
            setActiveBlocks(legacyActive);
            setCvVersions([{ id: 'default', name: 'Master CV', blocks: legacyActive }]);
            setCurrentCvId('default');
          }
          
          if (d.academics) setAcademics(d.academics);
          if (d.headerData) setHeaderData(d.headerData);
          if (d.pointLibrary) setPointLibrary(d.pointLibrary);
        }
      } catch (err) {
        console.error("Failed to load CV data from API");
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // --- AUTO-SAVE VIA API ---
  const saveToServer = async () => {
    try {
      // 🆕 Sync the current canvas (activeBlocks) back into the cvVersions array before saving
      const updatedVersions = cvVersions.map(cv => 
        cv.id === currentCvId ? { ...cv, blocks: activeBlocks } : cv
      );
      
      await fetch('/api/cv-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pointLibrary, 
          libraryBlocks, 
          cvVersions: updatedVersions, 
          currentCvId, 
          academics, 
          headerData 
        })
      });
    } catch (err) {}
  };

  // --- TRUE BACKGROUND AUTO-SAVE ---
  useEffect(() => {
    if (isLoaded) {
      // Waits 5.5 seconds after the user stops typing/dragging before saving
      // This prevents spamming the JSON file on every single keystroke
      const autoSaveTimer = setTimeout(() => {
        saveToServer();
      }, 5500); 
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [isLoaded, pointLibrary, libraryBlocks, activeBlocks, cvVersions, currentCvId, academics, headerData]);

  // --- SMARTER AUTO-SCALE FOR 13-INCH LAPTOPS ---
  useEffect(() => {
    // We only run this ONCE on load so it doesn't fight your manual zoom controls
    const width = window.innerWidth;
    
    if (width < 1380 && width > 900) {
      // 13-inch laptop detected. Calculate available space between panels and shrink CV to fit.
      const availableWidth = width - 640; 
      setCvScale(availableWidth / 820);
    } else if (width <= 900) {
      // Very small screens (tablets/half-windows) force Focus Mode immediately
      setIsFocusMode(true);
      setCvScale(width / 820);
    } else {
      // Large desktop monitors get 100% scale
      setCvScale(1);
    }
  }, []);

  // --- KEYBOARD SHORTCUTS (Ctrl+F & Esc) ---
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 1. CTRL + F to ENTER Focus Mode
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault(); // This blocks the embedded browser's default search bar
        
        setIsFocusMode(prevFocus => {
          if (!prevFocus) {
            // Auto-zoom in when entering Focus Mode on larger screens
            if (window.innerWidth > 1000) setCvScale(1.55);
            return true;
          }
          return prevFocus;
        });
      }
      
      // 2. ESC to EXIT Focus Mode
      if (e.key === 'Escape') {
        setIsFocusMode(prevFocus => {
          if (prevFocus) {
            // Re-shrink to fit between panels when exiting on smaller laptops
            if (window.innerWidth < 1380) {
              setCvScale((window.innerWidth - 640) / 820);
            } else {
              setCvScale(1);
            }
            return false;
          }
          return prevFocus;
        });
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // --- CLEAN PASTE INTERCEPTOR (STRIPS EVERYTHING EXCEPT BOLD) ---
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // Only trigger if the user is pasting inside one of our CV text fields
      if (target && target.isContentEditable) {
        e.preventDefault();
        
        const textHtml = e.clipboardData?.getData('text/html');
        const textPlain = e.clipboardData?.getData('text/plain');

        if (textHtml) {
          // 1. Remove all HTML tags EXCEPT <b> and <strong>
          // 2. Remove all inline styles, classes, or attributes from the remaining bold tags
          const cleanHTML = textHtml
            .replace(/<(?!\/?(b|strong)\b)[^>]+>/ig, '') 
            .replace(/<\/?(b|strong)[^>]*>/ig, match => match.startsWith('</') ? '</b>' : '<b>');
            
          document.execCommand('insertHTML', false, cleanHTML);
        } else if (textPlain) {
          // Fallback if there is no HTML payload (e.g., pasting from Notepad)
          document.execCommand('insertText', false, textPlain);
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener('click', closeMenu);
    
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
      window.removeEventListener('click', closeMenu);
    };
  }, []);
  
  // --- PRINT LOGIC (Fixed for .exe functionality) ---
  const handlePrint = async () => {
    // 1. Force save before printing
    await saveToServer();
    
    // 2. Temporarily set zoom to 100% so the print is actual A4 size
    const previousScale = cvScale;
    setCvScale(1);
    
    // 3. Wait a moment for React to resize the CV, then trigger native print
    setTimeout(() => {
      window.print();
      
      // 4. Restore the user's zoom level right after the print dialog opens
      setTimeout(() => {
        setCvScale(previousScale);
      }, 500);
    }, 300);
  };

  // --- BLOCK DRAG & DROP LOGIC ---
  const onBlockDragStart = (e: React.DragEvent, id: string) => {
    setDraggedBlockId(id); e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  };

  const onDropZone = (e: React.DragEvent, zone: 'active' | 'library') => {
    e.preventDefault();
    if (!draggedBlockId) return;
    const inActive = activeBlocks.find(b => b.id === draggedBlockId);
    const inLibrary = libraryBlocks.find(b => b.id === draggedBlockId);
    
    if (zone === 'active' && inLibrary) {
      if (rightPanelMode === 'cvmaker') {
        // CV MAKER MODE: Clone the item
        const clonedBlock = JSON.parse(JSON.stringify(inLibrary)); 
        clonedBlock.id = clonedBlock.id + '-' + Date.now(); 
        setActiveBlocks([...activeBlocks, clonedBlock]);
      } else {
        // LIBRARY MODE: Move the item (remove from side panel)
        setLibraryBlocks(libraryBlocks.filter(b => b.id !== draggedBlockId));
        setActiveBlocks([...activeBlocks, inLibrary]);
      }
    } else if (zone === 'library' && inActive) {
      if (rightPanelMode === 'cvmaker') {
        // CV MAKER MODE: Delete clone when dragged off canvas
        setActiveBlocks(activeBlocks.filter(b => b.id !== draggedBlockId));
      } else {
        // LIBRARY MODE: Move item back to the library panel
        setActiveBlocks(activeBlocks.filter(b => b.id !== draggedBlockId));
        setLibraryBlocks([...libraryBlocks, inActive]);
      }
    }
    setDraggedBlockId(null);
  };

  // --- 🆕 POINT DRAG & DROP LOGIC (WITH ZOOM GHOST) ---
  const onPointDragStart = (e: React.DragEvent, blockId: string, field: string, index: number, textHtml: string) => {
    e.stopPropagation();
    setDraggedPoint({ blockId, field, index });
    e.dataTransfer.effectAllowed = 'move';
    
    // Create the zoomed "preview" element
    const ghost = document.createElement("div");
    ghost.innerHTML = textHtml;
    ghost.style.position = "absolute";
    ghost.style.top = "-1000px";
    ghost.style.background = "white";
    ghost.style.border = "2px solid #3b82f6";
    ghost.style.padding = "10px";
    ghost.style.borderRadius = "8px";
    ghost.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.2)";
    ghost.style.transform = "scale(1.15)"; // The "Little Zoom"
    ghost.style.fontFamily = fontFamily;
    ghost.style.fontSize = `${fontSizePx}px`;
    ghost.style.zIndex = "9999";
    document.body.appendChild(ghost);
    
    e.dataTransfer.setDragImage(ghost, 20, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const onPointDrop = (e: React.DragEvent, targetBlockId: string, targetField: string, targetIndex: number) => {
    // 🆕 FIX: If we are dragging a whole block, let the event pass through to the main canvas dropzone
    if (!draggedPoint) return; 
    
    e.stopPropagation(); e.preventDefault();
    if (draggedPoint.blockId === targetBlockId && draggedPoint.field === targetField) {
      const block = activeBlocks.find(b => b.id === targetBlockId);
      if (!block) return;
      const newPoints = [...block[targetField]];
      const [moved] = newPoints.splice(draggedPoint.index, 1);
      newPoints.splice(targetIndex, 0, moved);
      updateBlockField(targetBlockId, targetField, newPoints);
    }
    setDraggedPoint(null);
  };

  // --- CONTENT MANAGER FUNCTIONS ---
  const addAcademic = () => setAcademics([...academics, { degree: "New Degree", institute: "New Institute", score: "0%", year: "YYYY" }]);
  const addInternship = () => setLibraryBlocks([...libraryBlocks, { id: 'int-'+Date.now(), type: 'internship', tags: ['draft'], company: "Company Name", date: "Date", title: "Project Title: New Project", details: [""].map(formatPt), achievements: [""].map(formatPt) }]);
  const addProject = () => setLibraryBlocks([...libraryBlocks, { id: 'proj-'+Date.now(), type: 'project', tags: ['draft'], company: "Organization Name", date: "Duration", title: "Project Title: New Project", details: [""].map(formatPt), achievements: [""].map(formatPt) }]);
  const addPor = () => setLibraryBlocks([...libraryBlocks, { id: 'por-'+Date.now(), type: 'por', tags: ['draft'], role: "New Role", bullets: [""].map(formatPt), years: "YYYY" }]);
  const addAward = () => setLibraryBlocks([...libraryBlocks, { id: 'awa-'+Date.now(), type: 'award', tags: ['draft'], category: "Category Name", bullets: [""].map(formatPt), years: "YYYY" }]);

  const updateBlockField = (id: string, field: string, value: any) => {
    const activeIdx = activeBlocks.findIndex(b => b.id === id);
    if (activeIdx > -1) {
      const newActive = [...activeBlocks];
      newActive[activeIdx] = { ...newActive[activeIdx], [field]: value };
      setActiveBlocks(newActive);
      return;
    }
    const libIdx = libraryBlocks.findIndex(b => b.id === id);
    if (libIdx > -1) {
      const newLib = [...libraryBlocks];
      newLib[libIdx] = { ...newLib[libIdx], [field]: value };
      setLibraryBlocks(newLib);
    }
  };

  // 🆕 ADVANCED TAGGING FUNCTION (UPDATED)
  const toggleTag = (id: string, tag: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop drag event from firing
    
    const newLib = libraryBlocks.map(b => {
      if (b.id === id) {
        const currentTags = b.tags || [];
        let newTags = [...currentTags];

        if (tag === 'finalised') {
          if (currentTags.includes('finalised')) {
            // Unchecking 'finalised': Move back to draft, remove iim-mumbai
            newTags = ['draft'];
          } else {
            // Checking 'finalised': Move to final, remove draft
            newTags = ['finalised'];
          }
        } 
        else if (tag === 'iim-mumbai') {
          if (currentTags.includes('iim-mumbai')) {
            // Unchecking 'iim-mumbai': Keep finalised, remove iim-mumbai
            newTags = ['finalised'];
          } else {
            // Checking 'iim-mumbai': Keep finalised, add iim-mumbai
            newTags = ['finalised', 'iim-mumbai'];
          }
        }

        return { ...b, tags: newTags };
      }
      return b;
    });
    
    setLibraryBlocks(newLib);
  };

  // 🆕 HIDE / UNHIDE TOGGLE FUNCTION
  const togglePointVisibility = (blockId: string, field: string, index: number) => {
    const block = activeBlocks.find(b => b.id === blockId);
    if (!block) return;
    const currentBullets = [...block[field]];
    currentBullets[index].hidden = !currentBullets[index].hidden;
    updateBlockField(blockId, field, currentBullets);
  };

  // --- NESTED KEYBOARD & MOUSE HANDLERS (UPDATED FOR OBJECTS & ARROWS) ---
  const handleNestedKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, blockId: string, bulletIdx: number, field: string, sectionClass: string) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); document.execCommand('bold', false); return; }
    
    const block = activeBlocks.find(b => b.id === blockId) || libraryBlocks.find(b => b.id === blockId);
    if (!block) return;
    const currentBullets = [...block[field]];

    if (e.key === 'Enter') {
      e.preventDefault();
      currentBullets[bulletIdx].text = e.currentTarget.innerHTML;
      currentBullets.splice(bulletIdx + 1, 0, { id: Math.random().toString(), text: "", hidden: false });
      updateBlockField(blockId, field, currentBullets);
      setTimeout(() => { const els = document.querySelectorAll(`.${sectionClass}`); if (els[bulletIdx + 1]) (els[bulletIdx + 1] as HTMLElement).focus(); }, 10);
      
    } else if (e.key === 'Backspace') {
      // 🆕 FIX: Explicitly check for invisible browser <br> tags or empty whitespace
      const rawHtml = e.currentTarget.innerHTML.trim().toLowerCase();
      const rawText = e.currentTarget.textContent?.trim() || "";
      const isEmpty = rawHtml === "" || rawHtml === "<br>" || rawHtml === "<br/>" || rawText === "";
      
      if (isEmpty) {
        e.preventDefault();
        // Minimum 1 bullet safety rule is preserved here
        if (currentBullets.length > 1) {
          currentBullets.splice(bulletIdx, 1);
          updateBlockField(blockId, field, currentBullets);
          setTimeout(() => { const els = document.querySelectorAll(`.${sectionClass}`); if (els[bulletIdx - 1]) (els[bulletIdx - 1] as HTMLElement).focus(); }, 10);
        }
      }
      
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const els = document.querySelectorAll(`.${sectionClass}`);
      if (els[bulletIdx - 1]) (els[bulletIdx - 1] as HTMLElement).focus();
      
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const els = document.querySelectorAll(`.${sectionClass}`);
      if (els[bulletIdx + 1]) (els[bulletIdx + 1] as HTMLElement).focus();
    }
  };

  const handleNestedBlur = (e: React.FocusEvent<HTMLDivElement>, blockId: string, bulletIdx: number, field: string) => {
    const block = activeBlocks.find(b => b.id === blockId) || libraryBlocks.find(b => b.id === blockId);
    if (!block) return;
    const currentBullets = [...block[field]];
    currentBullets[bulletIdx].text = e.currentTarget.innerHTML;
    updateBlockField(blockId, field, currentBullets);
  };

  const handleMouseUp = () => {
    if (isMeasuring) return; 
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (toolbarRef.current) {
        toolbarRef.current.style.display = 'flex';
        toolbarRef.current.style.top = `${rect.top - 40}px`;
        toolbarRef.current.style.left = `${rect.left + (rect.width / 2) - 40}px`;
      }
    } else {
      if (toolbarRef.current) toolbarRef.current.style.display = 'none';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); document.execCommand('bold', false); }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!isMeasuring) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) { setMeasureStart({ x: e.clientX - rect.left, y: e.clientY - rect.top }); setMeasureCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top }); }
  };
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isMeasuring || !measureStart) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) setMeasureCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleCanvasMouseUp = () => { if (!isMeasuring) return; setMeasureStart(null); };

  const NumberInput = ({ val, setFn, step = "1" }: any) => (
    <input type="number" step={step} value={val} onChange={(e) => setFn(Number(e.target.value))} className="w-16 border rounded px-1 text-right ml-2" />
  );

  const activeInternships = activeBlocks.filter(b => b.type === 'internship');
  const activeProjects = activeBlocks.filter(b => b.type === 'project');
  const activePors = activeBlocks.filter(b => b.type === 'por');
  const activeAwards = activeBlocks.filter(b => b.type === 'award');

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Workspace...</div>;

  return (
    <LicenseGate>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap');
        @media print { @page { size: A4; margin: 0; } body { margin: 0; } .no-print { display: none !important; } }
        b, strong { font-weight: ${boldWeight} !important; }
        td.bg-\[\#dedede\].px-1 { padding-left: 0 !important; padding-right: 0 !important; }
        * { font-variant-ligatures: none !important; font-kerning: none !important; font-feature-settings: "liga" 0, "clig" 0, "dlig" 0, "hlig" 0, "kern" 0 !important; }
        font[size="1"] { font-size: 0.85em !important; } font[size="2"] { font-size: 0.92em !important; }
        font[size="3"] { font-size: 1.0em !important; } font[size="4"] { font-size: 1.1em !important; }
      `}</style>
      
    <main className="text-black bg-gray-50 min-h-screen py-8 print:py-0 print:bg-white flex justify-center relative overflow-x-hidden" onMouseUp={handleMouseUp} onKeyUp={handleMouseUp}>
      
      {/* FOCUS MODE & MANUAL ZOOM CONTROLS */}
      <div className="no-print fixed bottom-6 right-6 z-[200] flex items-center gap-1 bg-gray-900 p-1.5 rounded-full shadow-2xl border border-gray-700">
        <button onClick={() => setCvScale(prev => Math.max(0.3, prev - 0.1))} className="text-white hover:bg-gray-700 w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg transition-colors">−</button>
        
        <span className="text-white text-xs font-bold w-12 text-center font-mono select-none">
          {Math.round(cvScale * 100)}%
        </span>
        
        <button onClick={() => setCvScale(prev => Math.min(2.5, prev + 0.1))} className="text-white hover:bg-gray-700 w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg transition-colors">+</button>
        
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        
        <button 
          onClick={() => { 
            const enteringFocus = !isFocusMode;
            setIsFocusMode(enteringFocus);
            // Auto-zoom in slightly when entering Focus Mode for better readability!
            if (enteringFocus && window.innerWidth > 1000) {
              setCvScale(1.4);
            } else if (!enteringFocus && window.innerWidth < 1380) {
              // Re-shrink to fit between panels when exiting Focus Mode on small laptops
              setCvScale((window.innerWidth - 640) / 820);
            }
          }}
          className="text-white px-4 py-1.5 rounded-full font-bold text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          {isFocusMode ? "Exit Focus Mode" : "🔍 Focus Mode"}
        </button>
      </div>

      {/* FLOATING TOOLBAR */}
      <div ref={toolbarRef} className="no-print fixed z-[100] gap-1 bg-gray-900 text-white px-2 py-1 rounded shadow-lg border border-gray-700 items-center justify-center" style={{ display: 'none' }}>
        <button className="px-2 hover:bg-gray-700 rounded text-sm font-bold" onMouseDown={(e) => { e.preventDefault(); document.execCommand('fontSize', false, '4'); }}>A+</button>
        <button className="px-2 hover:bg-gray-700 rounded text-sm font-bold" onMouseDown={(e) => { e.preventDefault(); document.execCommand('fontSize', false, '1'); }}>A-</button>
        <div className="w-px h-4 bg-gray-600 mx-1"></div>
        <button className="px-2 hover:bg-gray-700 rounded text-sm font-bold" onMouseDown={(e) => { e.preventDefault(); document.execCommand('bold'); }}><b>B</b></button>
      </div>

      {/* 🛠️ LEFT SIDE: LAYOUT CONTROLS 🛠️ */}
      <div className={`no-print fixed left-4 top-4 w-72 bg-white p-4 shadow-xl border border-gray-200 rounded-lg z-50 max-h-[95vh] overflow-y-auto transition-transform duration-300 ${isFocusMode ? '-translate-x-[150%] pointer-events-none' : 'translate-x-0 pointer-events-auto'}`}>
        <h3 className="font-sans font-bold text-sm mb-3 border-b pb-2">Layout & Control</h3>
        
        {/* 🆕 GLOBAL VISIBILITY TOGGLE */}
        <button 
          onClick={() => setShowHiddenPoints(!showHiddenPoints)} 
          className={`w-full font-sans text-xs py-2 rounded mb-2 transition flex items-center justify-center font-bold shadow ${showHiddenPoints ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {showHiddenPoints ? "👁️ Hidden Points Visible" : "🚫 Hidden Points Invisible"}
        </button>

        

        <div className="flex gap-2 mb-2">
          <button onClick={handlePrint} className="flex-1 bg-blue-600 text-white font-sans text-xs py-2 rounded hover:bg-blue-700 transition flex items-center justify-center font-bold shadow">🖨️ Print Preview</button>
          <button onClick={saveToServer} className="flex-1 bg-green-600 text-white font-sans text-xs py-2 rounded hover:bg-green-700 transition flex items-center justify-center font-bold shadow">💾 Force Save</button>
        </div>

        {/* 

         controls for margins, typography, and measured elements  control panel

        <div className="space-y-2 font-sans text-[11px] bg-red-50 p-2 rounded border mb-4 mt-4">
          <h4 className="font-bold text-red-800">Measured Elements (px)</h4>
          <div className="flex justify-between items-center"><label>Top Margin (Name Pos):</label><NumberInput val={marginTopPx} setFn={setMarginTopPx} step="0.5"/></div>
          <div className="flex justify-between items-center text-green-700"><label>Bottom Margin (mm):</label><NumberInput val={marginBottomMm} setFn={setMarginBottomMm} step="0.5"/></div>
          <div className="flex justify-between items-center"><label>Header Block (Pushes bar):</label><NumberInput val={headerHeightPx} setFn={setHeaderHeightPx} step="0.5"/></div>
          <div className="flex justify-between items-center"><label>Black Bar Height:</label><NumberInput val={blackBarHeightPx} setFn={setBlackBarHeightPx} step="0.5"/></div>
          <div className="flex justify-between items-center"><label>Section Header Height:</label><NumberInput val={sectionHeightPx} setFn={setSectionHeightPx} step="0.5"/></div>
          <div className="flex justify-between items-center"><label>Company Row Height:</label><NumberInput val={companyHeightPx} setFn={setCompanyHeightPx} step="0.5"/></div>
          <div className="flex justify-between items-center"><label>Project Row Height:</label><NumberInput val={projectTitleHeightPx} setFn={setProjectTitleHeightPx} step="0.5"/></div>
        </div>
        

        <div className="space-y-2 font-sans text-[11px] bg-yellow-50 p-2 rounded border mb-4">
          <h4 className="font-bold text-yellow-800">Typography</h4>
          <div className="flex justify-between items-center"><label>Main Name Size (px):</label><NumberInput val={nameFontSizePx} setFn={setNameFontSizePx} step="0.5"/></div>
          <div className="flex justify-between items-center"><label>Sub Header Size (px):</label><NumberInput val={subHeaderFontSizePx} setFn={setSubHeaderFontSizePx} step="0.5"/></div>
          <div className="flex justify-between items-center"><label>Global Font Size (px):</label><NumberInput val={fontSizePx} setFn={setFontSizePx} step="0.5"/></div>
          <div className="flex justify-between items-center"><label>Bold Weight:</label><NumberInput val={boldWeight} setFn={setBoldWeight} step="10"/></div>
          <div className="flex justify-between items-center"><label>Line Height:</label><NumberInput val={lineHeight} setFn={setLineHeight} step="0.05"/></div>
        <button onClick={() => { setIsMeasuring(!isMeasuring); setMeasureStart(null); setMeasureCurrent(null); }} className={`w-full font-sans text-xs py-2 rounded mb-4 transition flex items-center justify-center border-2 ${isMeasuring ? 'bg-indigo-100 border-indigo-500 text-indigo-800 font-bold' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
          {isMeasuring ? "📏 Ruler Active (Click & Drag)" : "📐 Activate Ruler Tool"}
        </button>  
        </div>
             */}
       

        {/* 🆕 RESTORED: TRACING OVERLAY */}
        <div className="pt-2 border-t font-sans text-xs">
          <h4 className="font-bold mb-2">Tracing Overlay</h4>
          <input type="file" accept="image/*" onChange={(e) => {if(e.target.files?.[0]) setOverlayImage(URL.createObjectURL(e.target.files[0]))}} className="w-full text-[10px] mb-2" />
          {overlayImage && <div className="flex items-center"><label className="w-1/2">Opacity:</label><input type="range" min="0" max="1" step="0.05" value={overlayOpacity} onChange={(e) => setOverlayOpacity(Number(e.target.value))} className="w-1/2" /></div>}
        </div>
        
      </div>

      {/* 🛠️ RIGHT SIDE: CMS LIBRARY & CV MAKER 🛠️ */}
      <div 
        className={`no-print fixed right-4 top-4 w-80 bg-white p-4 shadow-xl border border-blue-200 rounded-lg z-50 h-[95vh] flex flex-col transition-transform duration-300 ${isFocusMode ? 'translate-x-[150%] pointer-events-none' : 'translate-x-0 pointer-events-auto'}`}
        onDragOver={onDragOver} 
        onDrop={(e) => onDropZone(e, 'library')}
      >
        {/* MASTER TOGGLE */}
        <div className="flex font-sans text-sm font-bold mb-4 bg-gray-200 rounded-lg p-1 shadow-inner">
          <button 
            onClick={() => {
              setRightPanelMode('library');
              handleSwitchCv('default'); // 🆕 Instantly auto-saves and routes back to the Master CV
            }} 
            className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-2 ${rightPanelMode === 'library' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            📚 Library
          </button>
          <button onClick={() => setRightPanelMode('cvmaker')} className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-2 ${rightPanelMode === 'cvmaker' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>📄 CV Maker</button>
        </div>
        
        {/* CV MAKER CONTROLS (Only visible in CV Maker mode) */}
        {rightPanelMode === 'cvmaker' && (
          <div className="mb-4 border-b pb-4 font-sans bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h4 className="text-xs font-bold text-blue-900 mb-1">Active CV Version</h4>
            <div className="flex gap-1 mb-2">
              <select 
                value={currentCvId} 
                onChange={(e) => handleSwitchCv(e.target.value)}
                className="flex-1 text-sm p-1.5 border border-blue-300 rounded font-bold bg-white text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {cvVersions.map(cv => <option key={cv.id} value={cv.id}>{cv.name}</option>)}
              </select>
              {currentCvId !== 'default' && (
                <button 
                  onClick={handleDeleteCv} 
                  className="bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1.5 rounded border border-red-200 text-xs font-bold transition flex items-center justify-center" 
                  title="Delete this CV"
                >
                  🗑️
                </button>
              )}
            </div>
            <div className="flex gap-1">
              <input type="text" value={newCvName} onChange={(e) => setNewCvName(e.target.value)} placeholder="Name new CV..." className="flex-1 text-xs border border-blue-200 rounded px-2 focus:outline-none focus:border-blue-500" />
              <button onClick={handleCreateCv} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold transition">Create</button>
            </div>
          </div>
        )}

        {/* LIBRARY ADD BUTTONS (Only visible in Library mode) */}
        {rightPanelMode === 'library' && (
          <div className="flex flex-wrap gap-2 font-sans text-xs mb-3 border-b pb-3">
            <button onClick={addInternship} className="bg-green-100 text-green-800 px-2 py-1.5 rounded font-bold hover:bg-green-200">+ Internship</button>
            <button onClick={addProject} className="bg-purple-100 text-purple-800 px-2 py-1.5 rounded font-bold hover:bg-purple-200">+ Projects</button>
            <button onClick={addPor} className="bg-orange-100 text-orange-800 px-2 py-1.5 rounded font-bold hover:bg-orange-200">+ P.O.R</button>
            <button onClick={addAward} className="bg-red-100 text-red-800 px-2 py-1.5 rounded font-bold hover:bg-red-200">+ Achiv</button>
          </div>
        )}

        {/* TABS FOR DRAFTS / FINALISED / IIM MUMBAI */}
        <div className="flex font-sans text-[10px] font-bold mb-2 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setLibraryTab('draft')} className={`flex-1 py-1.5 rounded-md transition-all ${libraryTab === 'draft' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>📝 Drafts</button>
          <button onClick={() => setLibraryTab('finalised')} className={`flex-1 py-1.5 rounded-md transition-all ${libraryTab === 'finalised' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>✅ Finalised</button>
          <button onClick={() => setLibraryTab('iim-mumbai')} className={`flex-1 py-1.5 rounded-md transition-all ${libraryTab === 'iim-mumbai' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}>🏫 IIM Mumbai</button>
        </div>

        {/* DRAGGABLE ITEMS LIST */}
        <div className="flex-1 overflow-y-auto space-y-2 bg-blue-50/50 p-2 rounded border border-dashed border-blue-200">
          {libraryBlocks.filter(b => (b.tags || []).includes(libraryTab)).length === 0 && (
            <div className="text-xs text-gray-400 text-center mt-4 font-bold">No items found with this tag.</div>
          )}
          
          {[
            { type: 'internship', label: 'Internships', emoji: '💼' },
            { type: 'project', label: 'Projects', emoji: '🚀' },
            { type: 'por', label: 'P.O.R', emoji: '⭐' },
            { type: 'award', label: 'Awards', emoji: '🏆' }
          ].map(cat => {
            const categoryItems = libraryBlocks.filter(b => b.type === cat.type && (b.tags || []).includes(libraryTab));
            if (categoryItems.length === 0) return null; 

            return (
              <details key={cat.type} className="group rounded border border-blue-200 shadow-sm bg-white overflow-hidden" open>
                <summary className="flex justify-between items-center p-2 cursor-pointer font-bold text-xs text-blue-900 bg-blue-100 hover:bg-blue-200 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  <span className="uppercase tracking-wider">{cat.emoji} {cat.label} ({categoryItems.length})</span>
                  <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
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
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          {block.type}
                          {/* 🆕 DELETE DROPDOWN TOGGLE BUTTON */}
                          <div className="relative">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === block.id ? null : block.id); }}
                              className="text-gray-400 hover:text-red-600 font-bold px-1 rounded transition-colors text-xs"
                              title="Options"
                            >
                              ⋮
                            </button>
                            
                            {activeMenuId === block.id && (
                              <div className="absolute left-0 top-4 z-[999] bg-white border border-gray-200 shadow-xl rounded py-1 w-24 font-sans text-[10px]">
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setItemToDelete(block.id); 
                                    setActiveMenuId(null); 
                                  }}
                                  className="w-full text-left px-2 py-1 text-red-600 hover:bg-red-50 font-bold flex items-center gap-1"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 🆕 NEW TAG TOGGLE BUTTONS */}
                        <div className="flex gap-1">
                          <button onClick={(e) => toggleTag(block.id, 'finalised', e)} className={`text-[9px] px-1.5 py-0.5 rounded border font-bold transition ${block.tags?.includes('finalised') ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}>✅ Fin</button>
                          {/* 🆕 Only show IIM Mumbai button if the item is Finalised */}
                          {block.tags?.includes('finalised') && (
                            <button onClick={(e) => toggleTag(block.id, 'iim-mumbai', e)} className={`text-[9px] px-1.5 py-0.5 rounded border font-bold transition ${block.tags?.includes('iim-mumbai') ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}>🏫 IIM</button>
                          )}
                        </div>
                      </div>
                      <div className="text-xs font-serif font-bold text-black truncate" dangerouslySetInnerHTML={{__html: block.company || block.role || block.category || 'Empty Title'}} />
                      <div className="text-[10px] font-serif text-gray-600 truncate" dangerouslySetInnerHTML={{__html: block.title || block.bullets?.[0]?.text || '...'}} />
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>

        {/* 🆕 IN-APP CONFIRMATION POPUP MODAL */}
        {itemToDelete && (
          <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-blue-100 p-5 w-72 font-sans animate-in fade-in zoom-in-95 duration-150">
              <div className="text-sm font-bold text-gray-900 mb-1">Delete Item?</div>
              <p className="text-xs text-gray-500 mb-4">This action is permanent and cannot be undone.</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDeleteLibraryItem}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg transition shadow-sm"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📄 A4 CV CANVAS (THE DROPZONE) 📄 */}
      <div className="transition-transform duration-300 origin-top" style={{ transform: `scale(${cvScale})`, height: 'max-content' }}>
      <div 
        ref={canvasRef}
        onDragOver={onDragOver} 
        onDrop={(e) => onDropZone(e, 'active')}
        className={`w-[210mm] min-h-[297mm] bg-white shadow-2xl border border-gray-300 relative group/page print:shadow-none print:border-none ${isMeasuring ? 'cursor-crosshair' : ''}`}
        style={{ paddingTop: `${marginTopPx}px`, paddingBottom: `${marginBottomMm}mm`, paddingLeft: `${marginLeftMm}mm`, paddingRight: `${marginRightMm}mm`, fontSize: `${fontSizePx}px`, fontFamily: fontFamily, lineHeight: lineHeight }}
      >
        {/* 🆕 RESTORED: TRACING IMAGE OVERLAY */}
        {overlayImage && <img src={overlayImage} alt="Trace" className="no-print absolute top-0 left-0 w-[210mm] min-h-[297mm] object-contain pointer-events-none z-[150] mix-blend-multiply" style={{ opacity: overlayOpacity }} />}

        {isMeasuring && measureStart && measureCurrent && (
          <div className="absolute z-[200] pointer-events-none" style={{ left: 0, top: 0, right: 0, bottom: 0 }}>
            <div className="absolute border-t border-dashed border-red-500" style={{ left: Math.min(measureStart.x, measureCurrent.x), top: measureStart.y, width: Math.abs(measureCurrent.x - measureStart.x) }} />
            <div className="absolute border-l border-dashed border-blue-500" style={{ left: measureCurrent.x, top: Math.min(measureStart.y, measureCurrent.y), height: Math.abs(measureCurrent.y - measureStart.y) }} />
            <div className="absolute bg-black text-white text-[10px] font-sans px-2 py-1 rounded shadow" style={{ left: measureCurrent.x + 10, top: measureCurrent.y + 10 }}>
              <div className="text-red-400">Δ X (Width): <b>{Math.abs(measureCurrent.x - measureStart.x).toFixed(1)} px</b></div>
              <div className="text-blue-400">Δ Y (Height): <b>{Math.abs(measureCurrent.y - measureStart.y).toFixed(1)} px</b></div>
            </div>
          </div>
        )}

        {/* --- HEADER --- */}
        <header className="flex justify-between items-start" style={{ height: `${headerHeightPx}px` }}>
          <div>
            <h1 className="font-bold leading-none mb-0 outline-none" style={{ fontSize: `${nameFontSizePx}px` }} contentEditable suppressContentEditableWarning onBlur={(e) => setHeaderData({...headerData, name: e.currentTarget.innerHTML})} dangerouslySetInnerHTML={{__html: headerData.name}} />
            <p className="outline-none" style={{ fontSize: 15 }} contentEditable suppressContentEditableWarning onBlur={(e) => setHeaderData({...headerData, line1: e.currentTarget.innerHTML})} dangerouslySetInnerHTML={{__html: headerData.line1}} />
            {/* Swapped marginTop for position: 'relative' and top: '2px' to force the shift! */}
            <p className="outline-none" style={{ fontSize: 15 }} contentEditable suppressContentEditableWarning onBlur={(e) => setHeaderData({...headerData, line2: e.currentTarget.innerHTML})} dangerouslySetInnerHTML={{__html: headerData.line2}} />
          </div>
          {/* 🆕 RESTORED: IIM MUMBAI LOGO PLACEHOLDER */}
          <img
          src="/iim-mumbai-logo.png"
          alt="IIM Mumbai"
          className="h-13 object-fill" style={{ width: '296.5px', marginTop: '-4.95px', marginRight: '-4.7px', marginBottom: '-20px' }}
        />
        </header>

        <div className="bg-black text-white text-center font-bold outline-none flex items-center justify-center" contentEditable suppressContentEditableWarning style={{ height: 20, fontSize: 15, marginBottom: `${gapBannerTablePx}px`, marginTop: "5px" }} onBlur={(e) => setHeaderData({...headerData, banner: e.currentTarget.innerHTML})} dangerouslySetInnerHTML={{__html: headerData.banner}} />

        {/* --- ACADEMIC PROFILE TABLE (Always Visible) --- */}
        <table className="w-full border-collapse border border-black mb-[3.5px] table-fixed text-center relative z-10">
          <colgroup>
        <col style={{ width: '38%' }} />
        <col style={{ width: '45%' }} />
        <col style={{ width: '9%' }} />
        <col style={{ width: '8%' }} />
      </colgroup>
          <tbody>
            <tr>
              <th colSpan={4} className="bg-[#a8a8a8] border border-black text-left px-1 uppercase font-bold" style={{ height: `${sectionHeightPx}px`, fontSize: 14.5 }}><span className="outline-none">ACADEMIC PROFILE</span></th>
            </tr>
            <tr className="bg-[#dedede]" style={{ height: 16, fontSize: '12.5px' }}>
              <td className="border border-black px-1">Degree</td><td className="border border-black px-1">Institute</td><td className="border border-black px-1">%/CGPA</td><td className="border border-black px-1">Year</td>
            </tr>
            {academics.map((row, idx) => (
              <tr key={idx} style={{ height: 16, fontSize: '12.5px' }}>
                {/* Added style controls for letter and word spacing! */}
                <td className="border border-black px-1" style={{ paddingLeft: '9px', paddingRight: '4px' }}><span className="outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => {const n=[...academics]; n[idx].degree=e.currentTarget.innerHTML; setAcademics(n);}} dangerouslySetInnerHTML={{__html: row.degree}}/></td>
                {/* Removed px-1 and added precise paddingLeft and increased wordSpacing */}
                <td className="border border-black" style={{ paddingLeft: '9px', paddingRight: '4px', letterSpacing: '-0.375px', wordSpacing: '1.5px' }}><span className="outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => {const n=[...academics]; n[idx].institute=e.currentTarget.innerHTML; setAcademics(n);}} dangerouslySetInnerHTML={{__html: row.institute}}/></td>
                <td className="border border-black px-1" style={{ paddingLeft: '9px', paddingRight: '4px' }}><span className="outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => {const n=[...academics]; n[idx].score=e.currentTarget.innerHTML; setAcademics(n);}} dangerouslySetInnerHTML={{__html: row.score}}/></td>
                <td className="border border-black px-1" style={{ paddingLeft: '9px', paddingRight: '4px' }}><span className="outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => {const n=[...academics]; n[idx].year=e.currentTarget.innerHTML; setAcademics(n);}} dangerouslySetInnerHTML={{__html: row.year}}/></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- DYNAMIC ACTIVE SECTIONS --- */}
        {activeBlocks.length === 0 && (
          <div className="no-print mt-8 p-12 border-4 border-dashed border-gray-300 text-center text-gray-400 font-sans font-bold text-xl rounded-xl">
            Drag Sections Here from the Library to build your CV
          </div>
        )}

        {/* INTERNSHIPS GROUP */}
        {activeInternships.length > 0 && (
          <table className="w-full border-collapse border border-black mb-1 table-fixed relative z-10">
            <colgroup><col style={{ width: `${leftColWidth}%` }} /><col style={{ width: `${100 - leftColWidth}%` }} /></colgroup>
            <tbody>
              <tr><th colSpan={2} className="bg-[#a8a8a8] border border-black text-left uppercase font-bold" style={{ height: `${sectionHeightPx}px`, fontSize: '14.5px', letterSpacing: '0.15px', paddingLeft: '4px' }}>INTERNSHIP</th></tr>
              {activeInternships.map((intern) => (
                <React.Fragment key={intern.id}>
                  <tr className="group/drag relative">
                    <td colSpan={2} className="border-t border-l border-r border-black px-1 border-b-0 relative" style={{ height: `${companyHeightPx}px`, verticalAlign: 'middle' }}>
                      <div draggable onDragStart={(e) => onBlockDragStart(e, intern.id)} className="no-print absolute -left-6 top-1/2 -translate-y-1/2 cursor-move opacity-0 group-hover/drag:opacity-100 bg-blue-100 text-blue-800 px-1 py-0.5 rounded shadow text-xs" title="Drag back to Library">⠿</div>
                      <div className="flex justify-between font-bold pr-1">
                        <span className="outline-none w-full" contentEditable suppressContentEditableWarning onKeyDown={handleKeyDown} onBlur={(e) => updateBlockField(intern.id, 'company', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html: intern.company}}/>
                        <span className="outline-none whitespace-nowrap" contentEditable suppressContentEditableWarning onKeyDown={handleKeyDown} onBlur={(e) => updateBlockField(intern.id, 'date', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html: intern.date}}/>
                      </div>
                    </td>
                  </tr>
                  <tr><td colSpan={2} className="border-b border-l border-r border-black px-1 font-bold border-t-0" style={{ height: `${projectTitleHeightPx}px`, verticalAlign: 'middle' }}><span className="outline-none" contentEditable suppressContentEditableWarning onKeyDown={handleKeyDown} onBlur={(e) => updateBlockField(intern.id, 'title', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html: intern.title}}/></td></tr>
                  <tr className="group/row relative">
                    <td className="bg-[#dedede] border border-black px-1 text-center font-bold align-middle leading-tight">Project Details</td>
                    <td className="border border-black pl-[2px] align-top relative" style={{ paddingTop: `${padBulletCellTopPx}px`, paddingBottom: `${padBulletCellBottomPx}px`, paddingRight: '0px' }}>
                      <div className="m-0 flex flex-col" style={{ gap: `${bulletGapPx}px` }}>
                        {(intern.details || []).map((pt: any, bIdx: number) => {
                          if (pt.hidden && !showHiddenPoints) return null;
                          return (
                            <div key={pt.id} className={`relative pr-0 group/point ${pt.hidden ? 'opacity-30 bg-gray-100 is-hidden-point' : ''}`} style={{ paddingLeft: `${textIndentPx}px` }} onDragOver={onDragOver} onDrop={(e) => onPointDrop(e, intern.id, 'details', bIdx)}>
                              <button onClick={() => togglePointVisibility(intern.id, 'details', bIdx)} className="absolute -right-[45px] top-0 opacity-0 group-hover/point:opacity-100 text-[10px] no-print z-50 bg-white px-1 rounded border shadow text-black">{pt.hidden ? '👁️ Unhide' : '🚫 Hide'}</button>
                              <div draggable onDragStart={(e) => onPointDragStart(e, intern.id, 'details', bIdx, pt.text)} className="absolute bg-black cursor-move hover:scale-150 transition-transform z-10 no-print" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} title="Drag to reorder" />
                              <div className="absolute bg-black print:block hidden" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} />
                              <div className={`int-det-${intern.id} outline-none focus:bg-yellow-50`} contentEditable suppressContentEditableWarning onKeyDown={(e) => handleNestedKeyDown(e, intern.id, bIdx, 'details', `int-det-${intern.id}`)} onBlur={(e) => handleNestedBlur(e, intern.id, bIdx, 'details')} dangerouslySetInnerHTML={{ __html: pt.text }} />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-[#dedede] border border-black px-1 text-center font-bold align-middle leading-tight">Achievements</td>
                    <td className="border border-black pl-[2px] align-top relative" style={{ paddingTop: `${padBulletCellTopPx}px`, paddingBottom: `${padBulletCellBottomPx}px`, paddingRight: '0px' }}>
                      <div className="m-0 flex flex-col" style={{ gap: `${bulletGapPx}px` }}>
                        {(intern.achievements || []).map((pt: any, bIdx: number) => {
                          if (pt.hidden && !showHiddenPoints) return null;
                          return (
                            <div key={pt.id} className={`relative pr-0 group/point ${pt.hidden ? 'opacity-30 bg-gray-100 is-hidden-point' : ''}`} style={{ paddingLeft: `${textIndentPx}px` }} onDragOver={onDragOver} onDrop={(e) => onPointDrop(e, intern.id, 'achievements', bIdx)}>
                              <button onClick={() => togglePointVisibility(intern.id, 'achievements', bIdx)} className="absolute -right-[45px] top-0 opacity-0 group-hover/point:opacity-100 text-[10px] no-print z-50 bg-white px-1 rounded border shadow text-black">{pt.hidden ? '👁️ Unhide' : '🚫 Hide'}</button>
                              <div draggable onDragStart={(e) => onPointDragStart(e, intern.id, 'achievements', bIdx, pt.text)} className="absolute bg-black cursor-move hover:scale-150 transition-transform z-10 no-print" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} title="Drag to reorder" />
                              <div className="absolute bg-black print:block hidden" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} />
                              <div className={`int-ach-${intern.id} outline-none focus:bg-yellow-50`} contentEditable suppressContentEditableWarning onKeyDown={(e) => handleNestedKeyDown(e, intern.id, bIdx, 'achievements', `int-ach-${intern.id}`)} onBlur={(e) => handleNestedBlur(e, intern.id, bIdx, 'achievements')} dangerouslySetInnerHTML={{ __html: pt.text }} />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}

        {/* PROJECTS GROUP */}
        {activeProjects.length > 0 && (
          <table className="w-full border-collapse border border-black mb-1 table-fixed relative z-10">
            <colgroup><col style={{ width: `${leftColWidth}%` }} /><col style={{ width: `${100 - leftColWidth}%` }} /></colgroup>
            <tbody>
              <tr><th colSpan={2} className="bg-[#a8a8a8] border border-black text-left uppercase font-bold" style={{ height: `${sectionHeightPx}px`, fontSize: '14.5px', letterSpacing: '0.15px', paddingLeft: '4px' }}>PROJECTS</th></tr>
              {activeProjects.map((proj) => (
                <React.Fragment key={proj.id}>
                  <tr className="group/drag relative">
                    <td colSpan={2} className="border-t border-l border-r border-black px-1 border-b-0 relative" style={{ height: `${companyHeightPx}px`, verticalAlign: 'middle' }}>
                      <div draggable onDragStart={(e) => onBlockDragStart(e, proj.id)} className="no-print absolute -left-6 top-1/2 -translate-y-1/2 cursor-move opacity-0 group-hover/drag:opacity-100 bg-blue-100 text-blue-800 px-1 py-0.5 rounded shadow text-xs" title="Drag back to Library">⠿</div>
                      <div className="flex justify-between font-bold pr-1"><span className="outline-none w-full" contentEditable suppressContentEditableWarning onKeyDown={handleKeyDown} onBlur={(e) => updateBlockField(proj.id, 'company', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html: proj.company}}/></div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="border-b border-l border-r border-black px-1 font-bold border-t-0" style={{ height: `${projectTitleHeightPx}px`, verticalAlign: 'middle' }}>
                      <div className="flex justify-between font-bold pr-1">
                        <span className="outline-none w-full" contentEditable suppressContentEditableWarning onKeyDown={handleKeyDown} onBlur={(e) => updateBlockField(proj.id, 'title', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html: proj.title}}/>
                        <span className="outline-none font-normal whitespace-nowrap" contentEditable suppressContentEditableWarning onKeyDown={handleKeyDown} onBlur={(e) => updateBlockField(proj.id, 'date', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html: proj.date}}/>
                      </div>
                    </td>
                  </tr>
                  <tr className="group/row relative">
                    <td className="bg-[#dedede] border border-black px-1 text-center font-bold align-middle leading-tight">Project Details</td>
                    <td className="border border-black pl-[2px] align-top relative" style={{ paddingTop: `${padBulletCellTopPx}px`, paddingBottom: `${padBulletCellBottomPx}px`, paddingRight: '0px' }}>
                      <div className="m-0 flex flex-col" style={{ gap: `${bulletGapPx}px` }}>
                        {(proj.details || []).map((pt: any, bIdx: number) => {
                          if (pt.hidden && !showHiddenPoints) return null;
                          return (
                            <div key={pt.id} className={`relative pr-0 group/point ${pt.hidden ? 'opacity-30 bg-gray-100 is-hidden-point' : ''}`} style={{ paddingLeft: `${textIndentPx}px` }} onDragOver={onDragOver} onDrop={(e) => onPointDrop(e, proj.id, 'details', bIdx)}>
                              <button onClick={() => togglePointVisibility(proj.id, 'details', bIdx)} className="absolute -right-[45px] top-0 opacity-0 group-hover/point:opacity-100 text-[10px] no-print z-50 bg-white px-1 rounded border shadow text-black">{pt.hidden ? '👁️ Unhide' : '🚫 Hide'}</button>
                              <div draggable onDragStart={(e) => onPointDragStart(e, proj.id, 'details', bIdx, pt.text)} className="absolute bg-black cursor-move hover:scale-150 transition-transform z-10 no-print" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} title="Drag to reorder" />
                              <div className="absolute bg-black print:block hidden" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} />
                              <div className={`pro-det-${proj.id} outline-none focus:bg-yellow-50`} contentEditable suppressContentEditableWarning onKeyDown={(e) => handleNestedKeyDown(e, proj.id, bIdx, 'details', `pro-det-${proj.id}`)} onBlur={(e) => handleNestedBlur(e, proj.id, bIdx, 'details')} dangerouslySetInnerHTML={{ __html: pt.text }} />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-[#dedede] border border-black px-1 text-center font-bold align-middle leading-tight">Achievements</td>
                    <td className="border border-black pl-[2px] align-top relative" style={{ paddingTop: `${padBulletCellTopPx}px`, paddingBottom: `${padBulletCellBottomPx}px`, paddingRight: '0px' }}>
                      <div className="m-0 flex flex-col" style={{ gap: `${bulletGapPx}px` }}>
                        {(proj.achievements || []).map((pt: any, bIdx: number) => {
                          if (pt.hidden && !showHiddenPoints) return null;
                          return (
                            <div key={pt.id} className={`relative pr-0 group/point ${pt.hidden ? 'opacity-30 bg-gray-100 is-hidden-point' : ''}`} style={{ paddingLeft: `${textIndentPx}px` }} onDragOver={onDragOver} onDrop={(e) => onPointDrop(e, proj.id, 'achievements', bIdx)}>
                              <button onClick={() => togglePointVisibility(proj.id, 'achievements', bIdx)} className="absolute -right-[45px] top-0 opacity-0 group-hover/point:opacity-100 text-[10px] no-print z-50 bg-white px-1 rounded border shadow text-black">{pt.hidden ? '👁️ Unhide' : '🚫 Hide'}</button>
                              <div draggable onDragStart={(e) => onPointDragStart(e, proj.id, 'achievements', bIdx, pt.text)} className="absolute bg-black cursor-move hover:scale-150 transition-transform z-10 no-print" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} title="Drag to reorder" />
                              <div className="absolute bg-black print:block hidden" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} />
                              <div className={`pro-ach-${proj.id} outline-none focus:bg-yellow-50`} contentEditable suppressContentEditableWarning onKeyDown={(e) => handleNestedKeyDown(e, proj.id, bIdx, 'achievements', `pro-ach-${proj.id}`)} onBlur={(e) => handleNestedBlur(e, proj.id, bIdx, 'achievements')} dangerouslySetInnerHTML={{ __html: pt.text }} />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}

        {/* POR GROUP */}
        {activePors.length > 0 && (
          <table className="w-full border-collapse border border-black mb-1 table-fixed relative z-10">
            <colgroup><col style={{ width: `${leftColWidth}%` }} /><col style={{ width: `${100 - leftColWidth - yearColWidth}%` }} /><col style={{ width: `${yearColWidth}%` }} /></colgroup>
            <tbody>
              <tr><th colSpan={3} className="bg-[#a8a8a8] border border-black text-left uppercase font-bold" style={{ height: `${sectionHeightPx}px`, fontSize: '14.5px', letterSpacing: '0.15px', paddingLeft: '4px' }}>POSITION OF RESPONSIBILITIES</th></tr>
              {activePors.map((por) => (
                <tr key={por.id} className="group/drag relative">
                  <td className="bg-[#dedede] border border-black px-1 text-center font-bold align-middle leading-tight relative">
                    <div draggable onDragStart={(e) => onBlockDragStart(e, por.id)} className="no-print absolute -left-6 top-1/2 -translate-y-1/2 cursor-move opacity-0 group-hover/drag:opacity-100 bg-blue-100 text-blue-800 px-1 py-0.5 rounded shadow text-xs" title="Drag back to Library">⠿</div>
                    <span className="outline-none" contentEditable suppressContentEditableWarning onKeyDown={handleKeyDown} onBlur={(e) => updateBlockField(por.id, 'role', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html: por.role}}/>
                  </td>
                  <td className="border border-black pl-[2px] align-top relative" style={{ paddingTop: `${padBulletCellTopPx}px`, paddingBottom: `${padBulletCellBottomPx}px`, paddingRight: '0px' }}>
                    <div className="m-0 flex flex-col" style={{ gap: `${bulletGapPx}px` }}>
                      {(por.bullets || []).map((pt: any, bIdx: number) => {
                        if (pt.hidden && !showHiddenPoints) return null;
                        return (
                          <div key={pt.id} className={`relative pr-0 group/point ${pt.hidden ? 'opacity-30 bg-gray-100 is-hidden-point' : ''}`} style={{ paddingLeft: `${textIndentPx}px` }} onDragOver={onDragOver} onDrop={(e) => onPointDrop(e, por.id, 'bullets', bIdx)}>
                            <button onClick={() => togglePointVisibility(por.id, 'bullets', bIdx)} className="absolute -right-[95px] top-0 opacity-0 group-hover/point:opacity-100 text-[10px] no-print z-50 bg-white px-1 rounded border shadow text-black">{pt.hidden ? '👁️ Unhide' : '🚫 Hide'}</button>
                            <div draggable onDragStart={(e) => onPointDragStart(e, por.id, 'bullets', bIdx, pt.text)} className="absolute bg-black cursor-move hover:scale-150 transition-transform z-10 no-print" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} title="Drag to reorder" />
                            <div className="absolute bg-black print:block hidden" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} />
                            <div className={`por-bul-${por.id} outline-none focus:bg-yellow-50`} contentEditable suppressContentEditableWarning onKeyDown={(e) => handleNestedKeyDown(e, por.id, bIdx, 'bullets', `por-bul-${por.id}`)} onBlur={(e) => handleNestedBlur(e, por.id, bIdx, 'bullets')} dangerouslySetInnerHTML={{ __html: pt.text }} />
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="border border-black px-1 text-center align-top leading-[1.2]" style={{ paddingTop: `${padBulletCellTopPx}px` }}>
                    <span className="outline-none inline-block whitespace-pre-wrap" contentEditable suppressContentEditableWarning onKeyDown={handleKeyDown} onBlur={(e) => updateBlockField(por.id, 'years', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html: por.years}}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* AWARDS GROUP */}
        {activeAwards.length > 0 && (
          <table className="w-full border-collapse border border-black mb-1 table-fixed relative z-10">
            <colgroup><col style={{ width: `${leftColWidth}%` }} /><col style={{ width: `${100 - leftColWidth - yearColWidth}%` }} /><col style={{ width: `${yearColWidth}%` }} /></colgroup>
            <tbody>
              <tr><th colSpan={3} className="bg-[#a8a8a8] border border-black text-left uppercase font-bold" style={{ height: `${sectionHeightPx}px`, fontSize: '14.5px', letterSpacing: '0.15px', paddingLeft: '4px' }}>AWARDS AND ACHIEVEMENTS</th></tr>
              {activeAwards.map((award) => (
                <tr key={award.id} className="group/drag relative">
                  <td className="bg-[#dedede] border border-black px-1 text-center font-bold align-middle leading-tight relative">
                    <div draggable onDragStart={(e) => onBlockDragStart(e, award.id)} className="no-print absolute -left-6 top-1/2 -translate-y-1/2 cursor-move opacity-0 group-hover/drag:opacity-100 bg-blue-100 text-blue-800 px-1 py-0.5 rounded shadow text-xs" title="Drag back to Library">⠿</div>
                    <span className="outline-none" contentEditable suppressContentEditableWarning onKeyDown={handleKeyDown} onBlur={(e) => updateBlockField(award.id, 'category', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html: award.category}}/>
                  </td>
                  <td className="border border-black pl-[2px] align-top relative" style={{ paddingTop: `${padBulletCellTopPx}px`, paddingBottom: `${padBulletCellBottomPx}px`, paddingRight: '0px' }}>
                    <div className="m-0 flex flex-col" style={{ gap: `${bulletGapPx}px` }}>
                      {(award.bullets || []).map((pt: any, bIdx: number) => {
                        if (pt.hidden && !showHiddenPoints) return null;
                        return (
                          <div key={pt.id} className={`relative pr-0 group/point ${pt.hidden ? 'opacity-30 bg-gray-100 is-hidden-point' : ''}`} style={{ paddingLeft: `${textIndentPx}px` }} onDragOver={onDragOver} onDrop={(e) => onPointDrop(e, award.id, 'bullets', bIdx)}>
                            <button onClick={() => togglePointVisibility(award.id, 'bullets', bIdx)} className="absolute -right-[95px] top-0 opacity-0 group-hover/point:opacity-100 text-[10px] no-print z-50 bg-white px-1 rounded border shadow text-black">{pt.hidden ? '👁️ Unhide' : '🚫 Hide'}</button>
                            <div draggable onDragStart={(e) => onPointDragStart(e, award.id, 'bullets', bIdx, pt.text)} className="absolute bg-black cursor-move hover:scale-150 transition-transform z-10 no-print" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} title="Drag to reorder" />
                            <div className="absolute bg-black print:block hidden" style={{ left: `${bulletLeftPx}px`, top: `${bulletTopPx}px`, width: `${bulletSizePx}px`, height: `${bulletSizePx}px` }} />
                            <div className={`awa-bul-${award.id} outline-none focus:bg-yellow-50`} contentEditable suppressContentEditableWarning onKeyDown={(e) => handleNestedKeyDown(e, award.id, bIdx, 'bullets', `awa-bul-${award.id}`)} onBlur={(e) => handleNestedBlur(e, award.id, bIdx, 'bullets')} dangerouslySetInnerHTML={{ __html: pt.text }} />
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="border border-black px-1 text-center align-top leading-[1.2]" style={{ paddingTop: `${padBulletCellTopPx}px` }}>
                    <span className="outline-none inline-block whitespace-pre-wrap" contentEditable suppressContentEditableWarning onKeyDown={handleKeyDown} onBlur={(e) => updateBlockField(award.id, 'years', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html: award.years}}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* --- LINKEDIN FOOTER --- */}
        <div className="absolute bottom-[mm] left-0 w-full text-center z-10">
          
          <p className="outline-none text-[#0000ff] hover:text-[#0000ff]" style={{ fontSize: 10, textDecoration: 'underline' }} contentEditable suppressContentEditableWarning onKeyDown={handleKeyDown}>
            www.linkedin.com/in/
          </p>
        </div>

      </div>
      </div>
      
    </main>
    </LicenseGate>
  );
}