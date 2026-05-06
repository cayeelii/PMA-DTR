import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportPreview({
  onBack,
  dtrRows = [],
  employee,
  department,
  signatory,
}) {
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  // Use the same full calendar  
  const reportRows = dtrRows;

  const tableData = reportRows.map((row) => [
    row.date,
    row.day,
    row.amIn,
    row.amOut,
    row.pmIn,
    row.pmOut,
    row.otIn,
    row.otOut,
  ]);

  const parseDate = (value) => {
    if (!value) return null;

    const parts = String(value).trim().split(/[/-]/);
    if (parts.length !== 3) return null;

    const month = Number(parts[0]);
    const day = Number(parts[1]);
    let year = Number(parts[2]);

    if (!month || !day || !year) return null;

    if (year < 100) {
      year += 2000;
    }

    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDateIso = (date) => {
    if (!date) return "-";

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getDateRange = () => {
    const validDates = reportRows
      .map((row) => parseDate(row.date))
      .filter(Boolean)
      .sort((a, b) => a - b);

    if (!validDates.length) {
      return {
        monthYear: "-",
        rangeText: "-",
      };
    }

    const first = validDates[0];
    const last = validDates[validDates.length - 1];

    return {
      monthYear: first.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
      rangeText: `${formatDateIso(first)} - ${formatDateIso(last)}`,
    };
  };

  const formatDateForOneColumn = (value) => {
    const parsed = parseDate(value);
    if (!parsed) return value || "";

    return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
  };

  const formatTimeForOneColumn = (value) => {
    if (!value) return "";

    const text = String(value).trim();
    if (!text || text === "-" || text === "--") return "";

    const match = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)?$/i);
    if (!match) return text;

    let hours = Number(match[1]);
    const minutes = match[2];
    const seconds = match[3] || "00";
    const suffix = match[4]?.toUpperCase();

    if (suffix === "AM" && hours === 12) hours = 0;
    else if (suffix === "PM" && hours !== 12) hours += 12;

    const twelveHour = ((hours + 11) % 12) + 1;
    const ampm = hours < 12 ? "AM" : "PM";
    return `${twelveHour}:${minutes}:${seconds} ${ampm}`;
  };

  const drawOneColumnHeader = (doc) => {
    const { monthYear, rangeText } = getDateRange();
    // A4: 210mm wide, 15mm margins → content from x=15 to x=195, center=105
    const M = 15;
    const R = 195;
    const CX = 105;

    doc.setLineWidth(0.4);
    doc.line(M, 13, R, 13);

    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.text(
      `DAILY TIME RECORD OF - ${String(monthYear).toUpperCase()}`,
      CX,
      19,
      { align: "center" },
    );

    doc.setLineWidth(0.25);
    doc.line(M, 21.5, R, 21.5);

    doc.setFont(undefined, "normal");
    doc.setFontSize(8.5);
    doc.text(`Statistics Date: ${rangeText}`, M, 25);
    doc.text(`Office: ${department?.name || "-"}`, R, 25, { align: "right" });

    doc.line(M, 27, R, 27);

    doc.text(`Name: ${employee?.name || "-"}`, R, 30.5, { align: "right" });

    doc.line(M, 32.5, R, 32.5);
  };

  const drawOneColumnSignatures = (doc) => {
    // Always pin signatures to the bottom of the LAST page
    const M = 15;
    const R = 195;
    const pageH = doc.internal.pageSize.getHeight();
    const FOOTER_BOTTOM = pageH - 12; // 12mm from page bottom edge

    // Signature block sits 22mm tall: line + name (–2) + label (+5) + padding
    const signatureY = FOOTER_BOTTOM - 10;

    const blockW = 60;
    const leftStart  = M + 10;
    const leftEnd    = leftStart + blockW;
    const rightStart = R - 10 - blockW;
    const rightEnd   = R - 10;

    doc.setLineWidth(0.3);
    doc.line(leftStart,  signatureY, leftEnd,  signatureY);
    doc.line(rightStart, signatureY, rightEnd, signatureY);

    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.text(
      employee?.name || "Employee",
      (leftStart + leftEnd) / 2,
      signatureY - 2,
      { align: "center" },
    );

    const supervisorName = signatory
      ? `${signatory.position || ""} ${signatory.head_name || ""}`.trim()
      : "";

    doc.text(supervisorName, (rightStart + rightEnd) / 2, signatureY - 2, {
      align: "center",
    });

    doc.setFont(undefined, "normal");
    doc.text("Employee Signature", (leftStart + leftEnd) / 2, signatureY + 5, {
      align: "center",
    });
    doc.text("Supervisor", (rightStart + rightEnd) / 2, signatureY + 5, {
      align: "center",
    });
  };

  //Export to XLSX
  const exportToXLSX = () => {
    const header = [
      ["Monthly Daily Time Record"],
      ["For the Month of"],
      [`Name: ${employee?.name || "-"}`],
      [`Office: ${department?.name || "-"}`],
      [],
    ];

    const tableHeader = [
      ["Date", "Day", "AM IN", "AM OUT", "PM IN", "PM OUT", "OT IN", "OT OUT"],
    ];

    const worksheetData = [...header, ...tableHeader, ...tableData];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "DTR");

    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];

    XLSX.writeFile(workbook, `${employee?.name || "DTR"}_Report.xlsx`);
  };

  //Export PDF
  const exportToPDF = (columnLayout = "1") => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // A4 = 210mm × 297mm, standard 15mm margins
      const PAGE_W = 210;
      const PAGE_H = 297;
      const MARGIN = 15;
      const CONTENT_W = PAGE_W - MARGIN * 2; // 180mm

      const pageWidth = PAGE_W;

      // Helper to convert time to military (24-hour) format (e.g., "08:30:00 AM" -> "08:30", "01:00:00 PM" -> "13:00")
      const formatTimeShort = (timeStr) => {
        if (!timeStr || timeStr === "-" || timeStr === "--") return "";
        const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?$/i);
        if (!match) return timeStr;

        let hours = Number(match[1]);
        const minutes = match[2];
        const suffix = match[3]?.toUpperCase();

        if (suffix === "AM" && hours === 12) hours = 0;
        else if (suffix === "PM" && hours !== 12) hours += 12;

        return `${String(hours).padStart(2, "0")}:${minutes}`;
      };

      // Helper function to draw a single DTR slip (used by 2-column layout)
      const drawDTRForm = (startX, width) => {
        const margin = 2.5; // tight inner padding to maximize usable width
        const centerX = startX + width / 2;
        const contentWidth = width - margin * 2; // ~100mm per slip

        // --- 1. Header Section ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text("Monthly Daily Time Record", centerX, 10, { align: "center" });

        doc.setFontSize(8.5);
        const { monthYear } = getDateRange();
        doc.text(`For the Month of ${monthYear.toUpperCase()}`, centerX, 15.5, { align: "center" });

        // --- 2. Identity Section ---
        doc.setLineWidth(0.1);
        doc.line(startX + margin, 18, startX + width - margin, 18);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(`Name: ${employee?.name?.toUpperCase() || "-"}`, startX + margin, 22.5);
        doc.text(`Dept / Office: ${department?.name || "-"}`, startX + margin, 27);

        doc.line(startX + margin, 29, startX + width - margin, 29);

        // --- 3. Table Header (AM/PM/OT grouped) ---
        const tableHeader = [
          [
            { content: "No/Day", colSpan: 2, rowSpan: 2, styles: { valign: "bottom", halign: "center" } },
            { content: "AM", colSpan: 2 },
            { content: "PM", colSpan: 2 },
            { content: "OT", colSpan: 2 },
          ],
          ["IN", "OUT", "IN", "OUT", "IN", "OUT"],
        ];

        // --- 4. Data Generation (31 rows) ---
        const rows = [];
        const daysArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        for (let i = 1; i <= 31; i++) {
          const dayNum = String(i).padStart(2, "0");
          const record = dtrRows.find((r) => {
            const d = parseDate(r.date);
            return d && d.getDate() === i;
          });

          let dayName = record?.day || "";
          if (!dayName && dtrRows.length > 0) {
            const firstDate = parseDate(dtrRows[0].date);
            if (firstDate) {
              const d = new Date(firstDate.getFullYear(), firstDate.getMonth(), i);
              dayName = daysArr[d.getDay()];
            }
          }

          rows.push([
            dayNum,
            dayName,
            formatTimeShort(record?.amIn),
            formatTimeShort(record?.amOut),
            formatTimeShort(record?.pmIn),
            formatTimeShort(record?.pmOut),
            formatTimeShort(record?.otIn),
            formatTimeShort(record?.otOut),
          ]);
        }

        autoTable(doc, {
          startY: 29,
          head: tableHeader,
          body: rows,
          margin: { left: startX + margin, right: PAGE_W - (startX + width - margin) },
          tableWidth: contentWidth,
          theme: "plain",
          styles: {
            fontSize: 8.5,
            cellPadding: 1.0,
            halign: "center",
            textColor: [0, 0, 0],
            font: "helvetica",
          },
          headStyles: {
            fillColor: [255, 255, 255],
            fontStyle: "bold",
          },
          columnStyles: {
            0: { halign: "center", cellWidth: 8  },  // No
            1: { halign: "left",   cellWidth: 12 },  // Day
          },
          didDrawCell: (data) => {
            doc.setLineWidth(0.1);
            doc.line(
              data.cell.x,
              data.cell.y + data.cell.height,
              data.cell.x + data.cell.width,
              data.cell.y + data.cell.height,
            );
          },
        });

        // --- 5. Signature Section (flows after table with spacing for actual signatures) ---
        const finalTableY = doc.lastAutoTable.finalY;

        // Employee sig line — 15mm gap after table (1.5cm)
        const empSigLineY = finalTableY + 15;
        doc.setLineWidth(0.3);
        doc.line(startX + margin + 3, empSigLineY, startX + width - margin - 3, empSigLineY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("EMPLOYEE SIGNATURE", centerX, empSigLineY + 4, { align: "center" });

        // Boss sig line — 17mm gap below employee label (1.7cm)
        const bossSigLineY = empSigLineY + 17;
        doc.setLineWidth(0.3);
        doc.line(startX + margin + 3, bossSigLineY, startX + width - margin - 3, bossSigLineY);

        // Boss name + position below the line
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        const bossName = signatory?.head_name?.toUpperCase() || "CAPT JOHN RONALD A MANGAHAS PN(GSC)";
        doc.text(bossName, centerX, bossSigLineY + 5, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        const bossPos = signatory?.position || "AC of S for Plans and Programs, MA5, PMA";
        doc.text(bossPos, centerX, bossSigLineY + 9.5, { align: "center" });

        // Dateprint row — 12mm below boss position (1.2cm)
        const datePrintY = bossSigLineY + 9.5 + 12;
        const dateStr = new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        doc.setFontSize(6.5);
        doc.text(`dateprint: ${dateStr}`, startX + margin, datePrintY);
        doc.text(`Page 1 of 1`, startX + width - margin, datePrintY, { align: "right" });
      };

      // --- EXECUTION LOGIC ---
      if (columnLayout === "2") {
        // Portrait A4, each slip = 105mm wide
        const SLIP_W = PAGE_W / 2; // 105mm

        drawDTRForm(0, SLIP_W);
        drawDTRForm(SLIP_W, SLIP_W);
      } else {
        // --- 1 COLUMN FORMAT: full width table (180mm content) ---
        const oneColumnHead = [["Date", "AM IN", "AM OUT", "PM IN", "PM OUT", "OT IN", "OT OUT"]];
        const oneColumnBody = reportRows.map((row) => [
          formatDateForOneColumn(row.date),
          formatTimeForOneColumn(row.amIn),
          formatTimeForOneColumn(row.amOut),
          formatTimeForOneColumn(row.pmIn),
          formatTimeForOneColumn(row.pmOut),
          formatTimeForOneColumn(row.otIn),
          formatTimeForOneColumn(row.otOut),
        ]);

        drawOneColumnHeader(doc);

        // Date col fixed, remaining 6 time cols split equally across remaining width
        const dateColW = 28;
        const timeColW = (CONTENT_W - dateColW) / 6; // ≈ 25.3mm each

        autoTable(doc, {
          startY: 35,
          head: oneColumnHead,
          body: oneColumnBody,
          margin: { left: MARGIN, right: MARGIN },
          tableWidth: CONTENT_W,
          styles: {
            fontSize: 8,
            cellPadding: 1.5,
            halign: "center",
            lineWidth: 0,
            lineColor: 0,
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: 0,
            fontStyle: "bold",
            lineWidth: 0,
            lineColor: 0,
          },
          bodyStyles: {
            lineWidth: 0,
            lineColor: 0,
          },
          columnStyles: {
            0: { halign: "left", cellWidth: dateColW },
            1: { cellWidth: timeColW },
            2: { cellWidth: timeColW },
            3: { cellWidth: timeColW },
            4: { cellWidth: timeColW },
            5: { cellWidth: timeColW },
            6: { cellWidth: timeColW },
          },
          theme: "plain",
          didDrawCell: (data) => {
            if (
              (data.section === "head" || data.section === "body") &&
              data.column.index === data.table.columns.length - 1
            ) {
              const y = data.cell.y + data.cell.height;
              doc.setLineWidth(0.2);
              doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
            }
          },
        });

        drawOneColumnSignatures(doc);
      }

      doc.save(`${employee?.name || "DTR"}_Report.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  const handleExportPDF = (columnLayout) => {
    setShowPdfOptions(false);
    exportToPDF(columnLayout);
  };

  console.log("SIGNATORY IN PREVIEW:", signatory);

  return (
    <div className="flex justify-center px-4">
      {/* Report Card */}
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-3">
          <div className="flex items-center gap-2">
            <button
              className="text-gray-500 hover:text-blue-900 p-1 rounded-full"
              onClick={onBack}
            >
              <ChevronLeft size={22} />
            </button>
            <span className="font-semibold text-lg">Report Preview</span>
            <span className="ml-2 text-xs text-gray-400">OMA1</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToXLSX}
              className="border border-green-600 text-green-600 px-4 py-1 rounded hover:bg-green-50 text-sm font-medium"
            >
              Export XLSX
            </button>
            <div className="relative">
              <button
                onClick={() => setShowPdfOptions((prev) => !prev)}
                className="border border-gray-400 text-gray-700 px-4 py-1 rounded hover:bg-gray-100 text-sm font-medium"
              >
                Export PDF
              </button>

              {showPdfOptions && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-20 p-2">
                  <p className="text-[11px] text-gray-500 mb-2 px-1">
                    Choose layout
                  </p>
                  <button
                    onClick={() => handleExportPDF("1")}
                    className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100"
                  >
                    1 Column
                  </button>
                  <button
                    onClick={() => handleExportPDF("2")}
                    className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100"
                  >
                    2 Columns
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Report Info */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex-1">
            <div className="text-center">
              <div className="text-sm font-medium">
                Monthly Daily Time Record
              </div>
              <div className="text-xs text-gray-500">
                For the Month of MARCH 2026
              </div>
            </div>
            <div className="text-xs mt-2">
              Name:{" "}
              <span className="font-semibold">{employee?.name || "—"}</span>
            </div>
          </div>
          <div className="text-xs">
            Office:{" "}
            <span className="font-semibold">{department?.name || "—"}</span>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-auto max-h-96 rounded-lg border border-gray-100">
          <table className="min-w-full text-xs border-separate border-spacing-0 rounded-xl overflow-hidden">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="px-4 py-2 text-left rounded-tl-lg">Date</th>
                <th className="px-4 py-2 text-left">Day</th>
                <th className="px-4 py-2 text-left">AM IN</th>
                <th className="px-4 py-2 text-left">AM OUT</th>
                <th className="px-4 py-2 text-left">PM IN</th>
                <th className="px-4 py-2 text-left">PM OUT</th>
                <th className="px-4 py-2 text-left">OT IN</th>
                <th className="px-4 py-2 text-left rounded-tr-lg">OT OUT</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 border-t border-gray-200 text-center text-gray-500"
                  >
                    No days with time entries to include in the report.
                  </td>
                </tr>
              ) : (
                reportRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 border-t border-gray-200 text-left font-medium text-gray-700">
                      {row.date}
                    </td>
                    <td className="px-4 py-2 border-t border-gray-200 text-left">
                      {row.day}
                    </td>
                    <td className="px-4 py-2 border-t border-gray-200 text-left">
                      {row.amIn}
                    </td>
                    <td className="px-4 py-2 border-t border-gray-200 text-left">
                      {row.amOut}
                    </td>
                    <td className="px-4 py-2 border-t border-gray-200 text-left">
                      {row.pmIn}
                    </td>
                    <td className="px-4 py-2 border-t border-gray-200 text-left">
                      {row.pmOut}
                    </td>
                    <td className="px-4 py-2 border-t border-gray-200 text-left">
                      {row.otIn}
                    </td>
                    <td className="px-4 py-2 border-t border-gray-200 text-left">
                      {row.otOut}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
