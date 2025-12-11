
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { VisualEditor } from './VisualEditor';
import { DiagramPreview } from './DiagramPreview';
import { useDiagramStore } from '../../store/diagramStore';
import { generateMermaidCode } from '../../utils/mermaidUtils';
import { FileCode, Download, Upload, Share2, RotateCcw } from 'lucide-react';
import { vscode } from '../../utils/vscodeUtils';

export const Editor: React.FC = () => {
    const { participants, messages, setDiagram, resetDiagram } = useDiagramStore();
    const [viewMode, setViewMode] = useState<'physical' | 'logical'>('physical');
    const [mermaidCode, setMermaidCode] = useState(() => generateMermaidCode(participants, messages, viewMode));

    useEffect(() => {
        const code = generateMermaidCode(participants, messages, viewMode);
        console.log('Generated Mermaid Code:\n', code);
        setMermaidCode(code);
    }, [participants, messages, viewMode]);

    const handleDownload = async () => {
        // Create metadata with current state
        const state = {
            participants,
            messages
        };

        // Always save with physical names regardless of current view mode
        const physicalCode = generateMermaidCode(participants, messages, 'physical');
        // Format JSON with indentation (2 spaces)
        const metadata = `\n\n<!--state: ${JSON.stringify(state, null, 2)} -->`;
        const fileContent = physicalCode + metadata;

        if (vscode) {
            vscode.postMessage({
                command: 'save',
                content: fileContent
            });
            return;
        }

        try {
            // @ts-ignore - File System Access API might not be in standard types yet
            if (window.showSaveFilePicker) {
                // @ts-ignore
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'sequence-diagram.md',
                    types: [{
                        description: 'Markdown File',
                        accept: { 'text/markdown': ['.md'] },
                    }],
                });
                // @ts-ignore
                const writable = await handle.createWritable();
                await writable.write(fileContent);
                await writable.close();
            } else {
                // Fallback for browsers not supporting File System Access API
                const fileName = prompt('Enter file name:', 'sequence-diagram.md');
                if (!fileName) return;

                const blob = new Blob([fileContent], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Failed to save file:', err);
                alert('Failed to save file.');
            }
        }
    };

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (vscode) {
            event.preventDefault(); // Prevent default file picker
            vscode.postMessage({ command: 'load' });
            return;
        }

        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                loadContent(content);
            }
        };
        reader.readAsText(file);
    };

    const loadContent = (content: string) => {
        // Try to parse metadata first
        // Use [\s\S] to match across newlines
        // Also handle potential malformed comments with spaces like < !--
        const metadataMatch = content.match(/<\s*!--\s*state:\s*([\s\S]+?)\s*-->/);
        if (metadataMatch) {
            try {
                const state = JSON.parse(metadataMatch[1]);
                if (state.participants && state.messages) {
                    setDiagram(state.participants, state.messages);
                    setViewMode('physical'); // Reset to physical view
                    return;
                }
            } catch (err) {
                console.error('Failed to parse metadata:', err);
            }
        }

        // Fallback to normal parsing
        parseMermaidToState(content);
        setViewMode('physical'); // Reset to physical view
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.command === 'load') {
                loadContent(message.content);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const parseMermaidToState = (content: string) => {
        const lines = content.split('\n');
        const newParticipants: any[] = [];
        const newMessages: any[] = [];

        // Map to track file IDs to store IDs to avoid duplicates if needed
        // But we will try to reuse file IDs (stripped of prefix) as store IDs

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('participant')) {
                // Regex to match: participant ID as Name OR participant ID
                const match = trimmed.match(/^participant\s+([^\s]+)(?:\s+as\s+(.+))?$/);
                if (match) {
                    const fileId = match[1];
                    const rawName = match[2] || fileId;
                    // Unescape quotes
                    const name = rawName.replace(/&quot;/g, '"').trim();

                    // Strip p_ prefix from fileId to get storeId if present
                    const id = fileId.startsWith('p_') ? fileId.slice(2) : fileId;

                    // Avoid duplicates if file has duplicate lines
                    if (!newParticipants.find(p => p.id === id)) {
                        newParticipants.push({ id, name });
                    }
                }
            } else if (trimmed.includes('->>')) {
                // Find first colon to split expression from message content
                const colonIndex = trimmed.indexOf(':');
                let expression = trimmed;
                let rawContent = '';

                if (colonIndex !== -1) {
                    expression = trimmed.substring(0, colonIndex);
                    rawContent = trimmed.substring(colonIndex + 1);
                }

                // But we should still support suffixes for backward compatibility if user manually edited
                // For now, let's look for standard arrows
                const arrow = expression.includes('-->>') ? '-->>' : '->>';
                const [fromFileId, toFileId] = expression.split(arrow).map(s => s.trim());

                if (fromFileId && toFileId) {
                    // Resolve IDs
                    const fromId = fromFileId.startsWith('p_') ? fromFileId.slice(2) : fromFileId;
                    const toId = toFileId.startsWith('p_') ? toFileId.slice(2) : toFileId;

                    // If participants don't exist (implicit), create them
                    if (!newParticipants.find(p => p.id === fromId)) {
                        newParticipants.push({ id: fromId, name: fromId });
                    }
                    if (!newParticipants.find(p => p.id === toId)) {
                        newParticipants.push({ id: toId, name: toId });
                    }

                    const content = rawContent ? rawContent.trim().replace(/&quot;/g, '"') : '';

                    newMessages.push({
                        id: crypto.randomUUID(),
                        fromId,
                        toId,
                        content,
                        type: arrow === '-->>' ? 'dotted' : 'solid',
                    });
                }
            }
        });

        if (newParticipants.length > 0 || newMessages.length > 0) {
            setDiagram(newParticipants, newMessages);
        } else {
            alert('Could not parse the file. Ensure it is a valid Mermaid sequence diagram.');
        }
    };

    // Sidebar resizing logic
    const [sidebarWidth, setSidebarWidth] = useState(400);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing) {
                const newWidth = mouseMoveEvent.clientX;
                if (newWidth > 250 && newWidth < 800) {
                    setSidebarWidth(newWidth);
                }
            }
        },
        [isResizing]
    );

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    const handleExportSVG = () => {
        const svgElement = document.querySelector('.diagram-preview svg');
        if (!svgElement) {
            alert('다이어그램을 찾을 수 없습니다.');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sequence-diagram.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = async () => {
        // Capture the container to include background and proper sizing
        const element = document.querySelector('.diagram-preview') as HTMLElement;
        if (!element) {
            alert('다이어그램을 찾을 수 없습니다.');
            return;
        }

        try {
            // Dynamically import libraries to avoid SSR issues if any, though this is SPA
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher scale for better quality
                width: element.scrollWidth,
                height: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            // A4 Landscape dimensions in mm: 297 x 210
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Calculate dimensions to fit A4 landscape
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // We want to fill the page, but keep aspect ratio if needed, or just stretch if it's already A4 ratio
            // Since our container is A4, it should match exactly.
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('sequence-diagram.pdf');
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('PDF 저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden">
            {/* Header */}
            <header className="flex-none flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <FileCode size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sequence Editor</h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('physical')}
                            className={`px - 3 py - 1.5 text - sm font - medium rounded - md transition - all ${viewMode === 'physical'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                } `}
                        >
                            Physical
                        </button>
                        <button
                            onClick={() => setViewMode('logical')}
                            className={`px - 3 py - 1.5 text - sm font - medium rounded - md transition - all ${viewMode === 'logical'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                } `}
                        >
                            Logical
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>

                    <button
                        onClick={() => {
                            if (window.confirm('정말 모든 내용을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                                resetDiagram();
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        <RotateCcw size={18} />
                        초기화
                    </button>

                    <label
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        onClick={(e) => {
                            if (vscode) {
                                e.preventDefault();
                                handleUpload(e as any);
                            }
                        }}
                    >
                        <Upload size={18} />
                        불러오기
                        <input type="file" accept=".md,.txt" onChange={handleUpload} className="hidden" disabled={!!vscode} />
                    </label>

                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                    >
                        <Download size={18} />
                        저장하기
                    </button>

                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <Share2 size={18} />
                            내보내기
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <button
                                onClick={handleExportSVG}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                            >
                                SVG로 저장
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                            >
                                PDF로 저장
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden relative">
                {/* Editor Panel */}
                <div
                    ref={sidebarRef}
                    className="flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    style={{ width: sidebarWidth }}
                >
                    <VisualEditor />
                </div>

                {/* Resizer Handle */}
                <div
                    className="w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition-colors z-20 flex items-center justify-center group"
                    onMouseDown={startResizing}
                >
                    <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 group-hover:bg-white rounded-full"></div>
                </div>

                {/* Preview Panel */}
                <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 p-8 overflow-hidden flex flex-col">
                    <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
                        <DiagramPreview code={mermaidCode} />
                    </div>
                </div>

                {/* Overlay while resizing to prevent iframe interference if any */}
                {isResizing && (
                    <div className="absolute inset-0 z-50 cursor-col-resize"></div>
                )}
            </main>
        </div>
    );
};
