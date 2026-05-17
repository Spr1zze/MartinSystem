import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodePreviewProps {
  value: string;
}

export const BarcodePreview: React.FC<BarcodePreviewProps> = ({ value }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        displayValue: true,
        lineColor: '#111827',
        background: '#f9fafb',
        width: 2,
        height: 72,
        margin: 8,
      });
    } catch (error) {
      console.error('Failed to render barcode:', error);
    }
  }, [value]);

  return (
    <div className="flex justify-center overflow-x-auto">
      <svg ref={svgRef} aria-label={`Barcode for ${value}`} />
    </div>
  );
};
