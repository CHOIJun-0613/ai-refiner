import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface DiagramPreviewProps {
    code: string;
}

export const DiagramPreview: React.FC<DiagramPreviewProps> = ({ code }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState<number>(1);

    useEffect(() => {
        const renderDiagram = async () => {
            if (!containerRef.current || !code) return;

            try {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'neutral',
                    securityLevel: 'loose',
                    themeVariables: {
                        primaryColor: '#ffffff',
                        primaryBorderColor: '#000000',
                        lineColor: '#333333',
                        textColor: '#000000',
                        mainBkg: '#ffffff',
                        activationBkgColor: '#E6F3FF',
                        activationBorderColor: '#2B6CB0',
                    },
                    sequence: {
                        showSequenceNumbers: false,
                        actorMargin: 50,
                        boxMargin: 10,
                        boxTextMargin: 5,
                        noteMargin: 10,
                        messageMargin: 35,
                        mirrorActors: true,
                        bottomMarginAdj: 1,
                        useMaxWidth: false,
                    }
                });

                setError(null);
                // Unique ID for each render to avoid conflicts
                const id = `mermaid-${Date.now()}`;
                const { svg } = await mermaid.render(id, code);
                setSvgContent(svg);
            } catch (err) {
                console.error('Mermaid render error:', err);
                setError('Failed to render diagram. Please check syntax.');
            }
        };

        renderDiagram();
    }, [code]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const handleResetZoom = () => setZoom(1);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-900 rounded-lg shadow-inner overflow-auto p-8 relative">
            {error ? (
                <div className="text-red-500 font-medium">{error}</div>
            ) : (
                <div
                    className="bg-white shadow-lg diagram-preview flex items-center justify-center overflow-hidden transition-transform duration-200 ease-in-out origin-center"
                    style={{
                        width: '297mm',
                        height: '210mm',
                        minWidth: '297mm',
                        minHeight: '210mm',
                        transform: `scale(${zoom})`
                    }}
                >
                    <div
                        ref={containerRef}
                        className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn size={20} />
                </button>
                <button
                    onClick={handleResetZoom}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 transition-colors"
                    title="Reset Zoom"
                >
                    <div className="text-xs font-bold">{Math.round(zoom * 100)}%</div>
                </button>
                <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut size={20} />
                </button>
            </div>
        </div>
    );
};
