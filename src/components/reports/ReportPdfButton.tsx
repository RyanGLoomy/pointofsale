"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadReportPdf, type ReportPdfInput } from "@/lib/report-pdf"

type ReportPdfButtonProps = Omit<ReportPdfInput, "generatedAt">

export function ReportPdfButton({ windowDays, ...data }: ReportPdfButtonProps) {
  return (
    <Button
      type="button"
      onClick={() => downloadReportPdf({ ...data, windowDays, generatedAt: new Date() })}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Unduh PDF
    </Button>
  )
}
