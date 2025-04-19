import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportApi } from "@/lib/api-client";
import { useState } from "react";
import { toast } from "sonner";

interface ExportButtonProps {
  brandId?: number;
  type: 'all' | 'brand' | 'products';
  className?: string;
}

export function ExportButton({ brandId, type, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      switch (type) {
        case 'all':
          await exportApi.getAdminBrands();
          toast.success('All brands exported successfully');
          break;
        case 'brand':
          if (!brandId) {
            toast.error('Brand ID is required');
            return;
          }
          await exportApi.getBrandById(brandId);
          toast.success(`Brand ${brandId} exported successfully`);
          break;
        case 'products':
          if (!brandId) {
            toast.error('Brand ID is required');
            return;
          }
          await exportApi.getBrandProducts(brandId);
          toast.success(`Brand ${brandId} products exported successfully`);
          break;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className={className}
      variant="outline"
      size="sm"
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? 'Exporting...' : 'Export'}
    </Button>
  );
} 